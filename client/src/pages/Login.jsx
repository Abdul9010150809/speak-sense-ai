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
  };

  const validateForm = () => {
    const newErrors = {};

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
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
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
        </div>
      </div>
    </div>
  );
};

export default Login;
