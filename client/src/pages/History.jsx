import { useState } from "react";
import { Link } from "react-router-dom";
import "./history.css";

export default function History() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedMonth, setSelectedMonth] = useState("all");

  // Mock data for interview history
  const interviewHistory = [
    {
      id: 1,
      role: "Frontend Developer",
      company: "Google",
      date: "2024-03-15",
      score: 85,
      status: "Completed",
      type: "Technical",
      difficulty: "Hard",
      feedback: "Strong performance in React and system design",
      strengths: ["React concepts", "Problem solving", "Communication"],
      improvements: ["Optimization techniques", "Time management"],
      duration: "45 min",
      interviewer: "Sarah Chen"
    },
    {
      id: 2,
      role: "Backend Developer",
      company: "Microsoft",
      date: "2024-03-10",
      score: 72,
      status: "Completed",
      type: "System Design",
      difficulty: "Medium",
      feedback: "Good database knowledge, needs more scalability practice",
      strengths: ["Database design", "API architecture"],
      improvements: ["Scalability concepts", "Caching strategies"],
      duration: "50 min",
      interviewer: "Michael Rodriguez"
    },
    {
      id: 3,
      role: "Full Stack Developer",
      company: "Amazon",
      date: "2024-03-05",
      score: 68,
      status: "Completed",
      type: "Mixed",
      difficulty: "Hard",
      feedback: "Frontend skills are solid, backend needs improvement",
      strengths: ["UI implementation", "Responsive design"],
      improvements: ["Backend optimization", "AWS services"],
      duration: "60 min",
      interviewer: "Emily Watson"
    },
    {
      id: 4,
      role: "Data Scientist",
      company: "Meta",
      date: "2024-02-28",
      score: 91,
      status: "Completed",
      type: "Technical",
      difficulty: "Hard",
      feedback: "Excellent statistical knowledge and ML concepts",
      strengths: ["Machine Learning", "Python", "Statistics"],
      improvements: ["System design", "Production deployment"],
      duration: "55 min",
      interviewer: "David Kim"
    },
    {
      id: 5,
      role: "DevOps Engineer",
      company: "Netflix",
      date: "2024-02-20",
      score: 76,
      status: "Completed",
      type: "Technical",
      difficulty: "Medium",
      feedback: "Good CI/CD knowledge, needs more cloud experience",
      strengths: ["Docker", "Kubernetes", "CI/CD pipelines"],
      improvements: ["AWS services", "Infrastructure as code"],
      duration: "50 min",
      interviewer: "Lisa Thompson"
    },
    {
      id: 6,
      role: "Product Manager",
      company: "Apple",
      date: "2024-02-15",
      score: 82,
      status: "Completed",
      type: "Behavioral",
      difficulty: "Medium",
      feedback: "Strong product sense and leadership skills",
      strengths: ["Product strategy", "User research", "Team leadership"],
      improvements: ["Technical depth", "Data analysis"],
      duration: "45 min",
      interviewer: "James Wilson"
    },
    {
      id: 7,
      role: "Frontend Developer",
      company: "Twitter",
      date: "2024-02-10",
      score: 64,
      status: "Completed",
      type: "Technical",
      difficulty: "Medium",
      feedback: "Good HTML/CSS, needs more JavaScript practice",
      strengths: ["UI/UX implementation", "CSS animations"],
      improvements: ["JavaScript concepts", "Performance optimization"],
      duration: "40 min",
      interviewer: "Alex Morgan"
    },
    {
      id: 8,
      role: "Backend Developer",
      company: "Uber",
      date: "2024-02-05",
      score: 88,
      status: "Completed",
      type: "System Design",
      difficulty: "Hard",
      feedback: "Excellent system design and scalability knowledge",
      strengths: ["Distributed systems", "Database optimization"],
      improvements: ["Microservices", "Message queues"],
      duration: "55 min",
      interviewer: "Rachel Green"
    }
  ];

  // Calculate statistics
  const totalInterviews = interviewHistory.length;
  const averageScore = Math.round(interviewHistory.reduce((acc, curr) => acc + curr.score, 0) / totalInterviews);
  const bestScore = Math.max(...interviewHistory.map(i => i.score));
  const recentInterviews = interviewHistory.filter(i => {
    const date = new Date(i.date);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  }).length;

  // Filter interviews
  const filteredInterviews = interviewHistory.filter(interview => {
    if (selectedFilter !== "all" && interview.type.toLowerCase() !== selectedFilter) return false;
    if (selectedMonth !== "all") {
      const interviewMonth = new Date(interview.date).getMonth() + 1;
      if (interviewMonth.toString() !== selectedMonth) return false;
    }
    return true;
  });

  // Get unique months for filter
  const months = [...new Set(interviewHistory.map(i => {
    const date = new Date(i.date);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }))].sort().reverse();

  const getScoreColor = (score) => {
    if (score >= 85) return "#48bb78";
    if (score >= 70) return "#f6ad55";
    return "#f56565";
  };

  const getScoreLabel = (score) => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 60) return "Average";
    return "Needs Practice";
  };

  return (
    <div className="history-page">
      {/* Background Elements */}
      <div className="history-bg">
        <div className="bg-grid"></div>
        <div className="bg-glow glow-1"></div>
        <div className="bg-glow glow-2"></div>
        <div className="bg-glow glow-3"></div>
      </div>

      <div className="history-container">
        {/* Header */}
        <div className="history-header">
          <Link to="/dashboard" className="back-link">
            <span className="back-icon">←</span>
            Back to Dashboard
          </Link>
          <h1>Interview History</h1>
          <div className="header-actions">
            <button className="export-btn" onClick={() => window.print()}>
              <span>📊</span>
              Export History
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-details">
              <span className="stat-label">Total Interviews</span>
              <span className="stat-value">{totalInterviews}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-details">
              <span className="stat-label">Average Score</span>
              <span className="stat-value">{averageScore}%</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-details">
              <span className="stat-label">Best Score</span>
              <span className="stat-value">{bestScore}%</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-details">
              <span className="stat-label">Last 30 Days</span>
              <span className="stat-value">{recentInterviews}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Filter by Type:</label>
            <select 
              className="filter-select"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="all">All Interviews</option>
              <option value="technical">Technical</option>
              <option value="system design">System Design</option>
              <option value="behavioral">Behavioral</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Filter by Month:</label>
            <select 
              className="filter-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="all">All Months</option>
              {months.map(month => (
                <option key={month} value={month.split('-')[1]}>
                  {new Date(month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Interviews List */}
        <div className="interviews-list">
          {filteredInterviews.length > 0 ? (
            filteredInterviews.map((interview) => (
              <div key={interview.id} className="interview-card">
                <div className="interview-header">
                  <div className="interview-title">
                    <h3>{interview.role}</h3>
                    <span className="company-name">{interview.company}</span>
                  </div>
                  <div className="interview-score" style={{ background: getScoreColor(interview.score) }}>
                    <span className="score-value">{interview.score}</span>
                    <span className="score-label">{getScoreLabel(interview.score)}</span>
                  </div>
                </div>

                <div className="interview-details">
                  <div className="detail-row">
                    <span className="detail-icon">📅</span>
                    <span className="detail-text">{new Date(interview.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">⏱️</span>
                    <span className="detail-text">{interview.duration}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">🎯</span>
                    <span className="detail-text">{interview.type}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">📊</span>
                    <span className="detail-text">Difficulty: {interview.difficulty}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">👤</span>
                    <span className="detail-text">Interviewer: {interview.interviewer}</span>
                  </div>
                </div>

                <div className="interview-feedback">
                  <p className="feedback-text">"{interview.feedback}"</p>
                </div>

                <div className="interview-strengths">
                  <h4>✓ Strengths</h4>
                  <div className="tags">
                    {interview.strengths.map((strength, index) => (
                      <span key={index} className="tag strength-tag">{strength}</span>
                    ))}
                  </div>
                </div>

                <div className="interview-improvements">
                  <h4>⚡ Areas for Improvement</h4>
                  <div className="tags">
                    {interview.improvements.map((improvement, index) => (
                      <span key={index} className="tag improvement-tag">{improvement}</span>
                    ))}
                  </div>
                </div>

                <div className="interview-actions">
                  <Link to={`/feedback/${interview.id}`} className="view-details-btn">
                    View Full Feedback →
                  </Link>
                  <Link to={`/planning?role=${encodeURIComponent(interview.role)}`} className="practice-again-btn">
                    Practice Again
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="no-interviews">
              <span className="no-data-icon">📭</span>
              <h3>No Interviews Found</h3>
              <p>Try adjusting your filters or start a new interview</p>
              <Link to="/planning" className="start-new-btn">
                Start New Interview
              </Link>
            </div>
          )}
        </div>

        {/* Performance Summary */}
        {filteredInterviews.length > 0 && (
          <div className="performance-summary">
            <h2>Performance Summary</h2>
            <div className="summary-stats">
              <div className="summary-item">
                <span className="summary-label">Interviews Completed</span>
                <span className="summary-value">{filteredInterviews.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Average Score</span>
                <span className="summary-value">
                  {Math.round(filteredInterviews.reduce((acc, curr) => acc + curr.score, 0) / filteredInterviews.length)}%
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Best Performance</span>
                <span className="summary-value">
                  {Math.max(...filteredInterviews.map(i => i.score))}%
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Most Attempted Role</span>
                <span className="summary-value">
                  {Object.entries(filteredInterviews.reduce((acc, curr) => {
                    acc[curr.role] = (acc[curr.role] || 0) + 1;
                    return acc;
                  }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="history-footer">
          <Link to="/dashboard" className="secondary-btn">
            Back to Dashboard
          </Link>
          <Link to="/planning" className="primary-btn">
            Start New Interview
          </Link>
        </div>
      </div>
    </div>
  );
}