import { useState } from "react";
import "./index.css";

const API = "http://127.0.0.1:8000";

const samples = [
  {
    name: "Python missing module",
    language: "Python",
    log: "ModuleNotFoundError: No module named 'requests'",
  },
  {
    name: "Python undefined variable",
    language: "Python",
    log: "NameError: name 'user_name' is not defined",
  },
  {
    name: "JavaScript undefined value",
    language: "JavaScript",
    log: "TypeError: Cannot read properties of undefined (reading 'map')",
  },
];

export default function App() {
  const [log, setLog] = useState("");
  const [language, setLanguage] = useState("Auto-detect");
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function investigate(event) {
    event.preventDefault();
    if (!log.trim() || busy) return;

    setBusy(true);
    setError("");
    setReport(null);

    try {
      const response = await fetch(`${API}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ log: log.trim(), language }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Investigation failed.");
      }

      setReport(data);
    } catch (err) {
      setError(err.message || "Could not connect to the local backend.");
    } finally {
      setBusy(false);
    }
  }

  async function copyReport() {
    if (!report) return;

    const text = [
      "BUGSÉANCE INVESTIGATION REPORT",
      `Summary: ${report.summary}`,
      `Root cause: ${report.root_cause}`,
      `Severity: ${report.severity}`,
      `Confidence: ${report.confidence}%`,
      "",
      "Evidence:",
      ...report.evidence.map((item) => `- ${item}`),
      "",
      "Suggested fixes:",
      ...report.fixes.map((item, i) => `${i + 1}. ${item}`),
      "",
      report.spooky_line,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      alert("Investigation report copied.");
    } catch {
      setError("Clipboard access failed. Select and copy the report manually.");
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="#">☠ BUG<span>SÉANCE</span></a>
        <div className="live"><i /> LOCAL AI · GEMMA 4 E2B</div>
      </header>

      <section className="hero">
        <p className="eyebrow">THE DIGITAL AFTERLIFE OF SOFTWARE</p>
        <h1>Every bug leaves<br />a <em>ghost.</em></h1>
        <p className="subtitle">
          Summon the evidence. Question the stack trace.
          Let your local AI investigate what went wrong.
        </p>
        <div className="model-tag">✳ &nbsp; POWERED BY GEMMA 4 E2B / OLLAMA</div>
      </section>

      <section className="workspace">
        <div className="heading">
          <div>
            <p className="step">01 / THE SUMMONING</p>
            <h2>Present the evidence</h2>
          </div>
          <span className="muted-label">PRIVATE · LOCAL-FIRST</span>
        </div>

        <div className="samples">
          <span className="label">QUICK CASES</span>
          {samples.map((sample) => (
            <button
              key={sample.name}
              type="button"
              onClick={() => {
                setLog(sample.log);
                setLanguage(sample.language);
                setReport(null);
                setError("");
              }}
            >
              {sample.name}
            </button>
          ))}
        </div>

        <form onSubmit={investigate}>
          <div className="editor-header">
            <span className="window-dots">● ● ●</span>
            <span>evidence.log</span>
            <label className="upload">
              + Open log
              <input
                type="file"
                accept=".txt,.log,text/plain"
                hidden
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (!/\.(txt|log)$/i.test(file.name)) {
                    setError("Choose a .txt or .log file.");
                    return;
                  }
                  if (file.size > 20000) {
                    setError("The file must be 20 KB or smaller.");
                    return;
                  }
                  setLog(await file.text());
                  setReport(null);
                  setError("");
                  event.target.value = "";
                }}
              />
            </label>
          </div>

          <textarea
            value={log}
            onChange={(event) => setLog(event.target.value)}
            placeholder={"Paste a stack trace, crash log, or error message...\n\nThe machine remembers what happened."}
            maxLength={20000}
            spellCheck="false"
            aria-label="Error log"
          />

          <div className="editor-footer">
            <label className="language">
              <span>LANGUAGE</span>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
              >
                {["Auto-detect", "Python", "JavaScript", "TypeScript", "Java", "C / C++", "Other"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <span className="count">{log.length.toLocaleString()} / 20,000</span>
          </div>

          <button className="summon" type="submit" disabled={busy || !log.trim()}>
            {busy ? "✳ CONSULTING THE MACHINE..." : "✳  INVESTIGATE THE HAUNTING  →"}
          </button>
        </form>

        {error && <div className="error" role="alert">{error}</div>}

        {busy && (
          <div className="loading" role="status">
            <div className="orb">✳</div>
            <p className="step">ESTABLISHING CONNECTION</p>
            <h3>Listening to the machine...</h3>
            <p>Gemma is examining the evidence. The first investigation may take longer.</p>
          </div>
        )}

        {report && (
          <section className="report" aria-live="polite">
            <div className="heading">
              <div>
                <p className="step">02 / THE REVEAL</p>
                <h2>Investigation report</h2>
              </div>
              <button type="button" className="copy" onClick={copyReport}>COPY REPORT</button>
            </div>

            <div className="diagnosis">
              <div className="report-meta">
                <span className={`severity ${report.severity}`}>
                  {report.severity.toUpperCase()} SEVERITY
                </span>
                <span className="confidence">{report.confidence}% MODEL CONFIDENCE</span>
              </div>
              <h3>{report.summary}</h3>
              <p>{report.root_cause}</p>
            </div>

            <div className="report-grid">
              <article className="report-card">
                <p className="step">01 / CLUES FROM THE LOG</p>
                <h3>Evidence</h3>
                <ul>{report.evidence.map((item, i) => <li key={i}>{item}</li>)}</ul>
              </article>
              <article className="report-card">
                <p className="step">02 / RITUAL OF REPAIR</p>
                <h3>Suggested fixes</h3>
                <ol>{report.fixes.map((item, i) => <li key={i}>{item}</li>)}</ol>
              </article>
            </div>

            <blockquote>
              <span>THE MACHINE WHISPERS</span>
              “{report.spooky_line}”
            </blockquote>
            <p className="disclaimer">
              AI-generated diagnosis. Verify suggested changes before applying them.
              BugSéance never executes commands automatically.
            </p>
          </section>
        )}
      </section>

      <footer>
        <div className="skull">☠</div>
        <p>YOUR LOGS. YOUR MACHINE. YOUR RULES.</p>
        <span>OPEN-WEIGHT AI · LOCAL INFERENCE · NO CLOUD AI API</span>
        <p className="footnote">An independent open-source AI project.</p>
      </footer>
    </main>
  );
}
