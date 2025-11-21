from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import shutil
from dotenv import load_dotenv
import google.generativeai as genai
from rag_engine import rag_engine

load_dotenv()

# Configure Gemini
api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

app = FastAPI(title="Exam Prep AI")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload directories exist
os.makedirs("uploads/books", exist_ok=True)
os.makedirs("uploads/syllabus", exist_ok=True)
os.makedirs("uploads/images", exist_ok=True)

class Question(BaseModel):
    question: str
    answer: str
    type: str 

@app.get("/")
def read_root():
    return {"message": "Exam Prep AI Backend is running"}

@app.post("/upload/book")
async def upload_book(file: UploadFile = File(...)):
    file_path = f"uploads/books/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Process PDF
    try:
        rag_engine.process_pdf(file_path, metadata={"source": file.filename, "type": "book"})
    except Exception as e:
        print(f"Error processing PDF: {e}")
        return {"filename": file.filename, "status": "error", "message": str(e)}
    
    return {"filename": file.filename, "status": "processed"}

@app.post("/upload/syllabus")
async def upload_syllabus(file: UploadFile = File(...)):
    file_path = f"uploads/syllabus/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": file.filename, "status": "uploaded"}

class GenerateRequest(BaseModel):
    syllabus_text: str
    num_questions: int = 5

@app.post("/generate-questions")
async def generate_questions(request: GenerateRequest):
    print(f"Received generation request for syllabus: {request.syllabus_text[:50]}...")
    if not api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not set")

    # 1. Retrieve relevant content
    try:
        relevant_docs = rag_engine.search(request.syllabus_text, k=5)
        print(f"Found {len(relevant_docs)} relevant documents")
        context = "\n".join(relevant_docs)
    except Exception as e:
        print(f"Error searching: {e}")
        context = "" # Fallback to just syllabus if search fails
    
    # 2. Generate questions using Gemini
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    prompt = f"""
    You are an expert exam setter. Based on the following syllabus and study material context, generate {request.num_questions} exam questions.
    
    Syllabus:
    {request.syllabus_text}
    
    Study Material Context:
    {context}
    
    First, evaluate if the provided Study Material Context covers the topics in the Syllabus.
    If the context is missing significant parts of the syllabus or is irrelevant, set "warning" to "The uploaded book does not appear to cover the syllabus topics adequately."
    Otherwise, set "warning" to null.

    Generate questions that test understanding of the syllabus topics using the provided context.
    For each question, provide the answer as well.
    
    Format the output as a JSON object with keys: 
    - "questions": list of objects with keys "question", "answer", "type"
    - "warning": string or null
    
    Do not include markdown formatting like ```json. Just the raw JSON string.
    """
    
    try:
        response = model.generate_content(prompt)
        print(f"LLM Response: {response.text}")
        
        content = response.text.strip()
        
        # Attempt to find JSON object using regex
        import re
        json_match = re.search(r"\{.*\}", content, re.DOTALL)
        if json_match:
            content = json_match.group(0)
            
        import json
        result = json.loads(content)
        print(f"Parsed result: {result}")
        return result
    except Exception as e:
        print(f"Error generating/parsing: {e}")
        return {" error": f"Failed to generate questions: {str(e)}"}

@app.post("/upload/image")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image of a question paper"""
    file_path = f"uploads/images/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": file.filename, "status": "uploaded", "path": file_path}

@app.post("/generate-from-image")
async def generate_from_image(file: UploadFile = File(...)):
    """Generate questions and answers from an uploaded image of a question paper"""
    print(f"Received image: {file.filename}")
    if not api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not set")
    
    try:
        # Save the image temporarily
        file_path = f"uploads/images/{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Use Gemini Vision to analyze the image
        from PIL import Image
        img = Image.open(file_path)
        
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        prompt = """
        Analyze this image of a question paper. Extract all the questions you can see.
        For each question, provide a detailed answer based on your knowledge.
        
        Format the output as a JSON object with keys:
        - "questions": list of objects with keys "question", "answer", "type"
        
        The "type" should be one of: "short", "long", "mcq", "numerical"
        
        Do not include markdown formatting like ```json. Just the raw JSON string.
        """
        
        response = model.generate_content([prompt, img])
        print(f"LLM Response: {response.text}")
        
        content = response.text.strip()
        
        # Extract JSON using regex
        import re
        import json
        json_match = re.search(r"\{.*\}", content, re.DOTALL)
        if json_match:
            content = json_match.group(0)
        
        result = json.loads(content)
        print(f"Parsed result: {result}")
        return result
        
    except Exception as e:
        print(f"Error processing image: {e}")
        return {"error": f"Failed to process image: {str(e)}"}

