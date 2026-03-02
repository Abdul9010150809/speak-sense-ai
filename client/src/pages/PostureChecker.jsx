export default function PostureChecker({
  postureFeedback,
  postureDebug,
  postureTuning,
  isPostureChecking,
  postureVideoRef,
  onRunPostureCheck,
  onSetPostureTuning,
  onResetPostureTuning
}) {
  return (
    <div className="posture-check-card" role="status" aria-live="polite">
      <div className="posture-check-header">
        <h3>🧍 Pre-Interview Posture Coach</h3>
        <button type="button" className="posture-check-btn" onClick={onRunPostureCheck} disabled={isPostureChecking}>
          {isPostureChecking ? "Checking…" : "Check My Posture"}
        </button>
      </div>
      <p className="posture-check-caption">Before starting, we check your camera framing and suggest ideal interview posture.</p>
      
      {postureFeedback.status === "checking" && (
        <div className="posture-status-row" style={{ justifyContent: "center" }}>
          <div className="fb-spinner" style={{ marginRight: "0.5rem" }} />
          <span className="posture-status-text">Analyzing your posture…</span>
        </div>
      )}
      
      {(postureFeedback.status === "ready" || postureFeedback.status === "error" || postureFeedback.status === "no-person") && (
        <div className="posture-status-row">
          {postureFeedback.score !== null && (
            <span className={`posture-score-chip ${postureFeedback.score >= 85 ? "score-excellent" : postureFeedback.score >= 70 ? "score-good" : "score-needs-work"}`}>
              Posture Score: {postureFeedback.score}/100
            </span>
          )}
          <span className="posture-status-text">{postureFeedback.statusMessage}</span>
        </div>
      )}

      <div className="posture-preview-wrap">
        <video ref={postureVideoRef} className="posture-preview-video" autoPlay playsInline muted />
        <div className="posture-preview-guide" aria-hidden="true"></div>
      </div>
      <ul>
        {(postureFeedback.tips.length ? postureFeedback.tips : ["Run posture check to get live guidance before interview starts."]).map((tip, index) => (
          <li key={`${tip}-${index}`}>✓ {tip}</li>
        ))}
      </ul>
    </div>
  );
}
