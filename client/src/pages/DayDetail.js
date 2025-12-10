import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Badge, Modal, Form, Row, Col } from 'react-bootstrap';
import { transactionApi, categoryApi, labelApi } from '../services/api';

function DayDetail() {
  const { date } = useParams();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    date,
    amount: '',
    type: 'Expenses',
    categoryId: '',
    labelId: '',
    description: ''
  });

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const fetchAll = async () => {
    await Promise.all([fetchTransactions(), fetchCategories(), fetchLabels()]);
  };

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await transactionApi.getTransactions({ startDate: date, endDate: date, limit: 200, page: 1 });
      setTransactions(data.transactions);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await categoryApi.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLabels = async () => {
    try {
      const { data } = await labelApi.getLabels();
      setLabels(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (tx) => {
    setEditingId(tx._id);
    setFormData({
      date: tx.date.split('T')[0],
      amount: tx.amount,
      type: tx.type,
      categoryId: tx.categoryId?._id || '',
      labelId: tx.labelId?._id || '',
      description: tx.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await transactionApi.deleteTransaction(id);
      setSuccess('Deleted successfully');
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = { ...formData, amount: Number(formData.amount) };
      if (editingId) {
        await transactionApi.updateTransaction(editingId, payload);
        setSuccess('Updated');
      } else {
        await transactionApi.createTransaction(payload);
        setSuccess('Created');
      }
      setShowModal(false);
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed');
    }
  };

  const netTotal = transactions.reduce(
    (acc, tx) => (tx.type === 'Income' ? acc + tx.amount : acc - tx.amount),
    0
  );

  return (
    <main className="ledger-page">
      <Container className="ledger-container">
        <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h1>{new Date(date).toLocaleDateString()}</h1>
            <p>Day details</p>
          </div>
          <div className={netTotal >= 0 ? 'text-success' : 'text-danger'} style={{ fontWeight: 700 }}>
            {netTotal >= 0 ? '+' : '-'}${Math.abs(netTotal).toFixed(2)}
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <Card className="mb-3">
          <Card.Body>
            {loading ? (
              <div className="loading">
                <div className="loading-spinner" />
              </div>
            ) : transactions.length ? (
              <div className="day-list__items">
                {transactions.map((tx) => (
                  <div className="ledger-row" key={tx._id}>
                    <div className="ledger-row__icon" style={{ backgroundColor: tx.categoryId?.color || '#6366f1' }}>
                      {tx.categoryId?.icon || '📁'}
                    </div>
                    <div className="ledger-row__meta">
                      <div className="ledger-row__title">{tx.categoryId?.name || 'Uncategorized'}</div>
                      <div className="ledger-row__description">{tx.description || 'No description'}</div>
                      <div className="d-flex gap-2 align-items-center flex-wrap">
                        <Badge bg={tx.type === 'Income' ? 'success' : 'danger'}>{tx.type}</Badge>
                        {tx.labelId && (
                          <span className="label-pill" style={{ backgroundColor: tx.labelId.color }}>
                            {tx.labelId.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ledger-row__amount text-end">
                      <div className={tx.type === 'Income' ? 'text-success' : 'text-danger'}>
                        {tx.type === 'Income' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </div>
                      <div className="ledger-row__actions">
                        <Button size="sm" variant="outline-secondary" onClick={() => handleEdit(tx)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="outline-danger" onClick={() => handleDelete(tx._id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No records for this day</p>
            )}
          </Card.Body>
        </Card>

        <div className="d-flex gap-2 flex-wrap">
          <Button
            variant="primary"
            onClick={() => {
              setEditingId(null);
              setFormData({ ...formData, amount: '', categoryId: '', labelId: '', description: '', date });
              setShowModal(true);
            }}
          >
            Add record
          </Button>
          <Button variant="outline-secondary" onClick={() => navigate('/dashboard')}>
            Back
          </Button>
        </div>

        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>{editingId ? 'Edit Record' : 'Add Record'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSave}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Type</Form.Label>
                    <Form.Select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value, categoryId: '' })}
                    >
                      <option value="Expenses">Expenses</option>
                      <option value="Income">Income</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      required
                    >
                      <option value="">Select category</option>
                      {categories
                        .filter((c) => c.type === formData.type)
                        .map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Label (optional)</Form.Label>
                    <Form.Select
                      value={formData.labelId}
                      onChange={(e) => setFormData({ ...formData, labelId: e.target.value })}
                    >
                      <option value="">None</option>
                      {labels.map((l) => (
                        <option key={l._id} value={l._id}>
                          {l.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Amount</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Optional"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex gap-2 mt-3">
                <Button type="submit" variant="primary">
                  {editingId ? 'Update' : 'Create'}
                </Button>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </main>
  );
}

export default DayDetail;
