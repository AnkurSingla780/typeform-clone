from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.form import FormCreate, FormUpdate, FormSummaryResponse, FormDetailResponse
from app.schemas.response import ResponseDetail, FormStatistics
from app.services.form_service import form_service
from app.services.response_service import response_service

router = APIRouter(prefix="/forms", tags=["forms"])

def get_current_user_id(db: Session = Depends(get_db)) -> int:
    # Default creator user
    user = db.query(User).first()
    if not user:
        user = User(name="Default Creator", email="creator@typeformclone.local")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user.id

@router.get("", response_model=List[FormSummaryResponse])
def get_forms(db: Session = Depends(get_db), creator_id: int = Depends(get_current_user_id)):
    return form_service.get_forms(db, creator_id)

@router.post("", response_model=FormDetailResponse)
def create_form(form_in: FormCreate, db: Session = Depends(get_db), creator_id: int = Depends(get_current_user_id)):
    return form_service.create_form(db, creator_id, form_in)

@router.get("/{id}", response_model=FormDetailResponse)
def get_form(id: int, db: Session = Depends(get_db)):
    return form_service.get_form_detail(db, id)

@router.put("/{id}", response_model=FormDetailResponse)
def update_form(id: int, form_in: FormUpdate, db: Session = Depends(get_db)):
    return form_service.update_form(db, id, form_in)

@router.delete("/{id}")
def delete_form(id: int, db: Session = Depends(get_db)):
    return form_service.delete_form(db, id)

@router.post("/{id}/duplicate", response_model=FormDetailResponse)
def duplicate_form(id: int, db: Session = Depends(get_db)):
    return form_service.duplicate_form(db, id)

@router.post("/{id}/publish", response_model=FormDetailResponse)
def publish_form(id: int, db: Session = Depends(get_db)):
    return form_service.publish_form(db, id)

@router.post("/{id}/unpublish", response_model=FormDetailResponse)
def unpublish_form(id: int, db: Session = Depends(get_db)):
    return form_service.unpublish_form(db, id)

@router.get("/{id}/responses", response_model=List[ResponseDetail])
def get_form_responses(id: int, db: Session = Depends(get_db)):
    return response_service.get_form_responses(db, id)

@router.get("/{id}/statistics", response_model=FormStatistics)
def get_form_statistics(id: int, db: Session = Depends(get_db)):
    return response_service.get_form_statistics(db, id)
