# Exam Prep AI

An AI-powered exam preparation tool that helps students study smarter. Upload study materials, input your syllabus, and get AI-generated questions with detailed answers.

## Features

- 📚 **PDF Book Upload & Analysis** - Upload study materials and process them with RAG
- 📝 **Syllabus-Based Question Generation** - Generate relevant questions based on your syllabus
- 🖼️ **Image Question Paper Analysis** - Upload images of previous year papers and get questions + answers
- 🔐 **Supabase Authentication** - Secure access control with email/password login
- 💡 **AI-Powered Answers** - Detailed answers for all generated questions

## Tech Stack

**Frontend:**
- Next.js 14
- React
- TypeScript
- Supabase Auth

**Backend:**
- FastAPI
- Python
- Google Gemini AI
- ChromaDB (Vector Store)
- PyPDF for PDF processing

## Setup Instructions

### Prerequisites

- Node.js 18+
- Python 3.9+
- Google Gemini API Key
- Supabase Account

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ionized-mare
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env`:
```
GOOGLE_API_KEY=your_google_api_key_here
SUPABASE_JWT_SECRET=your_supabase_jwt_secret_here
```

Run the backend:
```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Run the frontend:
```bash
npm run dev
```

### 4. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Get your Project URL and Anon Key from Settings → API
3. Add authorized users in Authentication → Users

## Usage

1. Visit `http://localhost:3000`
2. Login with your Supabase credentials
3. Upload a PDF book
4. Enter your syllabus topics
5. Generate questions or upload a question paper image
6. View questions and reveal answers

## Deployment

See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed deployment instructions.

**Recommended:**
- Frontend: Vercel
- Backend: Railway or Render

## License

MIT
