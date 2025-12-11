import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, ButtonGroup, ListGroup, Tabs, Tab } from 'react-bootstrap';
import { transactionApi, categoryApi, labelApi } from '../services/api';

const EMOJI_ICONS = ['💰', '🍔', '🚗', '🏠', '💵', '💊', '🎬', '🛒', '✈️', '📱', '💡', '🎓', '🎨', '⚡', '🎯', '📚', '🎮', '☕', '🍕', '🚕', '🏋️'];
const LABEL_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#64a502ff', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

function AddTransactionModal({ show, onHide, onSuccess }) {
  const [activeType, setActiveType] = useState('Expenses');
  const [categories, setCategories] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modals
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showLabelManager, setShowLabelManager] = useState(false);

  // Transaction form
  const [formData, setFormData] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return {
      date: `${year}-${month}-${day}`,
      amount: '',
      categoryId: '',
      labelId: '',
      description: ''
    };
  });

  useEffect(() => {
    if (show) {
      fetchCategories();
      fetchLabels();
    }
  }, [show]);

  const fetchCategories = async () => {
    try {
      const { data } = await categoryApi.getCategories();
      // Sort by creation time ascending (oldest first)
      const sorted = data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setCategories(sorted);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchLabels = async () => {
    try {
      const { data } = await labelApi.getLabels();
      // Sort by creation time ascending (oldest first)
      const sorted = data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setLabels(sorted);
    } catch (err) {
      console.error('Failed to fetch labels:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Send date as YYYY-MM-DD string, backend will handle UTC conversion
      const payload = {
        ...formData,
        type: activeType,
        amount: Number(formData.amount)
      };
      
      await transactionApi.createTransaction(payload);
      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    setFormData({
      date: `${year}-${month}-${day}`,
      amount: '',
      categoryId: '',
      labelId: '',
      description: ''
    });
    setError('');
    onHide();
  };

  const filteredCategories = categories.filter(c => c.type === activeType);

  return (
    <>
      <Modal show={show} onHide={handleClose} centered size="md">
        <Modal.Header closeButton>
          <Modal.Title>Add Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Type Selector */}
          <div className="mb-3 d-flex justify-content-center">
            <ButtonGroup className="type-selector d-flex flex-row flex-nowrap w-100" style={{ maxWidth: '400px' }}>
              <Button
                variant={activeType === 'Expenses' ? 'danger' : 'outline-danger'}
                onClick={() => setActiveType('Expenses')}
                className="rounded-pill-start flex-fill"
                style={{ padding: '8px 0' }}
              >
                💸 Expenses
              </Button>
              <Button
                variant={activeType === 'Income' ? 'success' : 'outline-success'}
                onClick={() => setActiveType('Income')}
                className="rounded-pill-end flex-fill"
                style={{ padding: '8px 0' }}
              >
                💰 Income
              </Button>
            </ButtonGroup>
          </div>

          {/* Transaction Form */}
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col xs={6}>
                <Form.Group>
                  <Form.Label style={{ fontSize: '0.9rem', color: '#64748b' }}>Date</Form.Label>
                  <Form.Control
                    type="date"
                    size="sm"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group>
                  <Form.Label style={{ fontSize: '0.9rem', color: '#64748b' }}>Amount</Form.Label>
                  <Form.Control
                    type="number"
                    size="sm"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    style={{ color: formData.amount ? '#0f172a' : '#94a3b8' }}
                  />
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <Form.Label className="mb-0" style={{ fontSize: '0.9rem', color: '#64748b' }}>Category</Form.Label>
                    <Button
                      size="sm"
                      variant="light"
                      className="rounded-circle p-0"
                      style={{ width: '24px', height: '24px', fontSize: '1.25rem', lineHeight: 1 }}
                      onClick={() => setShowCategoryManager(true)}
                      title="Manage Categories"
                    >
                      ⚙️
                    </Button>
                  </div>
                  <Form.Select
                    size="sm"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    required
                  >
                    <option value="">Select category</option>
                    {filteredCategories.map(cat => (
                      <option key={cat._id} value={cat._id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <Form.Label className="mb-0" style={{ fontSize: '0.9rem', color: '#64748b' }}>Label (Optional)</Form.Label>
                    <Button
                      size="sm"
                      variant="light"
                      className="rounded-circle p-0"
                      style={{ width: '24px', height: '24px', fontSize: '1.25rem', lineHeight: 1 }}
                      onClick={() => setShowLabelManager(true)}
                      title="Manage Labels"
                    >
                      ⚙️
                    </Button>
                  </div>
                  <Form.Select
                    size="sm"
                    value={formData.labelId}
                    onChange={(e) => setFormData({ ...formData, labelId: e.target.value })}
                  >
                    <option value="">None</option>
                    {labels.map(label => (
                      <option key={label._id} value={label._id}>
                        {label.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label style={{ fontSize: '0.9rem', color: '#64748b' }}>Note</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    size="sm"
                    placeholder="Optional description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-center mt-4">
              <Button 
                variant="primary" 
                type="submit" 
                disabled={loading}
                style={{ minWidth: '120px', padding: '10px 24px' }}
              >
                {loading ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Category Manager Modal */}
      <CategoryManagerModal
        show={showCategoryManager}
        onHide={() => setShowCategoryManager(false)}
        categories={categories}
        onUpdate={fetchCategories}
      />

      {/* Label Manager Modal */}
      <LabelManagerModal
        show={showLabelManager}
        onHide={() => setShowLabelManager(false)}
        labels={labels}
        onUpdate={fetchLabels}
      />
    </>
  );
}

// Category Manager Modal Component
function CategoryManagerModal({ show, onHide, categories, onUpdate }) {
  const [activeTab, setActiveTab] = useState('Expenses');
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: '💰', color: '#6366f1' });
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...categoryForm, type: activeTab };
      if (editingCategory) {
        await categoryApi.updateCategory(editingCategory._id, payload);
      } else {
        await categoryApi.createCategory(payload);
      }
      await onUpdate();
      setCategoryForm({ name: '', icon: '💰', color: '#6366f1' });
      setEditingCategory(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save category');
    }
  };

  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, icon: cat.icon, color: cat.color || '#6366f1' });
    setActiveTab(cat.type);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await categoryApi.deleteCategory(id);
      await onUpdate();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete category');
    }
  };

  const handleClose = () => {
    setCategoryForm({ name: '', icon: '💰', color: '#6366f1' });
    setEditingCategory(null);
    setError('');
    onHide();
  };

  const filteredCategories = categories.filter(c => c.type === activeTab);

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Manage Categories</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger alert-sm">{error}</div>}
        
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
          <Tab eventKey="Expenses" title="💸 Expenses">
            <CategoryList
              categories={filteredCategories}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Tab>
          <Tab eventKey="Income" title="💰 Income">
            <CategoryList
              categories={filteredCategories}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Tab>
        </Tabs>

        <Form onSubmit={handleSave} className="border-top pt-3">
          <h6 className="mb-3">{editingCategory ? 'Edit Category' : 'Add Category'}</h6>
          <Row className="g-2">
            <Col xs={8}>
              <Form.Control
                size="sm"
                placeholder="Category name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                required
              />
            </Col>
            <Col xs={4}>
              <Form.Select
                size="sm"
                value={categoryForm.icon}
                onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
              >
                {EMOJI_ICONS.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={12}>
              <Form.Label className="small text-muted mb-1">Color</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {LABEL_COLORS.map(color => (
                  <div
                    key={color}
                    onClick={() => setCategoryForm({ ...categoryForm, color })}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: color,
                      cursor: 'pointer',
                      border: categoryForm.color === color ? '3px solid #333' : '2px solid #e5e7eb',
                      transform: categoryForm.color === color ? 'scale(1.15)' : 'scale(1)',
                      transition: 'all 0.2s'
                    }}
                    title={color}
                  />
                ))}
              </div>
            </Col>
            <Col xs={12}>
              <div className="d-flex gap-2">
                <Button size="sm" type="submit" variant="primary" className="flex-grow-1">
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

function CategoryList({ categories, onEdit, onDelete }) {
  if (categories.length === 0) {
    return <p className="text-muted text-center py-3">No categories yet</p>;
  }

  return (
    <ListGroup variant="flush">
      {categories.map(cat => (
        <ListGroup.Item key={cat._id} className="d-flex justify-content-between align-items-center py-2">
          <span>
            <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>{cat.icon}</span>
            {cat.name}
          </span>
          <div className="d-flex gap-1">
            <Button size="sm" variant="light" className="text-primary p-1" onClick={() => onEdit(cat)} title="Edit">
              ✏️
            </Button>
            <Button size="sm" variant="light" className="text-danger p-1" onClick={() => onDelete(cat._id)} title="Delete">
              🗑️
            </Button>
          </div>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}

// Label Manager Modal Component
function LabelManagerModal({ show, onHide, labels, onUpdate }) {
  const [editingLabel, setEditingLabel] = useState(null);
  const [labelForm, setLabelForm] = useState({ name: '', color: '#ef4444' });
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingLabel) {
        await labelApi.updateLabel(editingLabel._id, labelForm);
      } else {
        await labelApi.createLabel(labelForm);
      }
      await onUpdate();
      setLabelForm({ name: '', color: '#ef4444' });
      setEditingLabel(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save label');
    }
  };

  const handleEdit = (label) => {
    setEditingLabel(label);
    setLabelForm({ name: label.name, color: label.color });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this label?')) return;
    try {
      await labelApi.deleteLabel(id);
      await onUpdate();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete label');
    }
  };

  const handleClose = () => {
    setLabelForm({ name: '', color: '#ef4444' });
    setEditingLabel(null);
    setError('');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Manage Labels</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <div className="alert alert-danger alert-sm">{error}</div>}
        
        {labels.length > 0 ? (
          <ListGroup variant="flush" className="mb-3">
            {labels.map(label => (
              <ListGroup.Item key={label._id} className="d-flex justify-content-between align-items-center py-2">
                <span className="d-flex align-items-center gap-2">
                  <span
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: label.color,
                      display: 'inline-block'
                    }}
                  />
                  {label.name}
                </span>
                <div className="d-flex gap-1">
                  <Button size="sm" variant="light" className="text-primary p-1" onClick={() => handleEdit(label)} title="Edit">
                    ✏️
                  </Button>
                  <Button size="sm" variant="light" className="text-danger p-1" onClick={() => handleDelete(label._id)} title="Delete">
                    🗑️
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <p className="text-muted text-center py-3">No labels yet</p>
        )}

        <Form onSubmit={handleSave} className="border-top pt-3">
          <h6 className="mb-3">{editingLabel ? 'Edit Label' : 'Add Label'}</h6>
          <Row className="g-3">
            <Col xs={12}>
              <Form.Label className="small text-muted mb-1">Label Name</Form.Label>
              <Form.Control
                size="sm"
                placeholder="Label name"
                value={labelForm.name}
                onChange={(e) => setLabelForm({ ...labelForm, name: e.target.value })}
                required
              />
            </Col>
            <Col xs={12}>
              <Form.Label className="small text-muted mb-1">Color</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {LABEL_COLORS.map(color => (
                  <div
                    key={color}
                    onClick={() => setLabelForm({ ...labelForm, color })}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: color,
                      cursor: 'pointer',
                      border: labelForm.color === color ? '2px solid #333' : '1px solid #e5e7eb',
                      transform: labelForm.color === color ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.2s'
                    }}
                    title={color}
                  />
                ))}
              </div>
            </Col>
            <Col xs={12}>
              <div className="d-flex gap-2 mt-2">
                <Button size="sm" type="submit" variant="primary" className="flex-grow-1">
                  {editingLabel ? 'Update' : 'Create'}
                </Button>
                {editingLabel && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditingLabel(null);
                      setLabelForm({ name: '', color: '#ef4444' });
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default AddTransactionModal;
