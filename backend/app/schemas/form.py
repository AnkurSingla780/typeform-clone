from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.question import QuestionResponse

class FormBase(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = None

class FormCreate(FormBase):
    slug: Optional[str] = None

class FormUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None  # draft, published

class FormSummaryResponse(FormBase):
    id: int
    creator_id: int
    slug: str
    status: str
    response_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class FormDetailResponse(FormSummaryResponse):
    questions: List[QuestionResponse] = []

    class Config:
        from_attributes = True
