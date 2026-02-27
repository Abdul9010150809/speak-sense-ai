import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./interview.css";

export default function Interview() {
  const navigate = useNavigate();
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [showAvatarSelect, setShowAvatarSelect] = useState(true);
  const [permissions, setPermissions] = useState({ video: false, audio: false });
  const [useChat, setUseChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [interviewActive, setInterviewActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const videoRef = useRef(null);
  const chatContainerRef = useRef(null);
  const timerRef = useRef(null);

  // AI Avatars
  const avatars = [
    { id: 1, name: "Alex", gender: "male", role: "Technical Interviewer", avatar: "👨‍💼", color: "#4f9eff", bgColor: "linear-gradient(135deg, #0066cc, #004080)" },
    { id: 2, name: "Sarah", gender: "female", role: "HR Specialist", avatar: "👩‍💼", color: "#f687b3", bgColor: "linear-gradient(135deg, #d53f8c, #97266d)" },
    { id: 3, name: "Michael", gender: "male", role: "Senior Developer", avatar: "👨‍💻", color: "#48bb78", bgColor: "linear-gradient(135deg, #2f855a, #1e4b3c)" },
    { id: 4, name: "Emma", gender: "female", role: "Product Manager", avatar: "👩‍💼", color: "#9f7aea", bgColor: "linear-gradient(135deg, #6b46c1, #44337a)" }
  ];

  // Interview questions
  const questions = [
    { id: 1, question: "Tell me about yourself and your background." },
    { id: 2, question: "Why are you interested in this position?" },
    { id: 3, question: "Describe a challenging project you worked on." },
    { id: 4, question: "How do you handle pressure and deadlines?" },
    { id: 5, question: "Where do you see yourself in 5 years?" }
  ];

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Timer
  useEffect(() => {
    if (interviewActive) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [interviewActive]);

  // Request permissions
  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermissions({ video: true, audio: true });
      setUseChat(false);
    } catch (err) {
      console.log("Permission denied, using chat mode");
      setPermissions({ video: false, audio: false });
      setUseChat(true);
    }
  };

  // Start interview
  const startInterview = async (avatar) => {
    setSelectedAvatar(avatar);
    setShowAvatarSelect(false);
    await requestPermissions();
    setInterviewActive(true);
    
    // Add welcome message
    setMessages([
      {
        id: Date.now(),
        sender: "ai",
        message: `Hello! I'm ${avatar.name}, your ${avatar.role}. Let's begin your interview.`,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  // Send message
  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      sender: "user",
      message: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        sender: "ai",
        message: questions[currentQuestion].question,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, aiResponse]);
      
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      }
    }, 1000);
  };

  // Next question
  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  // End interview
  const endInterview = () => {
    setInterviewActive(false);
    clearInterval(timerRef.current);
    setShowResults(true);
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle controls
  const toggleMute = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getAudioTracks();
      tracks.forEach(track => track.enabled = isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getVideoTracks();
      tracks.forEach(track => track.enabled = isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="interview-page">
      {/* Background Elements */}
      <div className="interview-bg">
        <div className="bg-grid"></div>
        <div className="bg-glow glow-1"></div>
        <div className="bg-glow glow-2"></div>
      </div>

      <div className="interview-container">
        {/* Header */}
        <div className="interview-header">
          <Link to="/dashboard" className="back-link">
            <span className="back-icon">←</span>
            Back to Dashboard
          </Link>
          <h1>AI Mock Interview</h1>
          {interviewActive && (
            <div className="interview-timer">
              <span className="timer-icon">⏱️</span>
              <span className="timer-text">{formatTime(timeElapsed)}</span>
            </div>
          )}
        </div>

        {showAvatarSelect ? (
          /* Avatar Selection Screen */
          <div className="avatar-selection">
            <h2>Choose Your Interviewer</h2>
            <p>Select an AI avatar to conduct your interview</p>
            
            <div className="avatars-grid">
              {avatars.map(avatar => (
                <div
                  key={avatar.id}
                  className="avatar-card"
                  onClick={() => startInterview(avatar)}
                  style={{ background: avatar.bgColor }}
                >
                  <div className="avatar-icon-large">{avatar.avatar}</div>
                  <h3>{avatar.name}</h3>
                  <p className="avatar-role">{avatar.role}</p>
                  <button className="select-avatar-btn">Select</button>
                </div>
              ))}
            </div>
          </div>
        ) : showResults ? (
          /* Results Screen */
          <div className="results-screen">
            <div className="results-card">
              <div className="results-icon">🏆</div>
              <h2>Interview Completed!</h2>
              <p>Great job! Your interview has been analyzed.</p>
              
              <div className="results-stats">
                <div className="result-stat">
                  <span className="stat-label">Duration</span>
                  <span className="stat-value">{formatTime(timeElapsed)}</span>
                </div>
                <div className="result-stat">
                  <span className="stat-label">Questions</span>
                  <span className="stat-value">{questions.length}</span>
                </div>
                <div className="result-stat">
                  <span className="stat-label">Mode</span>
                  <span className="stat-value">{useChat ? 'Chat' : 'Video'}</span>
                </div>
              </div>

              <div className="results-actions">
                <Link to="/results" className="view-results-btn">
                  View Detailed Results →
                </Link>
                <button 
                  className="new-interview-btn"
                  onClick={() => {
                    setShowAvatarSelect(true);
                    setSelectedAvatar(null);
                    setMessages([]);
                    setCurrentQuestion(0);
                    setTimeElapsed(0);
                  }}
                >
                  New Interview
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Active Interview */
          <div className="interview-session">
            <div className="interview-main">
              {/* Video/Chat Area */}
              <div className="interview-area">
                {!useChat ? (
                  <div className="video-container">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted={isMuted}
                      className={isVideoOff ? 'video-off' : ''}
                    ></video>
                    
                    {isVideoOff && (
                      <div className="video-off-placeholder">
                        <span className="video-off-icon">📹</span>
                        <p>Camera is off</p>
                      </div>
                    )}

                    {/* AI Avatar Overlay */}
                    {selectedAvatar && (
                      <div className="ai-avatar-overlay">
                        <div className="ai-avatar-small">
                          <span className="avatar-emoji">{selectedAvatar.avatar}</span>
                        </div>
                        <div className="ai-status">
                          <span className="status-dot"></span>
                          <span>AI is speaking</span>
                        </div>
                      </div>
                    )}

                    {/* Video Controls */}
                    <div className="video-controls">
                      <button 
                        className={`control-btn ${isMuted ? 'active' : ''}`}
                        onClick={toggleMute}
                      >
                        {isMuted ? '🔇' : '🎤'}
                      </button>
                      <button 
                        className={`control-btn ${isVideoOff ? 'active' : ''}`}
                        onClick={toggleVideo}
                      >
                        {isVideoOff ? '📹' : '🎥'}
                      </button>
                      <button 
                        className="control-btn settings"
                        onClick={() => setUseChat(true)}
                      >
                        💬 Switch to Chat
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Chat Interface */
                  <div className="chat-container">
                    <div className="chat-header">
                      <div className="chat-avatar">
                        <span className="chat-avatar-icon">{selectedAvatar?.avatar}</span>
                        <div>
                          <h3>{selectedAvatar?.name}</h3>
                          <p>{selectedAvatar?.role}</p>
                        </div>
                      </div>
                      <button 
                        className="switch-video-btn"
                        onClick={() => setUseChat(false)}
                      >
                        📹 Switch to Video
                      </button>
                    </div>

                    <div className="chat-messages" ref={chatContainerRef}>
                      {messages.map(msg => (
                        <div
                          key={msg.id}
                          className={`message ${msg.sender === 'user' ? 'user-message' : 'ai-message'}`}
                        >
                          <div className="message-avatar">
                            {msg.sender === 'user' ? '👤' : selectedAvatar?.avatar}
                          </div>
                          <div className="message-content">
                            <div className="message-header">
                              <span className="message-sender">
                                {msg.sender === 'user' ? 'You' : selectedAvatar?.name}
                              </span>
                              <span className="message-time">{msg.timestamp}</span>
                            </div>
                            <p className="message-text">{msg.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={sendMessage} className="chat-input-form">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type your response..."
                        className="chat-input"
                      />
                      <button type="submit" className="send-btn">Send →</button>
                    </form>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="interview-sidebar">
                {/* Current Question */}
                <div className="current-question">
                  <h3>Current Question</h3>
                  <div className="question-box">
                    <p>{questions[currentQuestion].question}</p>
                  </div>
                  <div className="question-progress">
                    <span>Question {currentQuestion + 1} of {questions.length}</span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Interview Info */}
                <div className="interview-info">
                  <h3>Interview Details</h3>
                  <div className="info-item">
                    <span className="info-label">Interviewer:</span>
                    <span className="info-value">{selectedAvatar?.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Role:</span>
                    <span className="info-value">{selectedAvatar?.role}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Mode:</span>
                    <span className="info-value">{useChat ? 'Chat' : 'Video'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Duration:</span>
                    <span className="info-value">{formatTime(timeElapsed)}</span>
                  </div>
                </div>

                {/* Tips */}
                <div className="interview-tips">
                  <h3>Quick Tips</h3>
                  <ul>
                    <li>✓ Speak clearly and confidently</li>
                    <li>✓ Use the STAR method for behavioral questions</li>
                    <li>✓ Take your time to think before answering</li>
                    <li>✓ Maintain eye contact with the camera</li>
                  </ul>
                </div>

                {/* End Interview Button */}
                <button className="end-interview-btn" onClick={endInterview}>
                  End Interview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}