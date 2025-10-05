"use client"
import React from "react"

type Props = {
  label?: string
  onClick: () => void
  ariaLabel?: string
}

export default function ReportButton({ label = "Report", onClick, ariaLabel = "Report" }: Props) {
  return (
    <button
      aria-label={ariaLabel}
      onClick={onClick}
      className="relative flex items-center gap-3 px-5 py-2 rounded-full bg-red-900 text-red-100 hover:bg-red-800 focus:outline-none"
      style={{
        boxShadow:
          "0 0 0 4px rgba(239, 68, 68, 0.06), inset 0 0 0 1px rgba(239,68,68,0.12)",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-red-300"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          d="M3 7l9-4 9 4v7a9 9 0 01-9 9 9 9 0 01-9-9V7z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 12.5l5 0"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-sm">{label}</span>
    </button>
  )
}
