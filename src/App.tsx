import { useState } from "react";
import "./App.css";
import {
  aiAnalyzePhoto,
  type AiAnalyzePhotoResponse,
} from "./lib/api";

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiAnalyzePhotoResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleTestClick() {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // Dummy data URL – backend only checks that it's a non-empty string.
      const response = await aiAnalyzePhoto(
        "data:image/png;base64,stub",
        { profile: "portrait" }
      );

      setResult(response);
      console.log("aiAnalyzePhoto response:", response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : String(err);
      setError(message);
      console.error("aiAnalyzePhoto error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="App" style={{ padding: "1.5rem", fontFamily: "system-ui" }}>
      <h1>Glowforge Portrait Engraver – Frontend</h1>
      <p>
        Temporary test harness to call the backend <code>ai-analyze-photo</code> stub.
      </p>

      <button onClick={handleTestClick} disabled={loading}>
        {loading ? "Calling backend…" : "Test aiAnalyzePhoto"}
      </button>

      {error && (
        <pre
          style={{
            marginTop: "1rem",
            padding: "0.75rem",
            border: "1px solid #f99",
            background: "#311",
            color: "#fdd",
            whiteSpace: "pre-wrap",
          }}
        >
          Error: {error}
        </pre>
      )}

      {result && (
        <pre
          style={{
            marginTop: "1rem",
            padding: "0.75rem",
            border: "1px solid #444",
            background: "#111",
            color: "#ddd",
            maxHeight: "300px",
            overflow: "auto",
            textAlign: "left",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;
