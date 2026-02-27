<<<<<<< HEAD
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './auth.css';
import API from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    // Clear API error when user starts typing
    if (apiError) {
      setApiError('');
    }
=======
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ""
      });
    }
>>>>>>> 4adbb369 (Remove node_modules from repository and apply gitignore)
  };

  const validateForm = () => {
    const newErrors = {};
<<<<<<< HEAD

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const response = await API.post('/auth/login', {
          email: formData.email,
          password: formData.password
        });

        // Store token and user data
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          if (formData.rememberMe) {
            localStorage.setItem('rememberEmail', formData.email);
          }
          // Redirect to dashboard
          navigate('/dashboard');
        }
      } catch (error) {
        setApiError(error.response?.data?.message || 'Login failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Logging in with ${provider}`);
    // Implement social login logic here
    setApiError(`${provider} login coming soon!`);
  };

  return (
    <div className="auth-container">
      {/* Background with gradient */}
      <div className="auth-background">
        <div className="auth-overlay"></div>
      </div>

      <div className="auth-wrapper">
        {/* Left Side - Branding */}
        <div className="auth-brand">
          <Link to="/" className="brand-logo">
            <i className="fas fa-microphone-alt"></i>
            <span>SpeakSense AI</span>
          </Link>
          <h1>Welcome Back!</h1>
          <p>Continue your journey to interview mastery. Log in to access your interviews and progress.</p>
          
          <div className="brand-features">
            <div className="brand-feature">
              <i className="fas fa-history"></i>
              <div>
                <h4>View History</h4>
                <p>Check your past interview sessions</p>
              </div>
            </div>
            <div className="brand-feature">
              <i className="fas fa-chart-line"></i>
              <div>
                <h4>Track Progress</h4>
                <p>Monitor your improvement over time</p>
              </div>
            </div>
            <div className="brand-feature">
              <i className="fas fa-redo"></i>
              <div>
                <h4>Practice Again</h4>
                <p>Continue practicing with new questions</p>
=======
    
    if (!form.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!form.password) {
      newErrors.password = "Password is required";
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Login:", form);
      setIsLoading(false);
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="login-page">
      {/* Background Elements */}
      <div className="login-bg">
        <div className="bg-grid"></div>
        <div className="bg-glow glow-1"></div>
        <div className="bg-glow glow-2"></div>
        <div className="bg-glow glow-3"></div>
        <div className="bg-glow glow-4"></div>
      </div>

      {/* Main Container */}
      <div className="login-container">
        {/* Left Side - Branding */}
        <div className="login-brand">
          <div className="brand-content">
            <Link to="/" className="brand-logo">
              <span className="logo-icon">🎯</span>
              <span className="logo-text">InterviewAI</span>
            </Link>
            
            <h1>Welcome Back!</h1>
            <p className="brand-subtitle">Continue your interview preparation journey</p>
            
            <div className="brand-features">
              <div className="feature-item">
                <span className="feature-dot"></span>
                <span>AI-powered interview practice</span>
              </div>
              <div className="feature-item">
                <span className="feature-dot"></span>
                <span>Real-time feedback & analysis</span>
              </div>
              <div className="feature-item">
                <span className="feature-dot"></span>
                <span>Personalized coaching</span>
              </div>
            </div>

            <div className="brand-quote">
              <p>"The best way to prepare for an interview is to practice with AI"</p>
              <div className="quote-author">
                <span className="author-avatar">👤</span>
                <div>
                  <span className="author-name">Sarah Chen</span>
                  <span className="author-title">Software Engineer at Google</span>
                </div>
>>>>>>> 4adbb369 (Remove node_modules from repository and apply gitignore)
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
<<<<<<< HEAD
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Sign In</h2>
            <p>Access your SpeakSense AI account</p>
          </div>

          {apiError && <div className="alert alert-error">{apiError}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">
                <i className="fas fa-envelope"></i>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                disabled={isLoading}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">
                <i className="fas fa-lock"></i>
                Password
              </label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="login-options">
              <label className="checkbox-label remember-me">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Signing In...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  Sign In
                </>
              )}
            </button>

            {/* Social Login */}
            <div className="auth-divider">
              <span>or sign in with</span>
            </div>

            <div className="social-auth">
              <button
                type="button"
                className="social-btn google"
                onClick={() => handleSocialLogin('Google')}
                disabled={isLoading}
              >
                <i className="fab fa-google"></i>
                Google
              </button>
              <button
                type="button"
                className="social-btn github"
                onClick={() => handleSocialLogin('GitHub')}
                disabled={isLoading}
              >
                <i className="fab fa-github"></i>
                GitHub
              </button>
              <button
                type="button"
                className="social-btn linkedin"
                onClick={() => handleSocialLogin('LinkedIn')}
                disabled={isLoading}
              >
                <i className="fab fa-linkedin"></i>
                LinkedIn
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="auth-redirect">
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </div>
          </form>
=======
        <div className="login-form-container">
          <div className="form-card">
            <div className="form-header">
              <h2>Sign In</h2>
              <p>Welcome back! Please enter your details</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                  <span className="input-icon">📧</span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                  />
                  {form.email && !errors.email && (
                    <span className="input-success">✓</span>
                  )}
                </div>
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    className={errors.password ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              {/* Login Button */}
              <button 
                type="submit" 
                className="login-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Signing in...
                  </>
                ) : (
                  'Sign In →'
                )}
              </button>

              {/* Sign Up Link */}
              <div className="signup-link">
                <p>Don't have an account? <Link to="/signup">Create account</Link></p>
              </div>

              {/* Social Login */}
              <div className="social-login">
                <div className="social-divider">
                  <span>Or continue with</span>
                </div>
                <div className="social-buttons">
                  <button type="button" className="social-btn google">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </button>
                  <button type="button" className="social-btn github">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.26.82-.58 0-.287-.01-1.05-.015-2.06-3.338.726-4.042-1.61-4.042-1.61-.546-1.39-1.335-1.76-1.335-1.76-1.09-.746.082-.73.082-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.776.418-1.306.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.235-3.22-.123-.3-.535-1.52.117-3.16 0 0 1.008-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.29-1.552 3.297-1.23 3.297-1.23.653 1.64.24 2.86.118 3.16.768.84 1.233 1.91 1.233 3.22 0 4.61-2.804 5.62-5.476 5.92.43.37.824 1.102.824 2.22 0 1.602-.015 2.894-.015 3.287 0 .322.216.698.83.578C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    GitHub
                  </button>
                </div>
              </div>
            </form>
          </div>
>>>>>>> 4adbb369 (Remove node_modules from repository and apply gitignore)
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
};

export default Login;
=======
}
>>>>>>> 4adbb369 (Remove node_modules from repository and apply gitignore)
