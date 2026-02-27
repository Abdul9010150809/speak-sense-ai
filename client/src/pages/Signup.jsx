import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./auth.css";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    industry: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const industries = [
    "Software Development",
    "Information Technology",
    "Finance & Banking",
    "Healthcare",
    "Education",
    "Marketing & Sales",
    "Consulting",
    "Manufacturing",
    "Retail",
    "Other"
  ];

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
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name?.trim()) {
      newErrors.name = "Full name is required";
    }
    
    if (!form.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!form.industry) {
      newErrors.industry = "Please select your industry";
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
    
    setTimeout(() => {
      console.log("Registered:", form);
      setIsLoading(false);
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="signup-page">
      {/* Background Elements with new color theme */}
      <div className="signup-bg">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="bg-circle circle-3"></div>
      </div>

      {/* Main Container */}
      <div className="signup-container">
        {/* Left Side - Simple Branding */}
        <div className="signup-brand">
          <div className="brand-content">
            <Link to="/" className="brand-logo">
              <span className="logo-icon">🎯</span>
              <span className="logo-text">InterviewAI</span>
            </Link>
            
            <h2>Welcome Back!</h2>
            <p>Sign in to continue your interview preparation journey</p>
            
            <div className="brand-message">
              <p>Already have an account?</p>
              <Link to="/login" className="brand-login-btn">Sign In</Link>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="signup-form-container">
          <div className="form-card">
            <div className="form-header">
              <h2>Create Account</h2>
              <p>Fill in your details to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="signup-form">
              {/* Full Name Field */}
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleChange}
                    className={errors.name ? 'error' : ''}
                  />
                </div>
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
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

              {/* Confirm Password Field */}
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>

              {/* Industry Field */}
              <div className="form-group">
                <label htmlFor="industry">Industry</label>
                <div className="input-wrapper">
                  <span className="input-icon">💼</span>
                  <select
                    id="industry"
                    name="industry"
                    value={form.industry}
                    onChange={handleChange}
                    className={errors.industry ? 'error' : ''}
                  >
                    <option value="">Select your industry</option>
                    {industries.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
                {errors.industry && <span className="error-message">{errors.industry}</span>}
              </div>

              {/* Register Button */}
              <button 
                type="submit" 
                className="register-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  'Create Account →'
                )}
              </button>

              {/* Terms */}
              <div className="terms">
                <p>By registering, you agree to our <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link></p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}