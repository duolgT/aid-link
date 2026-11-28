import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import API from '../config/api';

function VerifyCodePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const registeredEmail = location.state?.email || '';

  const [email, setEmail] = useState(registeredEmail);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleCodeChange(index, value) {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  }

  function handleKeyDown(index, e) {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = pastedData.split('');
    while (newCode.length < 6) newCode.push('');
    setCode(newCode);
    
    // Focus last filled input
    const lastIndex = Math.min(pastedData.length, 5);
    const lastInput = document.getElementById(`code-${lastIndex}`);
    if (lastInput) lastInput.focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const verificationCode = code.join('');

    if (verificationCode.length !== 6) {
      setError('Please enter all 6 digits');
      setLoading(false);
      return;
    }

    if (!email) {
      setError('Email address is required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Email verified successfully!');
        setTimeout(() => {
          navigate('/login', {
            state: {
              message: 'Email verified! You can now log in.',
              type: 'success'
            }
          });
        }, 2000);
      } else {
        setError(data.message || 'Verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    if (!email) {
      setError('Email address is required');
      return;
    }

    setResending(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('New verification code sent! Check your email.');
        setCode(['', '', '', '', '', '']);
        document.getElementById('code-0')?.focus();
      } else {
        setError(data.message || 'Failed to resend code');
      }
    } catch (error) {
      console.error('Resend error:', error);
      setError('Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header" style={{ textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              background: '#e5f5f3',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Mail size={40} style={{ color: '#087c75' }} />
            </div>

            <h1 style={{ marginBottom: '12px' }}>Verify Your Email</h1>
            <p style={{ color: '#64748b', fontSize: '15px' }}>
              Enter the 6-digit code we sent to<br />
              <strong>{email || 'your email'}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ marginTop: '32px' }}>
            {error && (
              <div className="alert alert-error" style={{ marginBottom: '24px' }}>
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success" style={{ marginBottom: '24px' }}>
                {success}
              </div>
            )}

            {!registeredEmail && (
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="your@email.com"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" style={{ marginBottom: '12px' }}>
                Verification Code
              </label>
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                marginBottom: '24px'
              }}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="form-input"
                    style={{
                      width: '56px',
                      height: '56px',
                      textAlign: 'center',
                      fontSize: '24px',
                      fontWeight: '600',
                      padding: '0'
                    }}
                    required
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || code.some(d => !d)}
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '16px' }}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resending}
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <RefreshCw size={16} />
                {resending ? 'Sending...' : 'Resend Code'}
              </button>
            </div>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button
              onClick={() => navigate('/login')}
              className="auth-link-secondary"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ArrowLeft size={16} />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyCodePage;
