const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  email: { 
    type: String, 
    unique: true, 
    required: true,
    lowercase: true,
    trim: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  avatar: { 
    type: String, 
    default: null 
  },
  role: { 
    type: String, 
    default: "user",
    enum: ["user", "admin", "interviewer"] 
  },
  
  // Profile Information
  profile: {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    phone: { type: String },
    location: { type: String },
    title: { type: String }, // Current job title
    bio: { type: String, maxlength: 500 },
    skills: [{ type: String }],
    experience: [{
      title: String,
      company: String,
      location: String,
      from: Date,
      to: Date,
      current: Boolean,
      description: String
    }],
    education: [{
      degree: String,
      field: String,
      institution: String,
      from: Date,
      to: Date,
      current: Boolean
    }],
    resume: {
      url: String,
      filename: String,
      uploadedAt: Date
    }
  },

  // Interview Preferences
  preferences: {
    preferredJobRoles: [{ type: String }],
    experienceLevel: {
      type: String,
      enum: ["entry", "mid", "senior", "lead", "executive"],
      default: "entry"
    },
    interviewTypes: [{
      type: String,
      enum: ["technical", "behavioral", "mixed"]
    }],
    avatarPreference: {
      type: String,
      default: "Alex" // Default avatar
    },
    language: {
      type: String,
      default: "en"
    },
    notificationSettings: {
      emailNotifications: { type: Boolean, default: true },
      interviewReminders: { type: Boolean, default: true }
    }
  },

  // Interview Statistics
  stats: {
    totalInterviews: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    interviewsCompleted: { type: Number, default: 0 },
    totalPracticeTime: { type: Number, default: 0 }, // in minutes
    lastInterviewDate: Date,
    strengths: [{ type: String }],
    areasForImprovement: [{ type: String }],
    skillLevels: new mongoose.Schema({
      technical: { type: Number, min: 0, max: 100, default: 0 },
      communication: { type: Number, min: 0, max: 100, default: 0 },
      problemSolving: { type: Number, min: 0, max: 100, default: 0 },
      leadership: { type: Number, min: 0, max: 100, default: 0 }
    })
  },

  // Account Status
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isEmailVerified: { 
    type: Boolean, 
    default: false 
  },
  lastLogin: Date,
  loginAttempts: { 
    type: Number, 
    default: 0 
  },
  lockUntil: Date,

  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // Email Verification
  emailVerificationToken: String,
  emailVerificationExpire: Date

}, { 
  timestamps: true 
});

// Hash password before saving
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  const jwt = require("jsonwebtoken");
  return jwt.sign(
    { 
      id: this._id, 
      email: this.email, 
      role: this.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "30d" }
  );
};

// Check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
userSchema.methods.incrementLoginAttempts = function() {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account if attempts too high
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 3600000 }; // Lock for 1 hour
  }
  
  return this.updateOne(updates);
};

// Update interview statistics
userSchema.methods.updateInterviewStats = function(score, duration, strengths, improvements) {
  this.stats.totalInterviews += 1;
  this.stats.interviewsCompleted += 1;
  this.stats.totalPracticeTime += duration;
  this.stats.lastInterviewDate = new Date();
  
  // Update average score
  const totalScore = (this.stats.averageScore * (this.stats.totalInterviews - 1) + score) / this.stats.totalInterviews;
  this.stats.averageScore = Math.round(totalScore);
  
  // Update strengths and improvements
  if (strengths) {
    this.stats.strengths = [...new Set([...this.stats.strengths, ...strengths])].slice(0, 10);
  }
  
  if (improvements) {
    this.stats.areasForImprovement = [...new Set([...this.stats.areasForImprovement, ...improvements])].slice(0, 10);
  }
  
  return this.save();
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.name;
});

// Virtual for profile completion percentage
userSchema.virtual('profileCompletion').get(function() {
  let completed = 0;
  const total = 8; // Number of profile fields to check
  
  if (this.profile.firstName) completed++;
  if (this.profile.lastName) completed++;
  if (this.profile.phone) completed++;
  if (this.profile.location) completed++;
  if (this.profile.title) completed++;
  if (this.profile.bio) completed++;
  if (this.profile.skills.length > 0) completed++;
  if (this.profile.experience.length > 0) completed++;
  
  return Math.round((completed / total) * 100);
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ 'profile.skills': 1 });
userSchema.index({ 'preferences.preferredJobRoles': 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", userSchema);