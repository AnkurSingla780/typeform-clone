from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel

class AnswerSubmit(BaseModel):
    question_id: int
    value: Optional[str] = None

class ResponseSubmit(BaseModel):
    answers: List[AnswerSubmit]

class AnswerDetail(BaseModel):
    id: int
    question_id: int
    question_title: str
    question_type: str
    value: Optional[str] = None

    class Config:
        from_attributes = True

class ResponseDetail(BaseModel):
    id: int
    form_id: int
    submitted_at: datetime
    answers: List[AnswerDetail]

    class Config:
        from_attributes = True

class QuestionStatistics(BaseModel):
    question_id: int
    title: str
    type: str
    required: bool
    total_answers: int
    breakdown: Dict[str, Any] = {}

class FormStatistics(BaseModel):
    form_id: int
    title: str
    status: str
    total_responses: int
    question_stats: List[QuestionStatistics] = []
