import { useState, useEffect } from 'react';
import { smitApi } from '../services/api';
import './SMSVerification.css';

const SMSVerification = ({ phoneNumber, onVerified, onResend }) => {
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [isCodeSent, setIsCodeSent] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || isVerified) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isVerified]);

  // Format timer display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Verify code
  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (!code || code.length !== 6) {
      setError('Proszę wprowadzić 6-cyfrowy kod');
      return;
    }

    setIsLoading(true);

    try {
      // API call to verify code
      await smitApi.verifyCode(phoneNumber, code);

      setIsVerified(true);
      onVerified && onVerified();
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend code
  const handleResend = async () => {
    if (resendCount >= 3) {
      setError('Przekroczono limit ponawiania wysyłania');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // API call to resend SMS
      await smitApi.sendCode(phoneNumber);

      setCode('');
      setTimeLeft(600); // Reset timer
      setResendCount((prev) => prev + 1);
      onResend && onResend();
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Send code on first render
  const handleSendCode = async () => {
    setError('');
    setIsLoading(true);

    try {
      await smitApi.sendCode(phoneNumber);
      setIsCodeSent(true);
      setTimeLeft(600); // Start timer
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="sms-verification verified">
        <div className="verification-success">
          <span className="success-icon">✓</span>
          <span className="success-text">Numer telefonu potwierdzony</span>
        </div>
      </div>
    );
  }

  const isExpired = timeLeft <= 0;
  const canResend = resendCount < 3;

  if (!isCodeSent) {
    return (
      <div className="sms-verification">
        <div className="verification-card">
          <div className="verification-info">
            Wysłemy 6-cyfrowy kod na numer <strong>{phoneNumber}</strong>
          </div>

          {error && (
            <div style={{
              color: '#fbbf24',
              fontSize: '14px',
              marginTop: '8px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <div className="verification-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSendCode}
              disabled={isLoading}
            >
              {isLoading ? 'Wysyłanie...' : 'Wyślij kod'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sms-verification">
      <div className="verification-card">
        <div className="verification-info">
          Wysłaliśmy 6-cyfrowy kod na numer <strong>{phoneNumber}</strong>
        </div>

        <form onSubmit={handleVerify}>
          <div className="code-input-wrapper">
            <input
              type="text"
              className="code-input"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.slice(0, 6))}
              maxLength="6"
              disabled={isExpired || isLoading}
            />
          </div>

          {error && (
            <div style={{
              color: '#fbbf24',
              fontSize: '14px',
              marginTop: '8px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <div className="verification-actions">
            <button
              type="submit"
              className="btn"
              disabled={isLoading || isExpired || code.length !== 6}
            >
              {isLoading ? 'Sprawdzanie...' : 'Potwierdź'}
            </button>
          </div>
        </form>

        <div className="verification-footer">
          {!isExpired ? (
            <p className="timer-text">
              Kod ważny: <strong>{formatTime(timeLeft)}</strong>
            </p>
          ) : (
            <p className="timer-expired">Czas oczekiwania zakończył się</p>
          )}

          {canResend && (
            <button
              className="resend-btn"
              onClick={handleResend}
              disabled={isLoading || !isExpired}
            >
              {resendCount > 0 ? `Wyślij ponownie (${3 - resendCount})` : 'Wyślij kod ponownie'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SMSVerification;
