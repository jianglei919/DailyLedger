import React, { useState } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { transactionApi, categoryApi, labelApi } from '../services/api';

function TransactionDetailModal({ show, onHide, transaction, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [labels, setLabels] = useState([]);

  // Extract date from transaction (use dateString if available, otherwise parse ISO date)
  function extractDate(transaction) {
    if (!transaction) return '';
    if (transaction.dateString) return transaction.dateString;
    
    const date = new Date(transaction.date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const [formData, setFormData] = useState(() => {
    if (transaction) {
      return {
        date: extractDate(transaction),
        amount: transaction?.amount || '',
        categoryId: transaction?.categoryId?._id || '',
        labelId: transaction?.labelId?._id || '',
        description: transaction?.description || ''
      };
    }
    return {
      date: '',
      amount: '',
      categoryId: '',
      labelId: '',
      description: ''
    };
  });

  React.useEffect(() => {
    if (show && transaction) {
      setFormData({
        date: extractDate(transaction),
        amount: transaction.amount || '',
        categoryId: transaction.categoryId?._id || '',
        labelId: transaction.labelId?._id || '',
        description: transaction.description || ''
      });
      fetchCategories();
      fetchLabels();
    }
  }, [show, transaction]);

  const fetchCategories = async () => {
    try {
      const { data } = await categoryApi.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchLabels = async () => {
    try {
      const { data } = await labelApi.getLabels();
      setLabels(data);
    } catch (err) {
      console.error('Failed to fetch labels:', err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Send date as YYYY-MM-DD string, backend will handle UTC conversion
      const payload = {
        ...formData,
        amount: Number(formData.amount)
      };
      
      await transactionApi.updateTransaction(transaction._id, payload);
      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this transaction?')) return;
    setError('');
    setLoading(true);

    try {
      await transactionApi.deleteTransaction(transaction._id);
      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onHide();
  };

  if (!transaction) return null;

  const filteredCategories = categories.filter(c => c.type === transaction.type);

  return (
    <Modal show={show} onHide={handleClose} centered size="md">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="mb-0">
          {transaction.type === 'Income' ? '💰 Income' : '💸 Expenses'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-3">
        {error && <div className="alert alert-danger alert-sm">{error}</div>}

        {/* Edit Mode */}
        <Form onSubmit={handleSave}>
            <Row className="g-3">
              <Col xs={6}>
                <Form.Group>
                  <Form.Label className="text-muted" style={{ fontSize: '0.85rem' }}>Date</Form.Label>
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
                  <Form.Label className="text-muted" style={{ fontSize: '0.85rem' }}>Amount</Form.Label>
                  <Form.Control
                    type="number"
                    size="sm"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group>
                  <Form.Label className="text-muted" style={{ fontSize: '0.85rem' }}>Category</Form.Label>
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
                  <Form.Label className="text-muted" style={{ fontSize: '0.85rem' }}>Label (Optional)</Form.Label>
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
                  <Form.Label className="text-muted" style={{ fontSize: '0.85rem' }}>Note</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    size="sm"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-between mt-4">
              <Button
                variant="outline-danger"
                onClick={handleDelete}
                disabled={loading}
              >
                Delete
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </Form>
      </Modal.Body>
    </Modal>
  );
}

export default TransactionDetailModal;
