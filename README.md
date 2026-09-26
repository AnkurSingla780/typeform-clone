# Typeform Builder Clone

A full-stack Typeform-inspired form builder and survey platform built for the **SDE Fullstack Assignment**.

Creators can build and manage forms using a visual builder, publish shareable forms, collect responses through a conversational one-question-at-a-time interface, and analyze submitted responses through statistics and individual response views.

## Live Demo

* **Frontend:** https://typeform-clone-steel.vercel.app/
* **GitHub:** https://github.com/AnkurSingla780/typeform-clone
* **Backend API:** https://typeform-clone-rpgx.onrender.com
* **API Documentation (Swagger):** https://typeform-clone-rpgx.onrender.com/docs
* **Backend Health Check:** https://typeform-clone-rpgx.onrender.com/health
* **Sample Published Form:** https://typeform-clone-steel.vercel.app/f/customer-feedback

> The frontend is deployed on Vercel and the FastAPI backend is deployed on Render.

---

## Overview

The application replicates the core Typeform workflow:

1. Create a form.
2. Add and configure questions.
3. Reorder questions.
4. Preview the form.
5. Publish the form.
6. Share the public form URL.
7. Collect responses.
8. View response statistics and individual submissions.
9. Export responses as CSV.

The application uses a **Next.js + TypeScript frontend**, **FastAPI backend**, **SQLAlchemy ORM**, and **SQLite database**.

---

# Features

## Form Builder

* Create new forms.
* Edit form title and description.
* Add questions from the question palette.
* Edit question titles and descriptions.
* Mark questions as required or optional.
* Delete questions.
* Reorder questions.
* Configure question options for choice-based questions.
* Live form preview.
* Toast notifications for user actions.
* Loading, empty, and error states.
* Debounced question autosave to avoid sending an API request for every keystroke.

## Supported Question Types

The application currently supports:

| Type              | Description                             |
| ----------------- | --------------------------------------- |
| `short_text`      | Single-line text input                  |
| `long_text`       | Multi-line text input                   |
| `multiple_choice` | Select one option from multiple choices |
| `dropdown`        | Select an option from a dropdown        |
| `email`           | Email input with validation             |
| `number`          | Numeric input with validation           |
| `yes_no`          | Yes/No selection                        |
| `rating`          | Rating from 1–5                         |
| `date`            | Date input                              |

## Form Management

* Create forms.
* Rename forms.
* Update form details.
* Delete forms with confirmation.
* Duplicate forms including their questions and configured options.
* Publish forms.
* Unpublish forms.
* Draft/published status.
* Shareable public form URLs.
* Copy share link to clipboard.
* Dashboard with response counts.
* Search and filtering.

## Public Respondent Experience

Published forms are available through:

```text
/f/[slug]
```

The respondent flow provides:

* One-question-at-a-time conversational interface.
* Progress indicator.
* Question counter.
* Smooth transitions.
* Keyboard navigation.
* Question-specific input controls.
* Required-field validation.
* Client-side validation.
* Server-side validation.
* Submission persistence.
* Thank-you completion screen.

Draft forms cannot be accessed through the public respondent route.

## Responses & Analytics

Creators can:

* View all submitted responses.
* Open an individual response.
* View answers question-by-question.
* View aggregate statistics.
* View answer counts.
* View option distributions.
* View average ratings.
* Export responses as CSV.

---

# Tech Stack

## Frontend

* **Next.js 16**
* **React**
* **TypeScript**
* **Tailwind CSS**
* **Lucide React**

## Backend

* **Python**
* **FastAPI**
* **SQLAlchemy**
* **Pydantic**
* **Uvicorn**

## Database

* **SQLite**
* Foreign-key constraints enabled.

## Deployment

* **Vercel** — Frontend
* **Render** — Backend API

---

# Architecture

```text
                    ┌─────────────────────────┐
                    │     Next.js Frontend    │
                    │ React + TypeScript      │
                    │ Tailwind CSS             │
                    └────────────┬────────────┘
                                 │
                                 │ HTTP / JSON
                                 ▼
                    ┌─────────────────────────┐
                    │      API Client         │
                    │ frontend/lib/api.ts     │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      FastAPI API        │
                    │       Routers           │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      Service Layer      │
                    │                         │
                    │ Form Service             │
                    │ Question Service         │
                    │ Response Service        │
                    │ Validation Service       │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │    SQLAlchemy ORM       │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │       SQLite DB         │
                    │      typeform.db        │
                    └─────────────────────────┘
```

## Separation of Concerns

### Routers

Handle:

* HTTP requests.
* Parameters.
* Request/response handling.
* HTTP status codes.

### Services

Contain:

* Business logic.
* Form operations.
* Question operations.
* Response processing.
* Validation.
* Statistics generation.

### Models

Define:

* Database tables.
* Relationships.
* Foreign keys.
* Cascade behavior.

### Schemas

Pydantic models handle:

* Request validation.
* Response serialization.
* API data structures.

### Frontend Components

The frontend is separated into:

```text
components/
├── builder/
├── questions/
└── ui/
```

---

# Project Structure

```text
typeform-clone/
│
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── database.py
│   │   │
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── form.py
│   │   │   ├── question.py
│   │   │   ├── option.py
│   │   │   ├── response.py
│   │   │   └── answer.py
│   │   │
│   │   ├── routers/
│   │   │   ├── forms.py
│   │   │   ├── questions.py
│   │   │   ├── public.py
│   │   │   └── responses.py
│   │   │
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── seed/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── app/
│   │   ├── f/[slug]/
│   │   ├── forms/
│   │   │   ├── new/
│   │   │   └── [id]/
│   │   │       ├── edit/
│   │   │       └── responses/
│   │   │
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── builder/
│   │   ├── questions/
│   │   └── ui/
│   │
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   ├── public/
│   └── package.json
│
├── .gitignore
└── README.md
```

---

# Database Schema

```text
users
  │
  │ 1:N
  ▼
forms
  │
  ├─────────────── 1:N ───────────────► questions
  │                                      │
  │                                      │ 1:N
  │                                      ▼
  │                                   options
  │
  │ 1:N
  ▼
responses
  │
  │ 1:N
  ▼
answers
```

## Main Tables

### `users`

Stores form creators.

```text
id
name
email
created_at
```

### `forms`

Stores form metadata.

```text
id
creator_id
title
description
slug
status
created_at
updated_at
```

`status` can be:

```text
draft
published
```

### `questions`

Stores individual form questions.

```text
id
form_id
title
description
type
required
position
created_at
updated_at
```

### `options`

Stores choices for multiple-choice and dropdown questions.

```text
id
question_id
label
position
```

### `responses`

Stores submitted response sessions.

```text
id
form_id
submitted_at
```

### `answers`

Stores individual answers.

```text
id
response_id
question_id
value
```

Foreign-key cascade deletion is used so deleting a form removes its associated questions, options, responses, and answers.

---

# API

All API routes use the `/api` prefix.

## Forms

```text
GET    /api/forms
POST   /api/forms
GET    /api/forms/{id}
PUT    /api/forms/{id}
DELETE /api/forms/{id}

POST   /api/forms/{id}/duplicate
POST   /api/forms/{id}/publish
POST   /api/forms/{id}/unpublish
```

## Questions

```text
POST   /api/forms/{id}/questions
PUT    /api/forms/{id}/questions/reorder

PUT    /api/questions/{id}
DELETE /api/questions/{id}
```

## Public Forms

```text
GET  /api/public/forms/{slug}
POST /api/public/forms/{slug}/responses
```

## Responses

```text
GET /api/forms/{id}/responses
GET /api/forms/{id}/statistics
GET /api/responses/{id}
```

Interactive API documentation is available through Swagger:

https://typeform-clone-rpgx.onrender.com/docs

---

# Local Development

## Prerequisites

* Node.js 18+
* npm
* Python 3.9+

## Backend

```bash
cd backend

python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend:

```text
http://localhost:8000
```

Swagger:

```text
http://localhost:8000/docs
```

## Frontend

Open another terminal:

```bash
cd frontend

npm install
npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

# Environment Variables

## Backend

Create `backend/.env` if required:

```env
DATABASE_URL=sqlite:///./typeform.db
FRONTEND_URL=http://localhost:3000
```

## Frontend

For local development, the API client can use the local backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

For the deployed application, the frontend communicates with the deployed Render backend:

```text
https://typeform-clone-rpgx.onrender.com/api
```

---

# Seed Data

The project includes an idempotent seed process.

Sample forms include:

### Customer Feedback

Published sample form containing mixed question types and sample responses.

### Employee Satisfaction Survey

Published survey with multiple question types and sample submissions.

### Product Launch Beta Waitlist

Draft form used to demonstrate draft-state protection.

The deployed demo includes seeded sample data.

---

# Deployment

## Frontend — Vercel

The Next.js application is deployed on Vercel.

```text
https://typeform-clone-steel.vercel.app/
```

The frontend project uses:

```text
Root Directory: frontend
Framework: Next.js
```

Deployment is connected to the GitHub repository and updates can be deployed from the `main` branch.

## Backend — Render

The FastAPI backend is deployed on Render.

```text
https://typeform-clone-rpgx.onrender.com
```

### Build Command

```bash
pip install -r backend/requirements.txt
```

### Start Command

```bash
cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Health Check

```text
/health
```

Health endpoint:

https://typeform-clone-rpgx.onrender.com/health

---

# Deployment Note

The deployed backend currently uses SQLite.

SQLite is appropriate for this assignment and demo because it requires no external database service. However, the free Render environment uses the service filesystem, so SQLite data should **not be considered production-grade persistent storage**. Data can be lost when the service is recreated or its filesystem is reset.

For a production deployment, SQLite would be replaced with a persistent database such as PostgreSQL.

---

# Validation

Validation is implemented at both frontend and backend levels.

## Client-Side

The frontend provides immediate feedback for:

* Required fields.
* Email format.
* Number input.
* Rating range.
* Valid choices.
* Other question-specific constraints.

## Server-Side

The backend independently validates submitted responses before persistence.

This includes:

* Required questions.
* Email format.
* Numeric values.
* Yes/No values.
* Rating range `1–5`.
* Valid multiple-choice options.
* Valid dropdown options.
* Date values.

Server-side validation ensures that public API requests cannot bypass frontend validation.

---

# Design Decisions

## Authentication

The assignment does not require creator authentication, so the application uses a default creator account rather than implementing a full authentication system.

This keeps the focus on the required form-building, respondent, and response-management workflows.

## Public Forms

Only forms marked as `published` are available through the public respondent interface.

Draft forms return a not-found response through the public API.

## SQLite

SQLite was selected because it was explicitly specified in the assignment and provides a zero-configuration database suitable for local development and demonstration.

## Response Storage

Answers are stored as text values associated with their response and question.

This allows the same response model to represent:

* Text answers
* Numbers
* Choice values
* Yes/No values
* Ratings
* Dates

---

# Performance / UX Considerations

The builder uses debounced autosaving for frequently edited text fields.

Instead of sending an API request for every keystroke while editing a question title or description, text changes are saved after a short debounce period.

This prevents unnecessary API traffic and reduces UI lag while typing.

The application also includes:

* Loading states.
* Empty states.
* Error states.
* Toast notifications.
* Confirmation dialogs.
* Responsive layouts.
* Keyboard navigation.
* Client/server validation.

---

# Testing & Verification

The project was tested during development across:

* Form creation.
* Form editing.
* Question creation.
* Question editing.
* Question deletion.
* Question reordering.
* Question autosave.
* Form duplication.
* Publish/unpublish.
* Public form submission.
* Required-field validation.
* Response persistence.
* Response statistics.
* Individual response viewing.
* CSV export.
* Frontend TypeScript compilation.

Frontend TypeScript verification:

```bash
npx --no-install tsc --noEmit
```

---

# Future Improvements

The following features are intentionally outside the current assignment scope or remain as potential extensions:

* Logic jumps / conditional branching.
* Webhook integrations.
* Slack/Google Sheets integrations.
* Creator authentication.
* Team collaboration.
* Multi-tenancy.
* Custom form themes.
* Advanced analytics.
* Persistent production database.
* Partial response recovery.
* File uploads.
* Dark mode.

---

# Assignment Scope

This project focuses on reproducing the core Typeform workflow:

```text
Create Form
     ↓
Build Questions
     ↓
Configure Questions
     ↓
Preview
     ↓
Publish
     ↓
Share Public Link
     ↓
Collect Responses
     ↓
View Analytics
     ↓
Inspect Individual Responses
     ↓
Export Data
```

The implementation prioritizes the core user experience, clean separation between frontend and backend, API-driven persistence, validation, and a functional end-to-end workflow.

---

## Repository

https://github.com/AnkurSingla780/typeform-clone

## Live Application

https://typeform-clone-steel.vercel.app/

## Backend API

https://typeform-clone-rpgx.onrender.com

## Swagger API Documentation

https://typeform-clone-rpgx.onrender.com/docs
