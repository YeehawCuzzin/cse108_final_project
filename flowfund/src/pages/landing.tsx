export default function Landing() {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center relative">
        {/* Main content */}
        <div className="w-full max-w-4xl text-center px-6 py-20">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-amber-400 bg-clip-text text-transparent">
              Welcome to FlowFundAI
            </span>
          </h1>
  
          <p className="mt-4 text-sm text-zinc-500 max-w-xl mx-auto">
            Track spending, understand habits, and create a personalized financial roadmap powered by AI.
          </p>
  
          <button className="mt-8 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition">
            Explore Dashboard
          </button>
        </div>
  
        {/* Floating assistant button */}
        <button
          aria-label="Open AI assistant"
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-white shadow-md border border-zinc-200 hover:shadow-lg transition flex items-center justify-center"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <path d="M7 8h10M7 12h6M21 12c0 4.4-4 8-9 8a10 10 0 0 1-3.2-.5L3 21l1.7-4.3A7.5 7.5 0 0 1 3 12c0-4.4 4-8 9-8s9 3.6 9 8Z" />
          </svg>
        </button>
      </div>
    );
  }
  