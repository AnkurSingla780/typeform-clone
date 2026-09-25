from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.question import (
    QuestionCreate, QuestionUpdate, QuestionResponse, QuestionReorderRequest
)
from app.services.question_service import question_service

router = APIRouter(tags=["questions"])

@router.post("/forms/{form_id}/questions", response_model=QuestionResponse)
def create_question(form_id: int, q_in: QuestionCreate, db: Session = Depends(get_db)):
    return question_service.create_question(db, form_id, q_in)

@router.put("/forms/{form_id}/questions/reorder", response_model=List[QuestionResponse])
def reorder_questions(form_id: int, req: QuestionReorderRequest, db: Session = Depends(get_db)):
    return question_service.reorder_questions(db, form_id, req.question_ids)

@router.put("/questions/{question_id}", response_model=QuestionResponse)
def update_question(question_id: int, q_in: QuestionUpdate, db: Session = Depends(get_db)):
    return question_service.update_question(db, question_id, q_in)

@router.delete("/questions/{question_id}")
def delete_question(question_id: int, db: Session = Depends(get_db)):
    return question_service.delete_question(db, question_id)
