const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://exam-prep-backend-a3ee.onrender.com";

export async function uploadBook(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_URL}/upload/book`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function uploadSyllabus(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_URL}/upload/syllabus`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function generateQuestions(syllabusText: string, numQuestions: number = 5) {
  const res = await fetch(`${API_URL}/generate-questions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ syllabus_text: syllabusText, num_questions: numQuestions }),
  });
  return res.json();
}

export async function generateFromImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_URL}/generate-from-image`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}
