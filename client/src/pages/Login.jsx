import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './auth.css';
import API from '../services/api';
import {
  getRememberMePreference,
  getRememberedEmail,
  saveAuthSession,
} from '../utils/authStorage';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(() => ({
    email: getRememberedEmail(),
    password: '',
    rememberMe: getRememberMePreference(),
  }));
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Enter a valid email';
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 8) errs.password = 'At least 8 characters required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const res = await API.post('/auth/login', { email: formData.email, password: formData.password });
      saveAuthSession({
        token: res.data.token,
        user: res.data.user,
        rememberMe: formData.rememberMe,
        email: formData.email,
      });
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider) => {
    setIsLoading(true);
    setApiError('');
    try {
      const res = await API.post('/auth/social', { provider, mode: 'demo' });
      const socialEmail = res.data?.user?.email || formData.email;
      saveAuthSession({
        token: res.data.token,
        user: res.data.user,
        rememberMe: formData.rememberMe,
        email: socialEmail,
      });
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || `${provider} sign in failed. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const res = await API.post('/auth/demo');
      const demoEmail = res.data?.user?.email || formData.email;
      saveAuthSession({
        token: res.data.token,
        user: res.data.user,
        rememberMe: formData.rememberMe,
        email: demoEmail,
      });
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Demo sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    '🎯 AI-powered mock interviews',
    '📊 Real-time speech analysis',
    '🧠 Grammar & vocabulary feedback',
    '🚀 Track your progress over time',
  ];

  return (
    <div className="auth-page">
      {/* Animated background */}
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />
      <div className="auth-blob auth-blob-3" />
      <div className="auth-grid" />

      <div className="auth-card">
        {/* ── LEFT BRAND ── */}
        <div className="auth-brand">
          <div className="brand-inner">
            <Link to="/" className="auth-logo">
              <span className="auth-logo-icon">🎙️</span>
              <span className="auth-logo-text">SpeakSense AI</span>
            </Link>

            <h1>Welcome<br />Back 👋</h1>
            <p className="auth-brand-sub">
              Continue your journey to interview mastery with AI-powered coaching and real-time feedback.
            </p>

            <div className="auth-features">
              {features.map((f, i) => (
                <div className="auth-feature" key={i}>
                  <span className="auth-feature-dot" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <div className="auth-quote">
              <p>"SpeakSense transformed how I prepare for interviews. I went from nervous to confident in just 2 weeks!"</p>
              <div className="auth-quote-author">
                <div className="auth-quote-avatar">👨‍💼</div>
                <div>
                  <span className="auth-quote-name">Rahul Sharma</span>
                  <span className="auth-quote-title">Software Engineer @ Google</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT FORM ── */}
        <div className="auth-form-panel">
          <div className="auth-form-inner">
            <div className="auth-form-head">
              <h2>Sign In</h2>
              <p>Pick up where you left off</p>
            </div>

            {/* Social buttons */}
            <div className="auth-social">
              <button type="button" className="auth-social-btn" onClick={() => handleSocialSignIn('google')} disabled={isLoading}>
                <span className="auth-social-icon">🔍</span> Google
              </button>
              <button type="button" className="auth-social-btn" onClick={() => handleSocialSignIn('github')} disabled={isLoading}>
                <span className="auth-social-icon">🐙</span> GitHub
              </button>
            </div>

            <button type="button" className="auth-submit" onClick={handleDemoSignIn} disabled={isLoading} style={{ marginTop: '0.75rem' }}>
              {isLoading ? <><span className="auth-spinner" /> Opening demo…</> : 'Try Demo Account'}
            </button>

            <div className="auth-divider">or continue with email</div>

            {apiError && (
              <div className="auth-api-error">
                <span>⚠️</span> {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="auth-field">
                <label htmlFor="email">Email Address</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">✉️</span>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    className={`auth-input ${errors.email ? 'is-error' : ''}`}
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <span className="auth-field-error">{errors.email}</span>}
              </div>

              {/* Password */}
              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className={`auth-input ${errors.password ? 'is-error' : ''}`}
                    placeholder="Your password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="auth-input-icon-right"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label="Toggle password"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.password && <span className="auth-field-error">{errors.password}</span>}
              </div>

              {/* Remember + Forgot */}
              <div className="auth-row">
                <label className="auth-checkbox-label">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    className="auth-checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  Remember me
                </label>
                <Link to="/forgot-password" className="auth-forgot">Forgot password?</Link>
              </div>

              <button type="submit" className="auth-submit" disabled={isLoading}>
                {isLoading ? <><span className="auth-spinner" /> Signing in…</> : 'Sign In →'}
              </button>
            </form>

            <div className="auth-bottom">
              Don't have an account? <Link to="/signup">Create one free</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
