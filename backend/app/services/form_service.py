import re
import secrets
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from app.models.form import Form
from app.models.question import Question
from app.models.option import Option
from app.models.response import Response
from app.schemas.form import FormCreate, FormUpdate, FormSummaryResponse, FormDetailResponse

def generate_slug(title: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9\s-]", "", title.lower())
    slug_part = re.sub(r"[\s_-]+", "-", cleaned).strip("-")
    if not slug_part:
        slug_part = "form"
    suffix = secrets.token_hex(3)
    return f"{slug_part}-{suffix}"

class FormService:
    @staticmethod
    def get_forms(db: Session, creator_id: int) -> List[FormSummaryResponse]:
        # Query forms with response counts
        forms = db.query(Form).filter(Form.creator_id == creator_id).order_by(Form.updated_at.desc()).all()
        results = []
        for form in forms:
            resp_count = db.query(func.count(Response.id)).filter(Response.form_id == form.id).scalar() or 0
            results.append(FormSummaryResponse(
                id=form.id,
                creator_id=form.creator_id,
                title=form.title,
                description=form.description,
                slug=form.slug,
                status=form.status,
                response_count=resp_count,
                created_at=form.created_at,
                updated_at=form.updated_at
            ))
        return results

    @staticmethod
    def get_form_by_id(db: Session, form_id: int) -> Form:
        form = db.query(Form).filter(Form.id == form_id).first()
        if not form:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
        return form

    @staticmethod
    def get_form_detail(db: Session, form_id: int) -> FormDetailResponse:
        form = FormService.get_form_by_id(db, form_id)
        resp_count = db.query(func.count(Response.id)).filter(Response.form_id == form.id).scalar() or 0
        return FormDetailResponse(
            id=form.id,
            creator_id=form.creator_id,
            title=form.title,
            description=form.description,
            slug=form.slug,
            status=form.status,
            response_count=resp_count,
            created_at=form.created_at,
            updated_at=form.updated_at,
            questions=form.questions
        )

    @staticmethod
    def get_form_by_slug(db: Session, slug: str) -> Form:
        form = db.query(Form).filter(Form.slug == slug).first()
        if not form:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
        return form

    @staticmethod
    def create_form(db: Session, creator_id: int, form_in: FormCreate) -> FormDetailResponse:
        slug = form_in.slug if form_in.slug else generate_slug(form_in.title)
        # Ensure slug uniqueness
        while db.query(Form).filter(Form.slug == slug).first():
            slug = generate_slug(form_in.title)

        form = Form(
            creator_id=creator_id,
            title=form_in.title,
            description=form_in.description,
            slug=slug,
            status="draft"
        )
        db.add(form)
        db.commit()
        db.refresh(form)
        return FormService.get_form_detail(db, form.id)

    @staticmethod
    def update_form(db: Session, form_id: int, form_in: FormUpdate) -> FormDetailResponse:
        form = FormService.get_form_by_id(db, form_id)
        if form_in.title is not None:
            form.title = form_in.title
        if form_in.description is not None:
            form.description = form_in.description
        if form_in.status is not None:
            if form_in.status not in ["draft", "published"]:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status")
            form.status = form_in.status

        db.commit()
        db.refresh(form)
        return FormService.get_form_detail(db, form.id)

    @staticmethod
    def delete_form(db: Session, form_id: int) -> dict:
        form = FormService.get_form_by_id(db, form_id)
        db.delete(form)
        db.commit()
        return {"message": "Form deleted successfully", "id": form_id}

    @staticmethod
    def duplicate_form(db: Session, form_id: int) -> FormDetailResponse:
        original = FormService.get_form_by_id(db, form_id)
        new_title = f"{original.title} (Copy)"
        new_slug = generate_slug(new_title)
        while db.query(Form).filter(Form.slug == new_slug).first():
            new_slug = generate_slug(new_title)

        new_form = Form(
            creator_id=original.creator_id,
            title=new_title,
            description=original.description,
            slug=new_slug,
            status="draft"
        )
        db.add(new_form)
        db.flush()

        # Copy questions and options
        for q in original.questions:
            new_q = Question(
                form_id=new_form.id,
                title=q.title,
                description=q.description,
                type=q.type,
                position=q.position,
                required=q.required
            )
            db.add(new_q)
            db.flush()

            for opt in q.options:
                new_opt = Option(
                    question_id=new_q.id,
                    label=opt.label,
                    position=opt.position
                )
                db.add(new_opt)

        db.commit()
        db.refresh(new_form)
        return FormService.get_form_detail(db, new_form.id)

    @staticmethod
    def publish_form(db: Session, form_id: int) -> FormDetailResponse:
        form = FormService.get_form_by_id(db, form_id)
        form.status = "published"
        db.commit()
        db.refresh(form)
        return FormService.get_form_detail(db, form.id)

    @staticmethod
    def unpublish_form(db: Session, form_id: int) -> FormDetailResponse:
        form = FormService.get_form_by_id(db, form_id)
        form.status = "draft"
        db.commit()
        db.refresh(form)
        return FormService.get_form_detail(db, form.id)

form_service = FormService()
