const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

// All interview routes are protected
router.use(protect);

// Get questions for interview
router.get("/questions", async (req, res) => {
  try {
    const { role, type, count } = req.query;
    
    // Forward to main app handler
    req.app.emit('get-questions', { role, type, count }, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create interview session
router.post("/session/create", async (req, res) => {
  try {
    const { jobRole, avatarId, avatarName } = req.body;
    const userId = req.user.id;
    
    // Forward to main app handler
    req.app.emit('create-session', { userId, jobRole, avatarId, avatarName }, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit answer
router.post("/submit-answer", async (req, res) => {
  try {
    // File upload is handled by multer in main app
    req.app.emit('submit-answer', req, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate feedback
router.post("/generate-feedback", async (req, res) => {
  try {
    const { sessionId } = req.body;
    req.app.emit('generate-feedback', { sessionId }, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get session details
router.get("/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    req.app.emit('get-session', { sessionId }, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user's interview history
router.get("/history", async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit, page } = req.query;
    req.app.emit('get-history', { userId, limit, page }, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete session
router.delete("/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    req.app.emit('delete-session', { sessionId }, res);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;