import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './auth.css';
import API from '../services/api';

const industries = [
  'Software Development', 'Information Technology', 'Data Science / ML',
  'Finance & Banking', 'Healthcare', 'Education',
  'Marketing & Sales', 'Consulting', 'Manufacturing', 'Other'
];

function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '#334155' };
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const map = [
    { label: '', color: '#334155' },
    { label: 'Weak', color: '#ef4444' },
    { label: 'Fair', color: '#f59e0b' },
    { label: 'Good', color: '#3b82f6' },
    { label: 'Strong', color: '#22c55e' },
  ];
  return { score: s, ...map[s] };
}

const isStrongPassword = (password) => /(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password);

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    confirmPassword: '', industry: ''
  });
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const pwStrength = getPasswordStrength(form.password);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    if (apiError) setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'At least 8 characters';
    else if (!isStrongPassword(form.password)) errs.password = 'Use uppercase, lowercase, number & special character';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!form.industry) errs.industry = 'Please select your industry';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await API.post('/auth/register', {
        name: `${form.firstName} ${form.lastName}`,
        email: form.email.trim().toLowerCase(),
        password: form.password,
        industry: form.industry
      }).then((res) => {
        if (res.data?.token) localStorage.setItem('token', res.data.token);
        if (res.data?.user) localStorage.setItem('user', JSON.stringify(res.data.user));
      });
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (provider) => {
    setIsLoading(true);
    setApiError('');
    try {
      const res = await API.post('/auth/social', { provider, mode: 'demo' });
      if (res.data.token) localStorage.setItem('token', res.data.token);
      if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || `${provider} sign up failed. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignup = async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const res = await API.post('/auth/demo');
      if (res.data.token) localStorage.setItem('token', res.data.token);
      if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Demo signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    '🎯 Personalized interview coaching',
    '📊 Speech & grammar analysis',
    '🤖 6 AI avatar interviewers',
    '📈 Progress tracking dashboard',
  ];

  return (
    <div className="auth-page">
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

            <h1>Ace Every<br />Interview 🏆</h1>
            <p className="auth-brand-sub">
              Join thousands of job seekers who use SpeakSense AI to practice, improve, and land their dream jobs.
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
              <p>"I practiced 3 mock interviews with SpeakSense AI and got detailed feedback on my grammar and filler words. Landed the job!"</p>
              <div className="auth-quote-author">
                <div className="auth-quote-avatar">👩‍💻</div>
                <div>
                  <span className="auth-quote-name">Priya Mehta</span>
                  <span className="auth-quote-title">Product Manager @ Microsoft</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT FORM ── */}
        <div className="auth-form-panel">
          <div className="auth-form-inner">
            <div className="auth-form-head">
              <h2>Create Account</h2>
              <p>Free forever · No credit card needed</p>
            </div>

            {apiError && (
              <div className="auth-api-error">
                <span>⚠️</span> {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Name row */}
              <div className="auth-field-row">
                <div className="auth-field">
                  <label htmlFor="firstName">First Name</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">👤</span>
                    <input
                      id="firstName" name="firstName" type="text"
                      className={`auth-input ${errors.firstName ? 'is-error' : ''}`}
                      placeholder="Jane" value={form.firstName} onChange={handleChange}
                    />
                  </div>
                  {errors.firstName && <span className="auth-field-error">{errors.firstName}</span>}
                </div>
                <div className="auth-field">
                  <label htmlFor="lastName">Last Name</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">👤</span>
                    <input
                      id="lastName" name="lastName" type="text"
                      className={`auth-input ${errors.lastName ? 'is-error' : ''}`}
                      placeholder="Doe" value={form.lastName} onChange={handleChange}
                    />
                  </div>
                  {errors.lastName && <span className="auth-field-error">{errors.lastName}</span>}
                </div>
              </div>

              {/* Email */}
              <div className="auth-field">
                <label htmlFor="email">Email Address</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">✉️</span>
                  <input
                    id="email" name="email" type="email"
                    className={`auth-input ${errors.email ? 'is-error' : ''}`}
                    placeholder="jane@example.com" value={form.email} onChange={handleChange}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <span className="auth-field-error">{errors.email}</span>}
              </div>

              {/* Industry */}
              <div className="auth-field">
                <label htmlFor="industry">Industry</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">💼</span>
                  <select
                    id="industry" name="industry"
                    className={`auth-select ${errors.industry ? 'is-error' : ''}`}
                    value={form.industry} onChange={handleChange}
                  >
                    <option value="">Select your industry…</option>
                    {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                  </select>
                </div>
                {errors.industry && <span className="auth-field-error">{errors.industry}</span>}
              </div>

              {/* Password */}
              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    id="password" name="password"
                    type={showPw ? 'text' : 'password'}
                    className={`auth-input ${errors.password ? 'is-error' : ''}`}
                    placeholder="Min 8 chars, 1 upper, 1 lower, 1 number, 1 symbol" value={form.password} onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <button type="button" className="auth-input-icon-right" onClick={() => setShowPw(v => !v)}>
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
                {form.password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div
                        className="strength-fill"
                        style={{ width: `${(pwStrength.score / 4) * 100}%`, background: pwStrength.color }}
                      />
                    </div>
                    <span className="strength-text" style={{ color: pwStrength.color }}>
                      {pwStrength.label}
                    </span>
                  </div>
                )}
                {errors.password && <span className="auth-field-error">{errors.password}</span>}
              </div>

              {/* Confirm password */}
              <div className="auth-field">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    id="confirmPassword" name="confirmPassword"
                    type={showCPw ? 'text' : 'password'}
                    className={`auth-input ${errors.confirmPassword ? 'is-error' : ''}`}
                    placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <button type="button" className="auth-input-icon-right" onClick={() => setShowCPw(v => !v)}>
                    {showCPw ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.confirmPassword && <span className="auth-field-error">{errors.confirmPassword}</span>}
              </div>

              <button type="submit" className="auth-submit" disabled={isLoading} style={{ marginTop: '1rem' }}>
                {isLoading ? <><span className="auth-spinner" /> Creating account…</> : 'Create Account →'}
              </button>
            </form>

            <div className="auth-divider">or sign up with</div>

            <div className="auth-social">
              <button type="button" className="auth-social-btn" onClick={() => handleSocialSignup('google')} disabled={isLoading}>
                <span className="auth-social-icon">🔍</span> Google
              </button>
              <button type="button" className="auth-social-btn" onClick={() => handleSocialSignup('github')} disabled={isLoading}>
                <span className="auth-social-icon">🐙</span> GitHub
              </button>
            </div>

            <button type="button" className="auth-submit" onClick={handleDemoSignup} disabled={isLoading} style={{ marginTop: '0.75rem' }}>
              {isLoading ? <><span className="auth-spinner" /> Opening demo…</> : 'Try Demo Signup'}
            </button>

            <div className="auth-terms">
              By signing up you agree to our <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
            </div>

            <div className="auth-bottom">
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}