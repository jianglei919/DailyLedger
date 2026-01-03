import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Badge, Button, Table, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { transactionApi } from '../services/api';
import AddTransactionModal from '../components/AddTransactionModal';
import TransactionDetailModal from '../components/TransactionDetailModal';

function Dashboard() {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await transactionApi.getTransactions({
        limit: 500,
        page: 1
      });
      setTransactions(data.transactions);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const currentMonthKey = useMemo(() => {
    return selectedMonth;
  }, [selectedMonth]);

  const currentMonthTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 使用 dateString 字段（如果有）或从 date 中提取日期（避免时区问题）
      let txMonthKey;
      if (tx.dateString) {
        // 后端已提供 dateString (YYYY-MM-DD)，直接提取年月
        const [year, month] = tx.dateString.split('-');
        txMonthKey = `${year}-${month}`;
      } else {
        // 兼容旧数据：从 date 字段提取，但使用 UTC 时间避免时区问题
        const d = new Date(tx.date);
        // 使用 UTC 方法获取年月，避免本地时区影响
        txMonthKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      }
      return txMonthKey === currentMonthKey;
    });
  }, [transactions, currentMonthKey]);

  const stats = useMemo(() => {
    const income = currentMonthTransactions
      .filter((tx) => tx.type === 'Income')
      .reduce((acc, tx) => acc + tx.amount, 0);
    const expenses = currentMonthTransactions
      .filter((tx) => tx.type === 'Expenses')
      .reduce((acc, tx) => acc + tx.amount, 0);
    const netBalance = income - expenses;
    const totalTransactions = currentMonthTransactions.length;

    return { income, expenses, netBalance, totalTransactions };
  }, [currentMonthTransactions]);

  const groupedDaily = useMemo(() => {
    const days = {};
    currentMonthTransactions.forEach((tx) => {
      // Use dateString field from backend if available, otherwise parse from date
      const dayKey = tx.dateString || (() => {
        const date = new Date(tx.date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })();
      
      if (!days[dayKey]) days[dayKey] = [];
      days[dayKey].push(tx);
    });

    return Object.entries(days)
      .sort((a, b) => new Date(b[0]) - new Date(a[0]))
      .map(([day, items]) => {
        const income = items.filter((tx) => tx.type === 'Income').reduce((acc, tx) => acc + tx.amount, 0);
        const expenses = items.filter((tx) => tx.type === 'Expenses').reduce((acc, tx) => acc + tx.amount, 0);
        return { day, items, income, expenses };
      });
  }, [currentMonthTransactions]);

  const formatMoney = (value) => {
    return `$${Math.abs(value).toFixed(2)}`;
  };

  const formatDayLabel = (dayKey) => {
    const [year, month, date] = dayKey.split('-').map((v) => parseInt(v, 10));
    const target = new Date(year, month - 1, date);
    const today = new Date();
    const diffMs = today.setHours(0, 0, 0, 0) - target.setHours(0, 0, 0, 0);
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return target.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  return (
    <main className="ledger-page">
      <Container fluid className="ledger-container">
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Month Selector (title removed as requested) */}
        <div className="mb-3">
          <Form.Group>
            <Form.Control
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ maxWidth: isMobile ? '100%' : '200px' }}
            />
          </Form.Group>
        </div>

        {/* Summary Cards */}
        <Row className="g-3 mb-3">
          <Col xs={6} sm={6} lg={3}>
            <Card className="summary-card summary-card--income">
              <Card.Body>
                <div className="summary-card__icon">💰</div>
                <div className="summary-card__content">
                  <div className="summary-card__label">{t('dashboard.totalIncome')}</div>
                  <div className="summary-card__value">{formatMoney(stats.income)}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} sm={6} lg={3}>
            <Card className="summary-card summary-card--expense">
              <Card.Body>
                <div className="summary-card__icon">💸</div>
                <div className="summary-card__content">
                  <div className="summary-card__label">{t('dashboard.totalExpenses')}</div>
                  <div className="summary-card__value">{formatMoney(stats.expenses)}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} sm={6} lg={3}>
            <Card className={`summary-card ${stats.netBalance >= 0 ? 'summary-card--balance-positive' : 'summary-card--balance-negative'}`}>
              <Card.Body>
                <div className="summary-card__icon">{stats.netBalance >= 0 ? '📈' : '📉'}</div>
                <div className="summary-card__content">
                  <div className="summary-card__label">{t('dashboard.balance')}</div>
                  <div className="summary-card__value">
                    {stats.netBalance >= 0 ? '+' : '-'}{formatMoney(stats.netBalance)}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} sm={6} lg={3}>
            <Card className="summary-card summary-card--transactions">
              <Card.Body>
                <div className="summary-card__icon">📊</div>
                <div className="summary-card__content">
                  <div className="summary-card__label">Transactions</div>
                  <div className="summary-card__value">{stats.totalTransactions}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Transactions List / Table */}
        <Card>
          <Card.Body className="p-0">
            {loading ? (
              <div className="loading py-5">
                <div className="loading-spinner" />
              </div>
            ) : groupedDaily.length > 0 ? (
              isMobile ? (
                <div className="mobile-ledger">
                  {groupedDaily.map(({ day, items, income, expenses }) => {
                    const netTotal = income - expenses;
                    return (
                      <div key={day} className="mobile-ledger__group">
                        <div className="mobile-ledger__group-header">
                          <span className="mobile-ledger__date">{formatDayLabel(day)}</span>
                          <span className={`mobile-ledger__total ${netTotal >= 0 ? 'text-success' : 'text-danger'}`}>
                            {netTotal >= 0 ? '+' : '-'}${Math.abs(netTotal).toFixed(2)}
                          </span>
                        </div>
                        <div className="mobile-ledger__items">
                          {items.map((tx) => (
                            <div
                              key={tx._id}
                              className="mobile-ledger__item"
                              onClick={() => {
                                setSelectedTransaction(tx);
                                setShowDetailModal(true);
                              }}
                            >
                              <div className="mobile-ledger__icon">
                                {tx.categoryId?.icon || '📁'}
                              </div>
                              <div className="mobile-ledger__body">
                                <div className="mobile-ledger__title">{tx.categoryId?.name || t('common.uncategorized')}</div>
                                {tx.labelId && (
                                  <div className="mobile-ledger__label" style={{ backgroundColor: tx.labelId.color }}>
                                    {tx.labelId.name}
                                  </div>
                                )}
                                {tx.description && (
                                  <div className="mobile-ledger__note">{tx.description}</div>
                                )}
                              </div>
                              <div className={`mobile-ledger__amount ${tx.type === 'Income' ? 'text-success' : 'text-danger'}`}>
                                {tx.type === 'Income' ? '+' : '-'}${tx.amount.toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0 dashboard-table">
                    <thead>
                      <tr>
                        <th style={{ width: '15%' }}>{t('common.type')}</th>
                        <th style={{ width: '25%' }}>{t('dashboard.category')}</th>
                        <th style={{ width: '10%' }}>{t('dashboard.label')}</th>
                        <th className="text-end" style={{ width: '15%' }}>{t('dashboard.amount')}</th>
                        <th style={{ width: '35%' }}>{t('common.note')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedDaily.map(({ day, items, income, expenses }) => {
                        const netTotal = income - expenses;
                        return (
                          <React.Fragment key={day}>
                            <tr className="dashboard-table__group-header">
                              <td colSpan={5}>
                                <div className="d-flex justify-content-between align-items-center">
                                  <strong>
                                    {(() => {
                                      const [year, month, date] = day.split('-');
                                      const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(date));
                                      return localDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                                    })()}
                                  </strong>
                                  <span className={netTotal >= 0 ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                                    {netTotal >= 0 ? '+' : '-'}${Math.abs(netTotal).toFixed(2)}
                                  </span>
                                </div>
                              </td>
                            </tr>
                            {items.map((tx) => (
                              <tr
                                key={tx._id}
                                onClick={() => {
                                  setSelectedTransaction(tx);
                                  setShowDetailModal(true);
                                }}
                                style={{
                                  cursor: 'pointer',
                                  backgroundColor: tx.type === 'Income' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                                }}
                              >
                                <td>
                                  <Badge bg={tx.type === 'Income' ? 'success' : 'danger'}>
                                    {tx.type === 'Income' ? t('dashboard.income') : t('dashboard.expense')}
                                  </Badge>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center gap-2">
                                    <span
                                      style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '4px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem'
                                      }}
                                    >
                                      {tx.categoryId?.icon || '📁'}
                                    </span>
                                    <span>{tx.categoryId?.name || t('common.uncategorized')}</span>
                                  </div>
                                </td>
                                <td style={{ whiteSpace: 'nowrap' }}>
                                  {tx.labelId ? (
                                    <span className="label-pill" style={{ backgroundColor: tx.labelId.color, whiteSpace: 'nowrap' }}>
                                      {tx.labelId.name}
                                    </span>
                                  ) : (
                                    <span className="text-muted"></span>
                                  )}
                                </td>
                                <td className={`text-end fw-bold ${tx.type === 'Income' ? 'text-success' : 'text-danger'}`}>
                                  {tx.type === 'Income' ? '+' : '-'}${tx.amount.toFixed(2)}
                                </td>
                                <td className="text-muted" style={{ maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {tx.description || ''}
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              )
            ) : (
              <p className="text-center text-muted py-5">No transactions this month yet</p>
            )}
          </Card.Body>
        </Card>

        {/* Floating Action Button */}
        <Button
          className="fab"
          variant="primary"
          onClick={() => setShowAddModal(true)}
          title={t('dashboard.addTransaction')}
        >
          +
        </Button>

        {/* Add Transaction Modal */}
        <AddTransactionModal
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
          onSuccess={fetchDashboardData}
        />

        {/* Edit Transaction Modal */}
        <TransactionDetailModal
          show={showDetailModal}
          onHide={() => setShowDetailModal(false)}
          transaction={selectedTransaction}
          onSuccess={fetchDashboardData}
        />
      </Container>
    </main>
  );
}

export default Dashboard;
