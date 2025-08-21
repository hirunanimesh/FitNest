"use client"
import { useState, useEffect } from "react"

export default function MotivationQuotes() {
  const motivationQuotes = [
    "Every workout counts towards your goal!",
    "Consistency is the key to success!",
    "Your only limit is your mind!",
    "Push yourself because no one else will!"
  ];

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    setDisplayedText("");
    setCharIndex(0);
  }, [currentQuoteIndex]);

  useEffect(() => {
    if (charIndex < motivationQuotes[currentQuoteIndex].length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + motivationQuotes[currentQuoteIndex][charIndex]);
        setCharIndex(prev => prev + 1);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, currentQuoteIndex, motivationQuotes]);

  useEffect(() => {
    const quoteTimer = setTimeout(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % motivationQuotes.length);
    }, 10000);
    return () => clearTimeout(quoteTimer);
  }, [currentQuoteIndex, motivationQuotes.length]);

  return (
    <p
      className="text-5xl font-bold italic text-red-600 text-center"
      style={{
        background: "linear-gradient(90deg, #f87171 25%, #fca5a5 50%, #f87171 75%)",
        backgroundSize: "200% 100%",
        backgroundClip: "text",//inline
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        animation: "shine 2s linear infinite",
        fontFamily: "monospace",
      }}
    >
      {displayedText}
      <span className="animate-blink">|</span>
      <style jsx>{`
        .animate-blink {
          animation: blink 1s steps(2, start) infinite;
        }
        @keyframes blink {
          to {
            visibility: hidden;
          }
        }
        @keyframes shine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </p>
  );
}