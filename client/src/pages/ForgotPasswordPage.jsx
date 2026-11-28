import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartHandshake, Mail, AlertCircle, CheckCircle } from 'lucide-react';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        
        // Show dev code if email failed
        if (data.devCode) {
          alert(`⚠️ Email sending failed!\n\nYour password reset code is: ${data.devCode}\n\nThis will also appear in the browser console and server logs.`);
          console.log('🔐 PASSWORD RESET CODE:', data.devCode);
        }
        
        // Redirect to reset password page after 2 seconds
        setTimeout(() => {
          navigate('/reset-password', { 
            state: { 
              email,
              devCode: data.devCode // Pass code if email failed
            } 
          });
        }, 2000);
      } else {
        setError(data.message || 'Failed to send reset code');
      }
    } catch (err) {
      setError('An error occurred. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="auth-brand">
            <div className="brand-icon">
              <HeartHandshake size={28} />
            </div>
            <div className="brand-text">
              <strong>AidLink</strong>
              <small>KAKUMA</small>
            </div>
          </Link>
          
          <h1 className="auth-title">Forgot Password</h1>
          <p className="auth-subtitle">
            Enter your email to receive a password reset code
          </p>
        </div>

        {success ? (
          <div className="alert alert-success">
            <CheckCircle size={20} />
            <span>Reset code sent! Redirecting...</span>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-error">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <Mail size={16} />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                placeholder="organization@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>Remember your password? <Link to="/login">Sign in</Link></p>
        </div>

        <div className="auth-back">
          <Link to="/">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
