import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import '../css/Auth.css';

const Register = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordsNoMatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    setLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || t('auth.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <Container fluid className="auth-container">
        <div className="auth-wrapper">
          {/* Left Side - Branding */}
          <div className="auth-branding">
            <div className="auth-branding__content">
              <div className="auth-branding__logo">
                <span className="auth-branding__icon">📊</span>
                <h1 className="auth-branding__title">{t('navbar.appName')}</h1>
              </div>
              <p className="auth-branding__subtitle">
                {t('auth.registerWelcome')}
              </p>
              <div className="auth-branding__features">
                <div className="feature-item">
                  <span className="feature-icon">⚡</span>
                  <span className="feature-text">{t('auth.featureFast')}</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🔒</span>
                  <span className="feature-text">{t('auth.featureSecure')}</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🌍</span>
                  <span className="feature-text">{t('auth.featureMultilang')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Register Form */}
          <div className="auth-form-section">
            <div className="auth-form-container">
              <div className="auth-form-header">
                <h2 className="auth-form-title">{t('auth.register')}</h2>
                <p className="auth-form-subtitle">{t('auth.registerSubtitle')}</p>
              </div>

              {error && (
                <div className="auth-alert auth-alert--error">
                  <span className="auth-alert__icon">⚠️</span>
                  <span className="auth-alert__text">{error}</span>
                </div>
              )}

              <Form onSubmit={handleSubmit} className="auth-form">
                <Form.Group className="auth-form-group">
                  <Form.Label className="auth-form-label">
                    <span className="auth-form-label__icon">👤</span>
                    {t('auth.username')}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder={t('auth.enterUsername')}
                    className="auth-form-input"
                    required
                  />
                </Form.Group>

                <Form.Group className="auth-form-group">
                  <Form.Label className="auth-form-label">
                    <span className="auth-form-label__icon">📧</span>
                    {t('auth.emailAddress')}
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('auth.enterEmail')}
                    className="auth-form-input"
                    required
                  />
                </Form.Group>

                <Form.Group className="auth-form-group">
                  <Form.Label className="auth-form-label">
                    <span className="auth-form-label__icon">🔒</span>
                    {t('auth.password')}
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t('auth.enterPassword')}
                    className="auth-form-input"
                    required
                  />
                  <Form.Text className="auth-form-hint">
                    {t('auth.passwordMinLength')}
                  </Form.Text>
                </Form.Group>

                <Form.Group className="auth-form-group">
                  <Form.Label className="auth-form-label">
                    <span className="auth-form-label__icon">🔐</span>
                    {t('auth.confirmPassword')}
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder={t('auth.enterConfirmPassword')}
                    className="auth-form-input"
                    required
                  />
                </Form.Group>

                <Button
                  type="submit"
                  className="auth-form-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="auth-form-submit__spinner"></span>
                      {t('auth.registering')}
                    </>
                  ) : (
                    <>
                      <span className="auth-form-submit__icon">✨</span>
                      {t('auth.register')}
                    </>
                  )}
                </Button>
              </Form>

              <div className="auth-form-footer">
                <p className="auth-form-footer__text">
                  {t('auth.hasAccount')}{' '}
                  <Link to="/login" className="auth-form-footer__link">
                    {t('auth.loginHere')}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
};

export default Register;
