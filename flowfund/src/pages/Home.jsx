import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <main
        style={{
          textAlign: "center",
          padding: 24,
          maxWidth: 720,
        }}
      >
        {/* Title */}
        <h1
          style={{
            fontSize: 36,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            marginBottom: 12,
          }}
        >
          <span
            style={{
              background: "linear-gradient(90deg, #2563eb, #3b82f6)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Welcome to
          </span>
          <span style={{ color: "#6b7280" }}> FlowFundAI</span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 15,
            color: "#6b7280",
            lineHeight: 1.5,
            marginBottom: 20,
          }}
        >
          Track spending, discover patterns, and create your personalized budget
          roadmap with AI.
        </p>

        {/* Button */}
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            backgroundColor: "#2563eb",
            color: "#ffffff",
            border: "none",
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 500,
            borderRadius: 6,
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(37, 99, 235, 0.25)",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "#1d4ed8")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "#2563eb")
          }
        >
          Explore Dashboard
        </button>
      </main>
    </div>
  );
}
