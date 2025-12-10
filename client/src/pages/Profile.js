import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { authApi } from '../services/api';

const Profile = () => {
  const { t } = useTranslation();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await authApi.updateProfile({ username: formData.username });
      setMessage({ type: 'success', text: t('profile.updateSuccess') });
      setIsEditing(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({
        type: 'danger',
        text: '✗ ' + (err.response?.data?.error || t('profile.updateError'))
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'danger', text: t('profile.passwordMismatch') });
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: 'danger', text: t('profile.passwordTooShort') });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await authApi.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });
      setMessage({ type: 'success', text: t('profile.passwordChangeSuccess') });
      setFormData({
        username: formData.username,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({
        type: 'danger',
        text: '✗ ' + (err.response?.data?.error || t('profile.passwordChangeError'))
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = () => {
    const source = user?.username || user?.email || '';
    return source
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <main className="profile-page">
      <Container fluid className="py-4">
        {message.text && (
          <div className={`alert alert-${message.type} profile-alert`}>
            {message.text}
          </div>
        )}

        <Row className="g-4">
          {/* Left Sidebar - User Info Card */}
          <Col lg={4}>
            <Card className="profile-card profile-user-card">
              <Card.Body className="text-center">
                <div className="profile-avatar-large">
                  {getInitials()}
                </div>
                <h4 className="mt-3 mb-1">{user?.username}</h4>
                <p className="text-muted mb-2">{user?.email}</p>
                <span className={`profile-badge ${user?.role === 'admin' ? 'profile-badge--admin' : 'profile-badge--user'}`}>
                  {user?.role === 'admin' ? `👑 ${t('profile.admin')}` : `👤 ${t('profile.user')}`}
                </span>
                <div className="profile-divider"></div>
                <div className="profile-stats">
                  <div className="profile-stat-item">
                    <div className="profile-stat-icon">📊</div>
                    <div className="profile-stat-label">{t('profile.memberSince')}</div>
                    <div className="profile-stat-value">
                      {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Content - Settings */}
          <Col lg={8}>
            {/* Account Information */}
            <Card className="profile-card mb-4">
              <Card.Header className="profile-card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <span className="profile-icon">👤</span>
                    <h5 className="mb-0">{t('profile.accountInfo')}</h5>
                  </div>
                  {!isEditing && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="profile-edit-btn"
                    >
                      ✏️ {t('profile.edit')}
                    </Button>
                  )}
                </div>
              </Card.Header>
              <Card.Body>
                {isEditing ? (
                  <Form onSubmit={handleUpdateProfile}>
                    <Form.Group className="mb-3">
                      <Form.Label className="profile-form-label">{t('profile.username')}</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="profile-input"
                        placeholder={t('profile.enterUsername')}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="profile-form-label">{t('profile.email')}</Form.Label>
                      <Form.Control
                        type="email"
                        value={user?.email}
                        disabled
                        className="profile-input"
                      />
                      <Form.Text className="text-muted">
                        🔒 {t('profile.emailCannotChange')}
                      </Form.Text>
                    </Form.Group>

                    <div className="d-flex gap-2 mt-4">
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={loading}
                        className="profile-btn profile-btn--primary"
                      >
                        {loading ? `💾 ${t('profile.saving')}` : `💾 ${t('profile.save')}`}
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({ ...formData, username: user?.username || '' });
                        }}
                        className="profile-btn profile-btn--secondary"
                      >
                        ✕ {t('profile.cancel')}
                      </Button>
                    </div>
                  </Form>
                ) : (
                  <div className="profile-info-list">
                    <div className="profile-info-item">
                      <div className="profile-info-label">👤 {t('profile.username')}</div>
                      <div className="profile-info-value">{user?.username}</div>
                    </div>
                    <div className="profile-info-item">
                      <div className="profile-info-label">📧 {t('profile.email')}</div>
                      <div className="profile-info-value">{user?.email}</div>
                    </div>
                    <div className="profile-info-item">
                      <div className="profile-info-label">🎭 {t('profile.role')}</div>
                      <div className="profile-info-value">
                        <span className={`profile-badge ${user?.role === 'admin' ? 'profile-badge--admin' : 'profile-badge--user'}`}>
                          {user?.role === 'admin' ? t('profile.admin') : t('profile.user')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Change Password */}
            <Card className="profile-card mb-4">
              <Card.Header className="profile-card-header">
                <div className="d-flex align-items-center gap-2">
                  <span className="profile-icon">🔐</span>
                  <h5 className="mb-0">{t('profile.changePassword')}</h5>
                </div>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleChangePassword}>
                  <Form.Group className="mb-3">
                    <Form.Label className="profile-form-label">{t('profile.currentPassword')}</Form.Label>
                    <Form.Control
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder={t('profile.enterCurrentPassword')}
                      className="profile-input"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="profile-form-label">{t('profile.newPassword')}</Form.Label>
                    <Form.Control
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder={t('profile.enterNewPassword')}
                      className="profile-input"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="profile-form-label">{t('profile.confirmPassword')}</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder={t('profile.confirmNewPassword')}
                      className="profile-input"
                      required
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="profile-btn profile-btn--primary"
                  >
                    {loading ? `🔄 ${t('profile.updating')}` : `🔐 ${t('profile.updatePassword')}`}
                  </Button>
                </Form>
              </Card.Body>
            </Card>

            {/* Danger Zone */}
            <Card className="profile-card profile-card--danger">
              <Card.Header className="profile-card-header profile-card-header--danger">
                <div className="d-flex align-items-center gap-2">
                  <span className="profile-icon">⚠️</span>
                  <h5 className="mb-0">Danger Zone</h5>
                </div>
              </Card.Header>
              <Card.Body>
                <p className="text-muted mb-3">
                  Once you logout, you'll need to sign in again to access your account.
                </p>
                <Button
                  variant="danger"
                  onClick={handleLogout}
                  className="profile-btn profile-btn--danger"
                >
                  🚪 Logout
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default Profile;
