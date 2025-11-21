"use client";
import { useState, useEffect } from "react";
import { uploadBook, generateQuestions, generateFromImage } from "@/lib/api";
import QuestionItem from "@/components/QuestionItem";
import { useAuth } from "@/components/AuthProvider";

export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [syllabusText, setSyllabusText] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    // Skip auth check if Supabase is not configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
      return;
    }
    
    if (!authLoading && !user) {
      window.location.href = "/login";
    }
  }, [user, authLoading]);

  const handleBookUpload = async () => {
    if (!bookFile) return;
    setLoading(true);
    try {
      await uploadBook(bookFile);
      setUploadStatus("Book uploaded and processed successfully!");
    } catch (error) {
      console.error(error);
      setUploadStatus("Failed to upload book.");
    }
    setLoading(false);
  };

  const handleGenerate = async () => {
    if (!syllabusText) return;
    setLoading(true);
    setWarning(null);
    setQuestions([]);
    try {
      const res = await generateQuestions(syllabusText);
      if (res.error) {
        setWarning(`Error: ${res.error}`);
        return;
      }

      if (res.questions) {
        setQuestions(res.questions);
      }
      if (res.warning) {
        setWarning(res.warning);
      }
    } catch (error) {
      console.error(error);
      setWarning("An unexpected error occurred. Please check the console.");
    }
    setLoading(false);
  };

  const handleImageGenerate = async () => {
    if (!imageFile) return;
    setLoading(true);
    setWarning(null);
    setQuestions([]);
    try {
      const res = await generateFromImage(imageFile);
      if (res.error) {
        setWarning(`Error: ${res.error}`);
        return;
      }
      
      if (res.questions) {
        setQuestions(res.questions);
      }
    } catch (error) {
      console.error(error);
      setWarning("An unexpected error occurred. Please check the console.");
    }
    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="container">
      <div className="header">
        <div className="flex justify-between items-center">
          <div>
            <h1>Exam Prep AI</h1>
            <p>Upload your books, set the syllabus, and ace your exams.</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{user?.email}</span>
            <button onClick={signOut} className="btn">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>1. Upload Study Material</h2>
        <div className="input-group">
          <label>Select Book PDF</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setBookFile(e.target.files?.[0] || null)}
          />
        </div>
        <button
          className="btn"
          onClick={handleBookUpload}
          disabled={!bookFile || loading}
        >
          {loading ? "Processing..." : "Upload Book"}
        </button>
        {uploadStatus && <p className="mt-2 text-sm text-green-400">{uploadStatus}</p>}
      </div>

      <div className="card">
        <h2>2. Set Syllabus</h2>
        <div className="input-group">
          <label>Paste Syllabus Topics</label>
          <textarea
            rows={5}
            value={syllabusText}
            onChange={(e) => setSyllabusText(e.target.value)}
            placeholder="Enter topics, chapters, or paste the syllabus here..."
          />
        </div>
        <button
          className="btn"
          onClick={handleGenerate}
          disabled={!syllabusText || loading}
        >
          {loading ? "Generating..." : "Generate Questions"}
        </button>
      </div>

      <div className="card">
        <h2>3. Upload Question Paper Image (Optional)</h2>
        <p className="text-sm text-gray-400 mb-4">
          Upload an image of a previous year question paper to get questions and detailed answers.
        </p>
        <div className="input-group">
          <label>Select Question Paper Image</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
        </div>
        <button 
          className="btn" 
          onClick={handleImageGenerate}
          disabled={!imageFile || loading}
        >
          {loading ? "Analyzing..." : "Generate from Image"}
        </button>
      </div>

      {warning && (
        <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-200 p-4 rounded-lg mb-6">
          <strong>Warning:</strong> {warning}
        </div>
      )}

      {questions.length > 0 && (
        <div className="questions-section">
          <h2 className="text-2xl font-bold mb-4">Generated Questions</h2>
          {questions.map((q, i) => (
            <QuestionItem
              key={i}
              index={i}
              question={q.question}
              answer={q.answer}
              type={q.type}
            />
          ))}
        </div>
      )}
    </main>
  );
}
