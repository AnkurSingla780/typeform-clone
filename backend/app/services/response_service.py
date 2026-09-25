from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from app.models.form import Form
from app.models.question import Question
from app.models.response import Response
from app.models.answer import Answer
from app.schemas.response import (
    ResponseSubmit, ResponseDetail, AnswerDetail,
    FormStatistics, QuestionStatistics
)
from app.services.validation_service import validation_service

class ResponseService:
    @staticmethod
    def submit_response(db: Session, form_slug: str, submission: ResponseSubmit) -> ResponseDetail:
        form = db.query(Form).filter(Form.slug == form_slug).first()
        if not form:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")

        if form.status != "published":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Form is not published and cannot accept responses."
            )

        questions = db.query(Question).filter(Question.form_id == form.id).all()
        q_map = {q.id: q for q in questions}

        # Index submitted answers by question_id
        submitted_answers_map: Dict[int, str] = {}
        for ans in submission.answers:
            if ans.question_id not in q_map:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Answer question ID {ans.question_id} does not belong to form '{form.title}'."
                )
            submitted_answers_map[ans.question_id] = ans.value

        # Validate all questions in the form
        cleaned_answers: List[Dict[str, Any]] = []
        for q in questions:
            raw_val = submitted_answers_map.get(q.id)
            cleaned_val = validation_service.validate_answer(q, raw_val)
            if cleaned_val is not None:
                cleaned_answers.append({
                    "question_id": q.id,
                    "value": cleaned_val,
                    "question_title": q.title,
                    "question_type": q.type
                })

        # Save response in transaction
        try:
            new_response = Response(
                form_id=form.id,
                submitted_at=datetime.utcnow()
            )
            db.add(new_response)
            db.flush()

            answer_records = []
            for item in cleaned_answers:
                ans_record = Answer(
                    response_id=new_response.id,
                    question_id=item["question_id"],
                    value=item["value"]
                )
                db.add(ans_record)
                db.flush()
                answer_records.append(AnswerDetail(
                    id=ans_record.id,
                    question_id=item["question_id"],
                    question_title=item["question_title"],
                    question_type=item["question_type"],
                    value=item["value"]
                ))

            db.commit()
            db.refresh(new_response)

            return ResponseDetail(
                id=new_response.id,
                form_id=new_response.form_id,
                submitted_at=new_response.submitted_at,
                answers=answer_records
            )
        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def get_form_responses(db: Session, form_id: int) -> List[ResponseDetail]:
        form = db.query(Form).filter(Form.id == form_id).first()
        if not form:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")

        responses = (
            db.query(Response)
            .filter(Response.form_id == form_id)
            .order_by(Response.submitted_at.desc())
            .all()
        )

        results = []
        for r in responses:
            ans_details = []
            for a in r.answers:
                q = a.question
                ans_details.append(AnswerDetail(
                    id=a.id,
                    question_id=a.question_id,
                    question_title=q.title if q else "Question",
                    question_type=q.type if q else "unknown",
                    value=a.value
                ))
            results.append(ResponseDetail(
                id=r.id,
                form_id=r.form_id,
                submitted_at=r.submitted_at,
                answers=ans_details
            ))
        return results

    @staticmethod
    def get_response_by_id(db: Session, response_id: int) -> ResponseDetail:
        r = db.query(Response).filter(Response.id == response_id).first()
        if not r:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Response not found")

        ans_details = []
        for a in r.answers:
            q = a.question
            ans_details.append(AnswerDetail(
                id=a.id,
                question_id=a.question_id,
                question_title=q.title if q else "Question",
                question_type=q.type if q else "unknown",
                value=a.value
            ))
        return ResponseDetail(
            id=r.id,
            form_id=r.form_id,
            submitted_at=r.submitted_at,
            answers=ans_details
        )

    @staticmethod
    def get_form_statistics(db: Session, form_id: int) -> FormStatistics:
        form = db.query(Form).filter(Form.id == form_id).first()
        if not form:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")

        total_responses = db.query(func.count(Response.id)).filter(Response.form_id == form_id).scalar() or 0
        questions = db.query(Question).filter(Question.form_id == form_id).order_by(Question.position).all()

        q_stats: List[QuestionStatistics] = []
        for q in questions:
            answers = db.query(Answer).filter(Answer.question_id == q.id).all()
            total_answers = len(answers)
            breakdown: Dict[str, Any] = {}

            if q.type in ["multiple_choice", "dropdown"]:
                # initialize counts for all defined options
                option_counts = {opt.label: 0 for opt in q.options}
                for a in answers:
                    if a.value in option_counts:
                        option_counts[a.value] += 1
                    elif a.value:
                        option_counts[a.value] = option_counts.get(a.value, 0) + 1
                breakdown = {
                    "counts": option_counts,
                    "percentages": {
                        k: round((v / total_answers * 100), 1) if total_answers > 0 else 0
                        for k, v in option_counts.items()
                    }
                }

            elif q.type == "yes_no":
                counts = {"Yes": 0, "No": 0}
                for a in answers:
                    val = a.value.capitalize() if a.value else ""
                    if val in counts:
                        counts[val] += 1
                breakdown = {
                    "counts": counts,
                    "percentages": {
                        k: round((v / total_answers * 100), 1) if total_answers > 0 else 0
                        for k, v in counts.items()
                    }
                }

            elif q.type == "rating":
                rating_counts = {str(i): 0 for i in range(1, 6)}
                rating_sum = 0
                valid_count = 0
                for a in answers:
                    if a.value and a.value in rating_counts:
                        rating_counts[a.value] += 1
                        rating_sum += int(a.value)
                        valid_count += 1
                avg_rating = round(rating_sum / valid_count, 2) if valid_count > 0 else 0
                breakdown = {
                    "counts": rating_counts,
                    "average": avg_rating,
                    "percentages": {
                        k: round((v / total_answers * 100), 1) if total_answers > 0 else 0
                        for k, v in rating_counts.items()
                    }
                }

            elif q.type == "number":
                num_vals = []
                for a in answers:
                    try:
                        if a.value is not None:
                            num_vals.append(float(a.value))
                    except ValueError:
                        pass
                avg_num = round(sum(num_vals) / len(num_vals), 2) if num_vals else 0
                breakdown = {
                    "average": avg_num,
                    "min": min(num_vals) if num_vals else 0,
                    "max": max(num_vals) if num_vals else 0,
                    "count": len(num_vals)
                }

            else:
                # Text / Email: list latest answer snippets
                sample_texts = [a.value for a in answers if a.value][-10:]
                breakdown = {
                    "sample_answers": sample_texts
                }

            q_stats.append(QuestionStatistics(
                question_id=q.id,
                title=q.title,
                type=q.type,
                required=q.required,
                total_answers=total_answers,
                breakdown=breakdown
            ))

        return FormStatistics(
            form_id=form.id,
            title=form.title,
            status=form.status,
            total_responses=total_responses,
            question_stats=q_stats
        )

response_service = ResponseService()
