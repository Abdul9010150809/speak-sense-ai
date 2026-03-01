const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Validation helper functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // Password must be at least 8 characters with uppercase, lowercase, number & special character
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
  return passwordRegex.test(password);
};

// @desc    Register user
// @route   POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      company, 
      jobTitle, 
      experience, 
      interests, 
      newsletter,
      preferredJobRoles,
      experienceLevel
    } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters with uppercase, lowercase, number & special character" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Parse name into first and last name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create user with enhanced profile
    const user = await User.create({
      name,
      email,
      password: hashed,
      profile: {
        firstName,
        lastName,
        phone: phone || '',
        title: jobTitle || '',
        bio: '',
        skills: interests || []
      },
      preferences: {
        preferredJobRoles: preferredJobRoles || [],
        experienceLevel: experienceLevel || 'entry',
        interviewTypes: ['technical', 'behavioral'],
        avatarPreference: 'Alex',
        language: 'en',
        notificationSettings: {
          emailNotifications: newsletter || false,
          interviewReminders: true
        }
      },
      // Keep these for backward compatibility
      phone: phone || '',
      company: company || '',
      jobTitle: jobTitle || '',
      experience: experience || '',
      interests: interests || [],
      newsletter: newsletter || false
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    // Return success without exposing password
    res.status(201).json({ 
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if account is locked
    if (user.isLocked && user.isLocked()) {
      return res.status(401).json({ 
        message: "Account is locked. Please try again later." 
      });
    }

    // Compare passwords
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      // Increment login attempts if the method exists
      if (user.incrementLoginAttempts) {
        await user.incrementLoginAttempts();
      }
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts !== undefined) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
    }
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    res.json({ 
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        preferences: user.preferences,
        stats: user.stats,
        profileCompletion: user.profileCompletion
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpire");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        preferences: user.preferences,
        stats: user.stats,
        profileCompletion: user.profileCompletion,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { profile, preferences } = req.body;

    // Update profile fields
    if (profile) {
      // Update name if firstName/lastName changed
      if (profile.firstName || profile.lastName) {
        user.name = `${profile.firstName || user.profile.firstName || ''} ${profile.lastName || user.profile.lastName || ''}`.trim();
      }
      
      user.profile = { ...user.profile.toObject(), ...profile };
    }
    
    if (preferences) {
      user.preferences = { ...user.preferences.toObject(), ...preferences };
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        preferences: user.preferences,
        profileCompletion: user.profileCompletion
      }
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Update user preferences
// @route   PUT /api/auth/preferences
router.put("/preferences", protect, async (req, res) => {
  try {
    const { preferredJobRoles, experienceLevel, interviewTypes, avatarPreference, language, notificationSettings } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update preferences
    if (preferredJobRoles) user.preferences.preferredJobRoles = preferredJobRoles;
    if (experienceLevel) user.preferences.experienceLevel = experienceLevel;
    if (interviewTypes) user.preferences.interviewTypes = interviewTypes;
    if (avatarPreference) user.preferences.avatarPreference = avatarPreference;
    if (language) user.preferences.language = language;
    if (notificationSettings) {
      user.preferences.notificationSettings = {
        ...user.preferences.notificationSettings,
        ...notificationSettings
      };
    }

    await user.save();

    res.json({
      success: true,
      message: "Preferences updated successfully",
      preferences: user.preferences
    });
  } catch (error) {
    console.error("Preferences update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
router.put("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate new password
    if (!validatePassword(newPassword)) {
      return res.status(400).json({ 
        message: "New password must be at least 8 characters with uppercase, lowercase, number & special character" 
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check current password
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash and update new password
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Update interview statistics
// @route   POST /api/auth/update-stats
router.post("/update-stats", protect, async (req, res) => {
  try {
    const { score, duration, strengths, improvements } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update statistics if the method exists
    if (user.updateInterviewStats) {
      await user.updateInterviewStats(score, duration, strengths, improvements);
    } else {
      // Manual update if method doesn't exist
      user.stats.totalInterviews += 1;
      user.stats.interviewsCompleted += 1;
      user.stats.totalPracticeTime += duration || 0;
      user.stats.lastInterviewDate = new Date();
      
      // Update average score
      const totalScore = (user.stats.averageScore * (user.stats.totalInterviews - 1) + score) / user.stats.totalInterviews;
      user.stats.averageScore = Math.round(totalScore);
      
      // Update strengths and improvements
      if (strengths && strengths.length) {
        user.stats.strengths = [...new Set([...user.stats.strengths, ...strengths])].slice(0, 10);
      }
      
      if (improvements && improvements.length) {
        user.stats.areasForImprovement = [...new Set([...user.stats.areasForImprovement, ...improvements])].slice(0, 10);
      }
      
      await user.save();
    }

    res.json({
      success: true,
      message: "Statistics updated successfully",
      stats: user.stats
    });
  } catch (error) {
    console.error("Stats update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get user interview history
// @route   GET /api/auth/interview-history
router.get("/interview-history", protect, async (req, res) => {
  try {
    // This would typically come from a separate InterviewSession model
    // For now, return stats
    const user = await User.findById(req.user.id).select("stats");
    
    res.json({
      success: true,
      stats: user.stats
    });
  } catch (error) {
    console.error("Interview history error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET + user.password, 
      { expiresIn: "10m" }
    );

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 600000; // 10 minutes
    await user.save();

    // In production, send email with reset link
    // For development, return token
    res.json({
      success: true,
      message: "Password reset email sent",
      // Remove resetToken in production
      resetToken
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Reset password with token
// @route   POST /api/auth/reset-password/:token
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Validate new password
    if (!validatePassword(newPassword)) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters with uppercase, lowercase, number & special character" 
      });
    }

    // Find user by reset token and check if token is still valid
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Hash and update new password
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully"
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;