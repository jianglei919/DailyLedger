import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Badge } from 'react-bootstrap';
import { transactionApi, categoryApi, labelApi } from '../services/api';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [filters, setFilters] = useState({
    type: '',
    categoryId: '',
    labelId: '',
    startDate: '',
    endDate: ''
  });

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    type: 'Expenses',
    categoryId: '',
    labelId: '',
    description: ''
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    type: 'Expenses',
    color: '#0ea5e9',
    icon: '📁'
  });

  const [labelForm, setLabelForm] = useState({
    name: '',
    color: '#94a3b8'
  });

  useEffect(() => {
    fetchCategories();
    fetchLabels();
  }, []);

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const { data } = await categoryApi.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchLabels = async () => {
    try {
      const { data } = await labelApi.getLabels();
      setLabels(data);
    } catch (err) {
      console.error('Error fetching labels:', err);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await transactionApi.getTransactions({
        ...filters,
        limit: 200,
        page: 1
      });
      setTransactions(data.transactions);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      type: 'Expenses',
      categoryId: '',
      labelId: '',
      description: ''
    });
    setShowModal(true);
  };

  const handleEditClick = (transaction) => {
    setEditingId(transaction._id);
    setFormData({
      date: transaction.date.split('T')[0],
      amount: transaction.amount,
      type: transaction.type,
      categoryId: transaction.categoryId?._id || '',
      labelId: transaction.labelId?._id || '',
      description: transaction.description || ''
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount)
      };

      if (editingId) {
        await transactionApi.updateTransaction(editingId, payload);
        setSuccess('Transaction updated successfully');
      } else {
        await transactionApi.createTransaction(payload);
        setSuccess('Transaction created successfully');
      }

      setShowModal(false);
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save transaction');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionApi.deleteTransaction(id);
        setSuccess('Transaction deleted successfully');
        fetchTransactions();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete transaction');
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const groupedTransactions = useMemo(() => {
    const groups = {};

    transactions.forEach((tx) => {
      const dateObj = new Date(tx.date);
      const monthKey = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
      const dayKey = dateObj.toISOString().split('T')[0];

      if (!groups[monthKey]) {
        groups[monthKey] = {};
      }
      if (!groups[monthKey][dayKey]) {
        groups[monthKey][dayKey] = [];
      }
      groups[monthKey][dayKey].push(tx);
    });

    return Object.entries(groups).map(([month, days]) => {
      const monthTotals = Object.values(days).flat().reduce(
        (acc, tx) => {
          if (tx.type === 'Income') acc.income += tx.amount;
          else acc.expenses += tx.amount;
          return acc;
        },
        { income: 0, expenses: 0 }
      );

      const dayEntries = Object.entries(days)
        .sort((a, b) => new Date(b[0]) - new Date(a[0]))
        .map(([day, items]) => ({ day, items }));

      return { month, dayEntries, monthTotals };
    });
  }, [transactions]);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await categoryApi.createCategory(categoryForm);
      await fetchCategories();
      setSuccess('Category created');
      setCategoryForm({ name: '', type: 'Expenses', color: '#0ea5e9', icon: '📁' });
      setShowCategoryModal(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create category');
    }
  };

  const handleCreateLabel = async (e) => {
    e.preventDefault();
    try {
      await labelApi.createLabel(labelForm);
      await fetchLabels();
      setSuccess('Label created');
      setLabelForm({ name: '', color: '#94a3b8' });
      setShowLabelModal(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create label');
    }
  };

  const getCategoryColor = (cat) => cat?.color || '#1d4ed8';
  const getCategoryIcon = (cat) => cat?.icon || '📁';

  return (
    <main className="ledger-page">
      <Container fluid className="ledger-container">
        <div className="page-header d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <h1>Ledger</h1>
            <p>Grouped by month with quick add</p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <Button variant="outline-secondary" size="sm" onClick={() => setShowCategoryModal(true)}>
              Manage Categories
            </Button>
            <Button variant="outline-secondary" size="sm" onClick={() => setShowLabelModal(true)}>
              Manage Labels
            </Button>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <Card className="mb-3">
          <Card.Body>
            <Row className="g-3 align-items-end">
              <Col md={2} sm={6} xs={12}>
                <Form.Group>
                  <Form.Label>Type</Form.Label>
                  <Form.Select name="type" value={filters.type} onChange={handleFilterChange}>
                    <option value="">All</option>
                    <option value="Expenses">Expenses</option>
                    <option value="Income">Income</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3} sm={6} xs={12}>
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Select name="categoryId" value={filters.categoryId} onChange={handleFilterChange}>
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3} sm={6} xs={12}>
                <Form.Group>
                  <Form.Label>Label</Form.Label>
                  <Form.Select name="labelId" value={filters.labelId} onChange={handleFilterChange}>
                    <option value="">All Labels</option>
                    {labels.map((lab) => (
                      <option key={lab._id} value={lab._id}>
                        {lab.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2} sm={6} xs={12}>
                <Form.Group>
                  <Form.Label>Start</Form.Label>
                  <Form.Control type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                </Form.Group>
              </Col>
              <Col md={2} sm={6} xs={12}>
                <Form.Group>
                  <Form.Label>End</Form.Label>
                  <Form.Control type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {loading ? (
          <div className="loading">
            <div className="loading-spinner" />
          </div>
        ) : groupedTransactions.length > 0 ? (
          groupedTransactions.map(({ month, dayEntries, monthTotals }) => (
            <Card className="mb-3" key={month}>
              <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <h5 className="mb-0">{month}</h5>
                  <small className="text-muted">{dayEntries.reduce((acc, d) => acc + d.items.length, 0)} entries</small>
                </div>
                <div className="d-flex gap-2">
                  <Badge bg="success">Income ${monthTotals.income.toFixed(2)}</Badge>
                  <Badge bg="danger">Expenses ${monthTotals.expenses.toFixed(2)}</Badge>
                </div>
              </Card.Header>
              <Card.Body>
                {dayEntries.map(({ day, items }) => {
                  const dayTotal = items.reduce(
                    (acc, tx) => {
                      if (tx.type === 'Income') acc.income += tx.amount;
                      else acc.expenses += tx.amount;
                      return acc;
                    },
                    { income: 0, expenses: 0 }
                  );

                  return (
                    <div className="day-block" key={day}>
                      <div className="day-block__header">
                        <div>
                          <strong>{new Date(day).toLocaleDateString()}</strong>
                          <span className="text-muted ms-2">{items.length} item(s)</span>
                        </div>
                        <div className="d-flex gap-2">
                          <Badge bg="success">+${dayTotal.income.toFixed(2)}</Badge>
                          <Badge bg="danger">-${dayTotal.expenses.toFixed(2)}</Badge>
                        </div>
                      </div>
                      <div className="day-block__list">
                        {items.map((tx) => (
                          <div className="ledger-row" key={tx._id}>
                            <div className="ledger-row__icon" style={{ backgroundColor: getCategoryColor(tx.categoryId) }}>
                              {getCategoryIcon(tx.categoryId)}
                            </div>
                            <div className="ledger-row__meta">
                              <div className="ledger-row__title">{tx.categoryId?.name || 'Uncategorized'}</div>
                              <div className="ledger-row__description">{tx.description || 'No description'}</div>
                              <div className="d-flex align-items-center gap-2 flex-wrap">
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
                                <Button size="sm" variant="outline-secondary" onClick={() => handleEditClick(tx)}>
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
                    </div>
                  );
                })}
              </Card.Body>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted">No transactions found</p>
        )}
      </Container>

      <Button className="floating-add" onClick={handleAddClick}>
        +
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Edit Transaction' : 'Add Transaction'}</Modal.Title>
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
                    required
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
                    <option value="">Select a category</option>
                    {categories
                      .filter((cat) => cat.type === formData.type)
                      .map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
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
                    {labels.map((lab) => (
                      <option key={lab._id} value={lab._id}>
                        {lab.name}
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
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
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
              <Button variant="primary" type="submit">
                {editingId ? 'Update' : 'Create'}
              </Button>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showCategoryModal} onHide={() => setShowCategoryModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateCategory} className="d-flex flex-column gap-3">
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Type</Form.Label>
              <Form.Select
                value={categoryForm.type}
                onChange={(e) => setCategoryForm({ ...categoryForm, type: e.target.value })}
              >
                <option value="Expenses">Expenses</option>
                <option value="Income">Income</option>
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>Color</Form.Label>
              <Form.Control
                type="color"
                value={categoryForm.color}
                onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Icon</Form.Label>
              <Form.Control
                value={categoryForm.icon}
                onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                placeholder="Emoji or short text"
              />
            </Form.Group>
            <div className="d-flex gap-2">
              <Button type="submit" variant="primary">
                Save Category
              </Button>
              <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showLabelModal} onHide={() => setShowLabelModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Label</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateLabel} className="d-flex flex-column gap-3">
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={labelForm.name}
                onChange={(e) => setLabelForm({ ...labelForm, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Color</Form.Label>
              <Form.Control
                type="color"
                value={labelForm.color}
                onChange={(e) => setLabelForm({ ...labelForm, color: e.target.value })}
              />
            </Form.Group>
            <div className="d-flex gap-2">
              <Button type="submit" variant="primary">
                Save Label
              </Button>
              <Button variant="secondary" onClick={() => setShowLabelModal(false)}>
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </main>
  );
}

export default Transactions;
