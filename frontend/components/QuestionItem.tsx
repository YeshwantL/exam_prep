"use client";
import { useState } from "react";

interface QuestionProps {
    question: string;
    answer: string;
    type: string;
    index: number;
}

export default function QuestionItem({ question, answer, type, index }: QuestionProps) {
    const [showAnswer, setShowAnswer] = useState(false);

    return (
        <div className="card question-card">
            <h3>Question {index + 1}</h3>
            <p className="text-lg mb-4">{question}</p>

            <button
                className="btn reveal-btn"
                onClick={() => setShowAnswer(!showAnswer)}
            >
                {showAnswer ? "Hide Answer" : "Show Answer"}
            </button>

            <div className={`answer ${showAnswer ? "visible" : ""}`}>
                <strong>Answer:</strong>
                <p>{answer}</p>
            </div>
        </div>
    );
}
