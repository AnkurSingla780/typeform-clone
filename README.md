# Typeform Builder Clone

## Overview

Typeform Builder Clone is a full-stack form creation and survey collection platform that replicates the core workflows of Typeform. Creators can build, customize, reorder, and manage forms with a visual canvas and real-time settings inspector, while respondents enjoy a conversational, keyboard-accessible, one-question-at-a-time experience. Completed submissions are stored in SQLite and visualized via aggregated analytics and individual response views with CSV export capabilities.

---

## Features

- **Form Builder**:
  - Drag-and-drop question reordering as well as sequential arrow controls.
  - Interactive right-hand question inspector for editing titles, descriptions, question types, and required constraints.
  - Choice and dropdown option manager (add, edit, remove options).
  - Live modal preview to test form interaction without writing responses to the database.
- **Supported Question Types (9 types)**:
  1. `short_text`: Single-line text input with Enter navigation.
  2. `long_text`: Multi-line textarea (Shift+Enter for newline, Enter to proceed).
  3. `multiple_choice`: Choice selection with single-key shortcuts (`A`, `B`, `C`, `D` badges).
  4. `dropdown`: Select dropdown for categorized answers.
  5. `email`: Email input with email pattern validation.
  6. `number`: Numeric input with numeric validation.
  7. `yes_no`: Large toggle buttons with keyboard shortcuts (`Y` / `N`).
  8. `rating`: 1–5 star rating with mouse hover states and keyboard shortcut selection (`1`–`5`).
  9. `date`: ISO date input with date picker.
- **Form Management (CRUD & Lifecycle)**:
  - Create, view, update title (inline and modal), and delete forms with confirmation dialogues.
  - Form duplication (duplicates form metadata, questions, and all configured options).
  - Publish / Unpublish toggling (only published forms are accessible to public respondents; draft forms return 404).
  - Shareable public link modal with one-click copy to clipboard.
- **Public Respondent Flow**:
  - Conversational one-question-at-a-time transition flow at `/f/[slug]`.
  - Progress indicator bar and step counter (`Question X of Y`).
  - Smooth keyboard navigation (Enter, Arrow Up/Down, key shortcuts).
  - Client-side and server-side validation for required fields and data types.
  - Thank-you completion screen after submission.
- **Responses & Analytics**:
  - Form responses summary dashboard.
  - Question-by-question statistical breakdown (choice distribution percentages, average ratings, total answer counts).
  - Individual response inspector to view all answers submitted by a specific respondent.
  - CSV export for downloading submission data.
- **Seed Data**:
  - Automatic, idempotent database seeder that populates sample published and draft forms with realistic questions and responses.

---

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Backend
- **Framework**: Python 3.9+ / FastAPI
- **ORM**: SQLAlchemy
- **Server**: Uvicorn

### Database
- **Engine**: SQLite with foreign key constraints enabled

---

## Architecture

```
Frontend (Next.js App Router / React / TypeScript)
       │
       ▼
API Client Layer (`frontend/lib/api.ts`)
       │  (HTTP / JSON REST)
       ▼
FastAPI Routers (`backend/app/routers/`)
       │
       ▼
Service Layer (`backend/app/services/`)
       ├── form_service.py       (Form CRUD, slug generation, duplicate, publish)
       ├── question_service.py   (Question CRUD, reordering, options management)
       ├── validation_service.py (Field-level validation per question type)
       └── response_service.py   (Submission parsing, stats aggregation, exports)
       │
       ▼
SQLAlchemy ORM Models (`backend/app/models/`)
       │
       ▼
SQLite Database (`typeform.db`)
```

### Separation of Concerns
- **Routers**: Handle request routing, parameter extraction, and HTTP status codes.
- **Services**: Contain all domain logic, transaction handling, and business rules.
- **Models**: Define database schema, relationships, cascades, and constraints.
- **Schemas**: Handle input validation and response serialization with Pydantic v2.
- **Frontend Components**: Structured into builder components (`components/builder`), question renderers (`components/questions`), and generic UI elements (`components/ui`).

---

## Project Structure

```
typeform-clone/
├── backend/
│   ├── app/
│   │   ├── core/           # Config, database engine, session factory
│   │   ├── models/         # SQLAlchemy models (User, Form, Question, Option, Response, Answer)
│   │   ├── routers/        # FastAPI route handlers (forms, questions, public, responses)
│   │   ├── schemas/        # Pydantic schemas for requests and responses
│   │   ├── seed/           # Idempotent database seeder
│   │   ├── services/       # Domain business logic and validation
│   │   └── main.py         # FastAPI application entrypoint and lifespan hooks
│   ├── .env.example
│   ├── requirements.txt
│   └── typeform.db
├── frontend/
│   ├── app/
│   │   ├── f/[slug]/       # Public respondent form page
│   │   ├── forms/
│   │   │   ├── [id]/edit/  # 3-column form builder
│   │   │   ├── [id]/responses/ # Analytics, individual responses & CSV export
│   │   │   └── new/        # Standalone form creation
│   │   ├── layout.tsx      # Root layout with ToastProvider
│   │   └── page.tsx        # Dashboard with form list & stats
│   ├── components/
│   │   ├── builder/        # QuestionCanvas, QuestionPalette, QuestionSettings, TopNav, Preview
│   │   ├── questions/      # QuestionRenderer and individual question type components
│   │   └── ui/             # Reusable UI components (Modal, Toasts)
│   ├── context/            # ToastContext for global alerts
│   ├── lib/                # api.ts (REST client), types.ts (TypeScript definitions)
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

---

## Database Schema

The database uses SQLite with foreign key enforcement enabled (`PRAGMA foreign_keys=ON`).

```
┌──────────────┐       1:N      ┌──────────────┐       1:N      ┌──────────────┐
│    users     │───────────────▶│    forms     │───────────────▶│  questions   │
└──────────────┘                └──────────────┘                └──────────────┘
                                       │                               │
                                   1:N │                           1:N │
                                       ▼                               ▼
                                ┌──────────────┐       1:N      ┌──────────────┐
                                │  responses   │───────────────▶│   options    │
                                └──────────────┘                └──────────────┘
                                       │
                                   1:N │
                                       ▼
                                ┌──────────────┐
                                │   answers    │◀────────────── (references question_id)
                                └──────────────┘
```

### Table Details:
1. **`users`**: Form creators/owners.
   - `id` (PK, Integer), `name` (String), `email` (String, Unique), `created_at` (DateTime).
2. **`forms`**: Form configuration and metadata.
   - `id` (PK, Integer), `creator_id` (FK -> `users.id`), `title` (String), `description` (Text), `slug` (String, Unique), `status` (`published` | `draft`), `created_at` (DateTime), `updated_at` (DateTime).
3. **`questions`**: Individual form questions.
   - `id` (PK, Integer), `form_id` (FK -> `forms.id`, ON DELETE CASCADE), `title` (String), `description` (Text), `type` (String), `required` (Boolean), `position` (Integer), `created_at` (DateTime), `updated_at` (DateTime).
4. **`options`**: Selectable choices for `multiple_choice` and `dropdown` questions.
   - `id` (PK, Integer), `question_id` (FK -> `questions.id`, ON DELETE CASCADE), `label` (String), `position` (Integer).
5. **`responses`**: Form submission sessions.
   - `id` (PK, Integer), `form_id` (FK -> `forms.id`, ON DELETE CASCADE), `submitted_at` (DateTime).
6. **`answers`**: Individual answers stored within a response.
   - `id` (PK, Integer), `response_id` (FK -> `responses.id`, ON DELETE CASCADE), `question_id` (FK -> `questions.id`, ON DELETE CASCADE), `value` (Text).

---

## API Overview

All API endpoints are prefixed with `/api`.

### Forms
- `GET /api/forms`: List all forms for the default creator with question and response counts.
- `POST /api/forms`: Create a new form (body: `title`, `description`).
- `GET /api/forms/{id}`: Fetch detailed form data including questions and options.
- `PUT /api/forms/{id}`: Update form details (`title`, `description`, `status`).
- `DELETE /api/forms/{id}`: Delete a form and cascade delete its questions, options, responses, and answers.
- `POST /api/forms/{id}/duplicate`: Duplicate a form along with its questions and options.
- `POST /api/forms/{id}/publish`: Mark form status as `published`.
- `POST /api/forms/{id}/unpublish`: Revert form status to `draft`.

### Questions
- `POST /api/forms/{id}/questions`: Add a question to a form.
- `PUT /api/forms/{id}/questions/reorder`: Update question ordering positions (body: `question_ids`).
- `PUT /api/questions/{id}`: Update question attributes (`title`, `description`, `type`, `required`, `options`).
- `DELETE /api/questions/{id}`: Delete a question (automatically re-compacts positions of remaining questions).

### Public Respondent Endpoints
- `GET /api/public/forms/{slug}`: Fetch published form structure for respondents (returns 404 if draft or not found).
- `POST /api/public/forms/{slug}/responses`: Submit respondent answers for validation and persistence.

### Responses & Analytics
- `GET /api/forms/{id}/responses`: List all submissions for a given form.
- `GET /api/responses/{id}`: Fetch detailed answer breakdown for a single response.
- `GET /api/forms/{id}/statistics`: Get aggregate statistics (answer counts, option frequency, average ratings) per question.

---

## Setup & Running Locally

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+

### 1. Backend Setup

```bash
cd backend

# Create virtual environment (if not already present)
python3 -m venv .venv

# Activate virtual environment
# On macOS / Linux:
source .venv/bin/activate
# On Windows:
# .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server (runs on http://localhost:8000)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Next.js development server (runs on http://localhost:3000)
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

### Frontend (`frontend/.env.local` or environment)
```env
# Optional: defaults to http://localhost:8000/api if not set
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Backend (`backend/.env` or environment)
```env
# Optional: defaults to SQLite at ./typeform.db
DATABASE_URL=sqlite:///./typeform.db
# Optional: frontend origin for CORS
FRONTEND_URL=http://localhost:3000
```

---

## Seed Data

The project includes an automatic, idempotent seeder in `backend/app/seed/seed.py`:
- Runs automatically when the backend starts if no forms exist in the database.
- Seeds a default creator user (`creator@typeformclone.local`).
- Creates 3 sample forms:
  1. **Customer Feedback** (Published): 8 questions covering various question types, with 5 pre-populated realistic response submissions.
  2. **Employee Satisfaction Survey** (Published): 6 questions with 3 pre-populated response submissions.
  3. **Product Launch Beta Waitlist** (Draft): 2 questions, testing draft state protection.

---

## Design Decisions / Assumptions

1. **Authentication Scope**: Per the assignment requirements, a default creator account is utilized (`creator_id = 1`) to focus on form building, public respondent interaction, and response analytics without requiring login barriers.
2. **Public Access Model**: Only forms with `status = "published"` can be retrieved and submitted by the public respondent route `/f/[slug]`. Draft forms return a 404 response to public requests.
3. **Database Engine**: SQLite was chosen as requested in the assignment for zero-configuration, self-contained local persistence. Foreign key cascade deletes are explicitly enabled in SQLite connections.
4. **Validation Strategy**:
   - Client-side validation prevents empty submissions for required fields and formats input values (e.g. Email regex, Number boundaries, Date formats).
   - Server-side validation (`validation_service.py`) re-verifies required constraints, email formats, numeric conversions, yes/no values, rating ranges (1–5), and validates choice inputs against allowed options.
5. **Response Storage**: Answers are stored as text values associated with `response_id` and `question_id`, allowing flexible representation across text, numbers, choice labels, and dates.

---

## Future / Placeholder Features

The following items are natural extensions for production systems and are documented as potential roadmap additions:
- **Logic Jumps / Conditional Branching**: Displaying or skipping questions dynamically based on prior answers.
- **Third-Party Integrations**: Webhook delivery, Slack notifications, or Google Sheets synchronization on new submissions.
- **Team Collaboration & Multi-Tenancy**: Granular role-based permissions (Viewer, Editor, Admin) and workspaces.
- **Custom Themes & Styling**: User-defined custom color palettes, background images, and font selectors per form.
