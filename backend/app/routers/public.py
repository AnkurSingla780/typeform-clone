from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.form import FormDetailResponse
from app.schemas.response import ResponseSubmit, ResponseDetail
from app.services.form_service import form_service
from app.services.response_service import response_service

router = APIRouter(prefix="/public", tags=["public"])

@router.get("/forms/{slug}", response_model=FormDetailResponse)
def get_public_form(slug: str, db: Session = Depends(get_db)):
    form = form_service.get_form_by_slug(db, slug)
    if form.status != "published":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Form is not published or does not exist."
        )
    return form_service.get_form_detail(db, form.id)

@router.post("/forms/{slug}/responses", response_model=ResponseDetail)
def submit_public_response(slug: str, submission: ResponseSubmit, db: Session = Depends(get_db)):
    return response_service.submit_response(db, slug, submission)
