import re
from typing import Optional, List
from fastapi import HTTPException, status
from app.models.question import Question

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

class ValidationService:
    @staticmethod
    def validate_answer(question: Question, value: Optional[str]) -> Optional[str]:
        """
        Validates an answer against the question's type, options, and required flag.
        Returns cleaned/normalized value or raises HTTPException with status 422.
        """
        trimmed = value.strip() if value is not None else ""
        is_empty = len(trimmed) == 0

        # Check required
        if question.required and is_empty:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Question '{question.title}' is required."
            )

        if is_empty:
            return None

        q_type = question.type.lower()

        if q_type == "email":
            if not EMAIL_REGEX.match(trimmed):
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Invalid email address provided for '{question.title}'."
                )
            return trimmed.lower()

        elif q_type == "number":
            try:
                float(trimmed)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Value for '{question.title}' must be a valid number."
                )
            return trimmed

        elif q_type == "yes_no":
            val_norm = trimmed.capitalize()
            if val_norm not in ["Yes", "No"]:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Value for '{question.title}' must be 'Yes' or 'No'."
                )
            return val_norm

        elif q_type == "rating":
            try:
                rating_int = int(trimmed)
                if not (1 <= rating_int <= 5):
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail=f"Rating for '{question.title}' must be between 1 and 5."
                    )
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Rating for '{question.title}' must be an integer between 1 and 5."
                )
            return str(rating_int)

        elif q_type in ["multiple_choice", "dropdown"]:
            valid_labels = [opt.label for opt in question.options]
            # If options exist, value must match one of the options
            if valid_labels and trimmed not in valid_labels:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Selected option '{trimmed}' is not valid for question '{question.title}'."
                )
        elif q_type == "date":
            # Expect YYYY-MM-DD or standard parseable date
            try:
                from datetime import date
                date.fromisoformat(trimmed)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Value for '{question.title}' must be a valid date in YYYY-MM-DD format."
                )
            return trimmed

        elif q_type in ["short_text", "long_text"]:
            return trimmed

        return trimmed

validation_service = ValidationService()
