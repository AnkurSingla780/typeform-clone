from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.form import Form
from app.models.question import Question
from app.models.option import Option
from app.models.response import Response
from app.models.answer import Answer

def seed_database(db: Session):
    """
    Idempotent database seeder.
    Only seeds data if no forms exist.
    """
    # 1. Ensure default creator exists
    creator = db.query(User).filter(User.email == "creator@typeformclone.local").first()
    if not creator:
        creator = User(
            name="Alex Morgan",
            email="creator@typeformclone.local"
        )
        db.add(creator)
        db.flush()

    # Check if forms already exist
    existing_form_count = db.query(Form).count()
    if existing_form_count > 0:
        return

    # 2. Form 1: Customer Feedback (Published)
    form1 = Form(
        creator_id=creator.id,
        title="Customer Feedback",
        description="Help us improve our developer platform and user experience with your valuable feedback.",
        slug="customer-feedback",
        status="published",
        created_at=datetime.utcnow() - timedelta(days=5),
        updated_at=datetime.utcnow() - timedelta(hours=2)
    )
    db.add(form1)
    db.flush()

    q1_1 = Question(form_id=form1.id, title="What is your full name?", description="We'd love to know who we're talking to", type="short_text", position=0, required=True)
    q1_2 = Question(form_id=form1.id, title="What is your email address?", description="We'll only reach out if you need assistance", type="email", position=1, required=True)
    q1_3 = Question(form_id=form1.id, title="How satisfied are you with our product overall?", description="1 = Needs serious work, 5 = Absolutely loving it!", type="rating", position=2, required=True)
    q1_4 = Question(form_id=form1.id, title="Which core feature do you use most frequently?", description="Select the feature most central to your workflow", type="multiple_choice", position=3, required=True)
    q1_5 = Question(form_id=form1.id, title="How did you first discover our platform?", description="Help us understand our community growth", type="dropdown", position=4, required=False)
    q1_6 = Question(form_id=form1.id, title="Would you recommend us to a colleague or friend?", description="Your honest sentiment matters to us", type="yes_no", position=5, required=True)
    q1_7 = Question(form_id=form1.id, title="How many surveys or forms do you manage monthly?", description="Enter an approximate number", type="number", position=6, required=False)
    q1_8 = Question(form_id=form1.id, title="What is one thing we could build to make your life 10x easier?", description="Share your wildest feature ideas or frustrations", type="long_text", position=7, required=False)

    db.add_all([q1_1, q1_2, q1_3, q1_4, q1_5, q1_6, q1_7, q1_8])
    db.flush()

    # Options for Q1_4
    opt1_4 = [
        Option(question_id=q1_4.id, label="Drag & Drop Form Builder", position=0),
        Option(question_id=q1_4.id, label="Real-Time Analytics Dashboard", position=1),
        Option(question_id=q1_4.id, label="One-Question Respondent Flow", position=2),
        Option(question_id=q1_4.id, label="Export & Integrations", position=3),
    ]
    # Options for Q1_5
    opt1_5 = [
        Option(question_id=q1_5.id, label="Product Hunt Launch", position=0),
        Option(question_id=q1_5.id, label="Twitter / X Community", position=1),
        Option(question_id=q1_5.id, label="Colleague Recommendation", position=2),
        Option(question_id=q1_5.id, label="Search Engine (Google)", position=3),
        Option(question_id=q1_5.id, label="Tech Podcast / Blog", position=4),
    ]
    db.add_all(opt1_4 + opt1_5)
    db.flush()

    # Form 1 Responses
    sample_responses_form1 = [
        {
            "submitted_at": datetime.utcnow() - timedelta(days=3, hours=5),
            "answers": {
                q1_1.id: "Sarah Jenkins",
                q1_2.id: "sarah.jenkins@acmecorp.com",
                q1_3.id: "5",
                q1_4.id: "Drag & Drop Form Builder",
                q1_5.id: "Product Hunt Launch",
                q1_6.id: "Yes",
                q1_7.id: "12",
                q1_8.id: "The keyboard navigation in respondent mode is unmatched! Keep it speedy and clean.",
            }
        },
        {
            "submitted_at": datetime.utcnow() - timedelta(days=2, hours=1),
            "answers": {
                q1_1.id: "Marcus Chen",
                q1_2.id: "marcus@scaleup.io",
                q1_3.id: "4",
                q1_4.id: "Real-Time Analytics Dashboard",
                q1_5.id: "Colleague Recommendation",
                q1_6.id: "Yes",
                q1_7.id: "25",
                q1_8.id: "Would love automated webhook triggers when a user submits responses.",
            }
        },
        {
            "submitted_at": datetime.utcnow() - timedelta(days=1, hours=8),
            "answers": {
                q1_1.id: "Elena Rostova",
                q1_2.id: "elena.r@designcraft.co",
                q1_3.id: "5",
                q1_4.id: "One-Question Respondent Flow",
                q1_5.id: "Twitter / X Community",
                q1_6.id: "Yes",
                q1_7.id: "8",
                q1_8.id: "The conversational feel increased our completion rate from 24% to 68%. Incredible work!",
            }
        },
        {
            "submitted_at": datetime.utcnow() - timedelta(hours=14),
            "answers": {
                q1_1.id: "David Miller",
                q1_2.id: "dmiller@fintechpulse.com",
                q1_3.id: "4",
                q1_4.id: "Drag & Drop Form Builder",
                q1_5.id: "Search Engine (Google)",
                q1_6.id: "Yes",
                q1_7.id: "15",
                q1_8.id: "CSV exports work great, keep adding more chart types!",
            }
        },
        {
            "submitted_at": datetime.utcnow() - timedelta(hours=3),
            "answers": {
                q1_1.id: "Aisha Patel",
                q1_2.id: "aisha@growthstudio.dev",
                q1_3.id: "5",
                q1_4.id: "One-Question Respondent Flow",
                q1_5.id: "Tech Podcast / Blog",
                q1_6.id: "Yes",
                q1_7.id: "30",
                q1_8.id: "Smoothest form builder UI I've tested this year.",
            }
        },
    ]

    for item in sample_responses_form1:
        resp = Response(form_id=form1.id, submitted_at=item["submitted_at"])
        db.add(resp)
        db.flush()
        for q_id, val in item["answers"].items():
            ans = Answer(response_id=resp.id, question_id=q_id, value=val)
            db.add(ans)

    # 3. Form 2: Employee Satisfaction Survey (Published)
    form2 = Form(
        creator_id=creator.id,
        title="Employee Satisfaction Survey",
        description="Quarterly pulse check to measure employee happiness, culture, and team alignment.",
        slug="employee-satisfaction-survey",
        status="published",
        created_at=datetime.utcnow() - timedelta(days=7),
        updated_at=datetime.utcnow() - timedelta(days=1)
    )
    db.add(form2)
    db.flush()

    q2_1 = Question(form_id=form2.id, title="Which department are you a member of?", description="Helps group results accurately", type="dropdown", position=0, required=True)
    q2_2 = Question(form_id=form2.id, title="How would you rate work-life balance at the company?", description="1 = High burnout, 5 = Excellent balance", type="rating", position=1, required=True)
    q2_3 = Question(form_id=form2.id, title="What is your preferred working style?", description="Select your preferred mode", type="multiple_choice", position=2, required=True)
    q2_4 = Question(form_id=form2.id, title="Do you feel your voice and ideas are genuinely valued?", description="Anonymous and confidential", type="yes_no", position=3, required=True)
    q2_5 = Question(form_id=form2.id, title="How long have you been part of the organization?", description="Tenure bracket", type="dropdown", position=4, required=True)
    q2_6 = Question(form_id=form2.id, title="Any constructive suggestions to improve our workplace culture?", description="All comments are treated with complete confidentiality", type="long_text", position=5, required=False)

    db.add_all([q2_1, q2_2, q2_3, q2_4, q2_5, q2_6])
    db.flush()

    opt2_1 = [
        Option(question_id=q2_1.id, label="Engineering & Infrastructure", position=0),
        Option(question_id=q2_1.id, label="Product & Design", position=1),
        Option(question_id=q2_1.id, label="Marketing & Growth", position=2),
        Option(question_id=q2_1.id, label="Customer Success & Ops", position=3),
    ]
    opt2_3 = [
        Option(question_id=q2_3.id, label="Fully Remote", position=0),
        Option(question_id=q2_3.id, label="Hybrid (2-3 days office)", position=1),
        Option(question_id=q2_3.id, label="In-Office Full Time", position=2),
    ]
    opt2_5 = [
        Option(question_id=q2_5.id, label="Less than 6 months", position=0),
        Option(question_id=q2_5.id, label="6 months - 1 year", position=1),
        Option(question_id=q2_5.id, label="1 - 3 years", position=2),
        Option(question_id=q2_5.id, label="3+ years", position=3),
    ]
    db.add_all(opt2_1 + opt2_3 + opt2_5)
    db.flush()

    sample_responses_form2 = [
        {
            "submitted_at": datetime.utcnow() - timedelta(days=4),
            "answers": {
                q2_1.id: "Engineering & Infrastructure",
                q2_2.id: "4",
                q2_3.id: "Fully Remote",
                q2_4.id: "Yes",
                q2_5.id: "1 - 3 years",
                q2_6.id: "Investing more in async documentation has been tremendous for productivity.",
            }
        },
        {
            "submitted_at": datetime.utcnow() - timedelta(days=3),
            "answers": {
                q2_1.id: "Product & Design",
                q2_2.id: "5",
                q2_3.id: "Hybrid (2-3 days office)",
                q2_4.id: "Yes",
                q2_5.id: "6 months - 1 year",
                q2_6.id: "Love our design critiques and open collaborative atmosphere.",
            }
        },
        {
            "submitted_at": datetime.utcnow() - timedelta(days=1),
            "answers": {
                q2_1.id: "Marketing & Growth",
                q2_2.id: "4",
                q2_3.id: "Hybrid (2-3 days office)",
                q2_4.id: "Yes",
                q2_5.id: "Less than 6 months",
                q2_6.id: "Onboarding was very well organized.",
            }
        }
    ]

    for item in sample_responses_form2:
        resp = Response(form_id=form2.id, submitted_at=item["submitted_at"])
        db.add(resp)
        db.flush()
        for q_id, val in item["answers"].items():
            ans = Answer(response_id=resp.id, question_id=q_id, value=val)
            db.add(ans)

    # 4. Form 3: Product Launch Waitlist (Draft)
    form3 = Form(
        creator_id=creator.id,
        title="Product Launch Beta Waitlist",
        description="Early access registration for upcoming AI integrations.",
        slug="product-launch-beta",
        status="draft",
        created_at=datetime.utcnow() - timedelta(days=2),
        updated_at=datetime.utcnow() - timedelta(hours=5)
    )
    db.add(form3)
    db.flush()

    q3_1 = Question(form_id=form3.id, title="What is your work email?", description="We will send early invite tokens here", type="email", position=0, required=True)
    q3_2 = Question(form_id=form3.id, title="What best describes your current role?", description="Helps us tailor feature onboarding", type="multiple_choice", position=1, required=True)
    db.add_all([q3_1, q3_2])
    db.flush()

    opt3_2 = [
        Option(question_id=q3_2.id, label="Founder / Executive", position=0),
        Option(question_id=q3_2.id, label="Product Manager", position=1),
        Option(question_id=q3_2.id, label="Software Engineer", position=2),
        Option(question_id=q3_2.id, label="Designer", position=3),
    ]
    db.add_all(opt3_2)

    db.commit()
