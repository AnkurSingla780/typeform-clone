from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from app.models.form import Form
from app.models.question import Question
from app.models.option import Option
from app.schemas.question import QuestionCreate, QuestionUpdate

VALID_QUESTION_TYPES = [
    "short_text", "long_text", "multiple_choice", "dropdown",
    "email", "number", "yes_no", "rating", "date"
]

class QuestionService:
    @staticmethod
    def create_question(db: Session, form_id: int, q_in: QuestionCreate) -> Question:
        form = db.query(Form).filter(Form.id == form_id).first()
        if not form:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")

        if q_in.type not in VALID_QUESTION_TYPES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid question type: {q_in.type}")

        # If position is not specified, put it at the end
        if q_in.position is None:
            max_pos = db.query(func.max(Question.position)).filter(Question.form_id == form_id).scalar()
            position = (max_pos + 1) if max_pos is not None else 0
        else:
            position = q_in.position

        question = Question(
            form_id=form_id,
            title=q_in.title,
            description=q_in.description,
            type=q_in.type,
            position=position,
            required=q_in.required
        )
        db.add(question)
        db.flush()

        if q_in.options:
            for idx, opt in enumerate(q_in.options):
                opt_obj = Option(
                    question_id=question.id,
                    label=opt.label,
                    position=opt.position if opt.position is not None else idx
                )
                db.add(opt_obj)

        db.commit()
        db.refresh(question)
        return question

    @staticmethod
    def update_question(db: Session, question_id: int, q_in: QuestionUpdate) -> Question:
        question = db.query(Question).filter(Question.id == question_id).first()
        if not question:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

        if q_in.type is not None:
            if q_in.type not in VALID_QUESTION_TYPES:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid question type: {q_in.type}")
            question.type = q_in.type

        if q_in.title is not None:
            question.title = q_in.title
        if q_in.description is not None:
            question.description = q_in.description
        if q_in.required is not None:
            question.required = q_in.required
        if q_in.position is not None:
            question.position = q_in.position

        # Update options if provided
        if q_in.options is not None:
            # Remove existing options
            db.query(Option).filter(Option.question_id == question.id).delete()
            # Add new options
            for idx, opt in enumerate(q_in.options):
                opt_obj = Option(
                    question_id=question.id,
                    label=opt.label,
                    position=opt.position if opt.position is not None else idx
                )
                db.add(opt_obj)

        db.commit()
        db.refresh(question)
        return question

    @staticmethod
    def delete_question(db: Session, question_id: int) -> dict:
        question = db.query(Question).filter(Question.id == question_id).first()
        if not question:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
        form_id = question.form_id
        db.delete(question)
        db.commit()

        # Re-compact positions
        remaining = db.query(Question).filter(Question.form_id == form_id).order_by(Question.position).all()
        for idx, q in enumerate(remaining):
            q.position = idx
        db.commit()

        return {"message": "Question deleted successfully", "id": question_id}

    @staticmethod
    def reorder_questions(db: Session, form_id: int, question_ids: List[int]) -> List[Question]:
        form = db.query(Form).filter(Form.id == form_id).first()
        if not form:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")

        questions = db.query(Question).filter(Question.form_id == form_id).all()
        q_map = {q.id: q for q in questions}

        # Verify all provided question IDs belong to this form
        for q_id in question_ids:
            if q_id not in q_map:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Question ID {q_id} does not belong to form {form_id}"
                )

        # Update positions
        for new_pos, q_id in enumerate(question_ids):
            q_map[q_id].position = new_pos

        db.commit()
        # Return updated ordered list
        return db.query(Question).filter(Question.form_id == form_id).order_by(Question.position).all()

question_service = QuestionService()
