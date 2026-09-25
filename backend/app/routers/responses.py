from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.response import ResponseDetail
from app.services.response_service import response_service

router = APIRouter(prefix="/responses", tags=["responses"])

@router.get("/{response_id}", response_model=ResponseDetail)
def get_response(response_id: int, db: Session = Depends(get_db)):
    return response_service.get_response_by_id(db, response_id)
