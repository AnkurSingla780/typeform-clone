from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class OptionBase(BaseModel):
    label: str
    position: Optional[int] = 0

class OptionCreate(OptionBase):
    pass

class OptionResponse(OptionBase):
    id: int
    question_id: int

    class Config:
        from_attributes = True

class QuestionBase(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    type: str  # short_text, long_text, multiple_choice, dropdown, email, number, yes_no, rating
    required: bool = False

class QuestionCreate(QuestionBase):
    position: Optional[int] = None
    options: Optional[List[OptionCreate]] = None

class QuestionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    required: Optional[bool] = None
    position: Optional[int] = None
    options: Optional[List[OptionCreate]] = None

class QuestionResponse(QuestionBase):
    id: int
    form_id: int
    position: int
    created_at: datetime
    updated_at: datetime
    options: List[OptionResponse] = []

    class Config:
        from_attributes = True

class QuestionReorderRequest(BaseModel):
    question_ids: List[int]
