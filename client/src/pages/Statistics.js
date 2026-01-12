import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Table, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { transactionApi, categoryApi, labelApi } from '../services/api';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

function Statistics() {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [categories, setCategories] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categoryType, setCategoryType] = useState('Expenses');
  const [labelType, setLabelType] = useState('Expenses');
  const [timeRange, setTimeRange] = useState('month'); // week | month | year

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [txRes, catRes, labRes] = await Promise.all([
        transactionApi.getTransactions({ limit: 1000, page: 1 }),
        categoryApi.getCategories(),
        labelApi.getLabels()
      ]);
      setTransactions(txRes.data.transactions);
      setCategories(catRes.data);
      setLabels(labRes.data);
    } catch (err) {
      console.error('Error fetching statistics data:', err);
      setError(err.response?.data?.error || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const timeSeries = useMemo(() => {
    // Parse date from dateString (YYYY-MM-DD) or date field
    const parseTransactionDate = (tx) => {
      if (tx.dateString) {
        // dateString format: YYYY-MM-DD (no timezone issues)
        const parts = tx.dateString.split('-').map(p => parseInt(p, 10));
        return new Date(parts[0], parts[1] - 1, parts[2]); // local date
      }
      // Fallback to date field
      const d = new Date(tx.date);
      return Number.isNaN(d.getTime()) ? null : d;
    };

    // Get week key: Sunday-based week, format: "YYYY-Wnn" based on week's Sunday
    const getWeekKey = (date) => {
      const d = new Date(date);
      const day = d.getDay(); // 0 = Sunday
      // Move to the Sunday of this week
      const sunday = new Date(d);
      sunday.setDate(d.getDate() - day);
      return `${sunday.getFullYear()}-W${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`;
    };

    const aggregate = (periods, keyFn) => {
      const buckets = periods.reduce((acc, p) => {
        acc[p.key] = { income: 0, expenses: 0 };
        return acc;
      }, {});

      transactions.forEach((tx) => {
        const d = parseTransactionDate(tx);
        if (!d) return;
        const key = keyFn(d);
        if (!buckets[key]) return;
        if (tx.type === 'Income') buckets[key].income += tx.amount;
        else buckets[key].expenses += tx.amount;
      });

      return {
        labels: periods.map((p) => p.label),
        incomeData: periods.map((p) => buckets[p.key].income),
        expenseData: periods.map((p) => buckets[p.key].expenses)
      };
    };

    if (timeRange === 'week') {
      const periods = [];
      const now = new Date();
      // Find the Sunday of current week
      const currentSunday = new Date(now);
      currentSunday.setDate(now.getDate() - now.getDay());

      // Generate last 8 weeks (Sunday to Saturday)
      for (let i = 7; i >= 0; i -= 1) {
        const sunday = new Date(currentSunday);
        sunday.setDate(currentSunday.getDate() - i * 7);
        const saturday = new Date(sunday);
        saturday.setDate(sunday.getDate() + 6);
        
        const key = getWeekKey(sunday);
        const label = `${String(sunday.getMonth() + 1).padStart(2, '0')}/${String(sunday.getDate()).padStart(2, '0')}-${String(saturday.getMonth() + 1).padStart(2, '0')}/${String(saturday.getDate()).padStart(2, '0')}`;
        periods.push({ key, label });
      }
      return aggregate(periods, getWeekKey);
    }

    if (timeRange === 'year') {
      const now = new Date();
      const periods = [];
      for (let i = 3; i >= 0; i -= 1) {
        const year = now.getFullYear() - i;
        periods.push({ key: `${year}`, label: `${year}` });
      }
      return aggregate(periods, (d) => `${d.getFullYear()}`);
    }

    // default: month (last 6 months)
    const now = new Date();
    const periods = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = d.toLocaleString('default', { month: 'short' });
      periods.push({ key, label });
    }
    return aggregate(periods, (d) => `${d.getFullYear()}-${d.getMonth()}`);
  }, [transactions, timeRange]);

  const categoryRanking = useMemo(() => {
    const categoryMap = {};
    transactions
      .filter((tx) => tx.categoryId)
      .forEach((tx) => {
        const catId = tx.categoryId._id || tx.categoryId;
        const key = `${catId}-${tx.type}`;
        if (!categoryMap[key]) {
          categoryMap[key] = {
            id: catId,
            name: tx.categoryId.name || 'Unknown',
            type: tx.type,
            color: tx.categoryId.color || '#6366f1',
            icon: tx.categoryId.icon || '📁',
            total: 0,
            labels: []
          };
        }
        categoryMap[key].total += tx.amount;
        if (tx.labelId && !categoryMap[key].labels.find(l => l._id === tx.labelId._id)) {
          categoryMap[key].labels.push(tx.labelId);
        }
      });

    return Object.values(categoryMap).sort((a, b) => b.total - a.total);
  }, [transactions]);

  const chartData = useMemo(
    () => ({
      labels: timeSeries.labels,
      datasets: [
        {
          label: t('statistics.income'),
          data: timeSeries.incomeData,
          backgroundColor: '#22c55e'
        },
        {
          label: t('statistics.expenses'),
          data: timeSeries.expenseData,
          backgroundColor: '#ef4444'
        }
      ]
    }),
    [timeSeries, t]
  );

  const categoryChartData = useMemo(
    () => {
      const filtered = categoryRanking.filter((c) => c.type === categoryType);
      return {
        labels: filtered.map((c) => c.name),
        datasets: [
          {
            data: filtered.map((c) => c.total),
            backgroundColor: filtered.map((c) => c.color),
            borderWidth: 2,
            borderColor: '#fff'
          }
        ]
      };
    },
    [categoryRanking, categoryType]
  );

  const labelChartData = useMemo(() => {
    const labelMap = {};
    transactions
      .filter((tx) => tx.labelId && tx.type === labelType)
      .forEach((tx) => {
        const labelId = tx.labelId._id || tx.labelId;
        if (!labelMap[labelId]) {
          labelMap[labelId] = {
            id: labelId,
            name: tx.labelId.name || 'Unknown',
            color: tx.labelId.color || '#6366f1',
            total: 0
          };
        }
        labelMap[labelId].total += tx.amount;
      });

    const labelArray = Object.values(labelMap).sort((a, b) => b.total - a.total);
    return {
      labels: labelArray.map((l) => l.name),
      datasets: [
        {
          data: labelArray.map((l) => l.total),
          backgroundColor: labelArray.map((l) => l.color),
          borderWidth: 2,
          borderColor: '#fff'
        }
      ]
    };
  }, [transactions, labelType]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { stacked: false },
      y: { stacked: false, beginAtZero: true }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1,
    plugins: {
      legend: { display: true, position: 'right' },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${formatMoney(value)} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%'
  };

  const formatMoney = (value) => {
    return `$${Math.abs(value).toFixed(2)}`;
  };

  const categoryTotals = useMemo(() => {
    const map = {};
    transactions
      .filter((tx) => tx.categoryId)
      .forEach((tx) => {
        const id = tx.categoryId._id || tx.categoryId;
        if (!map[id]) {
          map[id] = {
            id,
            name: tx.categoryId.name || 'Unknown',
            color: tx.categoryId.color || '#6366f1',
            icon: tx.categoryId.icon || '📁',
            expenses: 0,
            income: 0
          };
        }
        if (tx.type === 'Income') {
          map[id].income += tx.amount;
        } else {
          map[id].expenses += tx.amount;
        }
      });

    return Object.values(map).sort((a, b) => (b.expenses + b.income) - (a.expenses + a.income));
  }, [transactions]);

  const visibleCategoryTotals = useMemo(
    () =>
      categoryTotals.filter((cat) =>
        categoryType === 'Expenses' ? cat.expenses > 0 : cat.income > 0
      ),
    [categoryTotals, categoryType]
  );

  const labelTotals = useMemo(() => {
    const map = {};
    transactions
      .filter((tx) => tx.labelId)
      .forEach((tx) => {
        const id = tx.labelId._id || tx.labelId;
        if (!map[id]) {
          map[id] = {
            id,
            name: tx.labelId.name || 'Unknown',
            color: tx.labelId.color || '#6366f1',
            expenses: 0,
            income: 0
          };
        }
        if (tx.type === 'Income') {
          map[id].income += tx.amount;
        } else {
          map[id].expenses += tx.amount;
        }
      });

    return Object.values(map).sort((a, b) => (b.expenses + b.income) - (a.expenses + a.income));
  }, [transactions]);

  const visibleLabelTotals = useMemo(
    () =>
      labelTotals.filter((lab) =>
        labelType === 'Expenses' ? lab.expenses > 0 : lab.income > 0
      ),
    [labelTotals, labelType]
  );

  return (
    <main className="ledger-page">
      <Container fluid className="ledger-container">
        {error && <div className="alert alert-danger">{error}</div>}

        <Row className="g-3 mb-3">
          <Col md={12}>
            <Card>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <div className="fw-bold">{t('statistics.spendingOverview')}</div>
                  <div className="d-flex align-items-center gap-2 flex-nowrap">
                    <Form.Select
                      size="sm"
                      style={{
                        minWidth: '110px',
                        maxWidth: '140px',
                        backgroundColor: '#f3f4f6',
                        color: '#4b5563',
                        border: '1px solid #e5e7eb',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                      }}
                      aria-label="time range selector"
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                    >
                      <option value="week">{t('statistics.week')}</option>
                      <option value="month">{t('statistics.month')}</option>
                      <option value="year">{t('statistics.year')}</option>
                    </Form.Select>
                    <Button size="sm" variant="outline-secondary" onClick={fetchData}>
                      {t('common.refresh')}
                    </Button>
                  </div>
                </div>
                {loading ? (
                  <div className="loading">
                    <div className="loading-spinner" />
                  </div>
                ) : (
                  <Bar data={chartData} options={chartOptions} height={80} />
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-3">
          <Col md={6}>
            <Card>
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
                  <div className="fw-bold">{t('statistics.categoryDistribution')}</div>
                  <div className="toggle-switch-container" role="group" aria-label="category type selector">
                    <input
                      type="checkbox"
                      id="categoryToggle"
                      className="toggle-switch-input"
                      checked={categoryType === 'Income'}
                      onChange={(e) => setCategoryType(e.target.checked ? 'Income' : 'Expenses')}
                    />
                    <label htmlFor="categoryToggle" className="toggle-switch-label">
                      <span className="toggle-switch-inner">
                        <span className="toggle-switch-icon-off">💸 {t('statistics.expenses')}</span>
                        <span className="toggle-switch-icon-on">💰 {t('statistics.income')}</span>
                      </span>
                      <span className="toggle-switch-switch" />
                    </label>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="loading">
                    <div className="loading-spinner" />
                  </div>
                ) : categoryChartData.labels.length > 0 ? (
                  <>
                    <Doughnut data={categoryChartData} options={pieOptions} />
                    {visibleCategoryTotals.length > 0 && (
                      <div className="small category-list-container">
                        <div className="d-flex text-muted fw-semibold mb-2">
                          <div style={{ width: '40%' }}>{t('statistics.category')}</div>
                          <div className="flex-grow-1 text-end">{t(`statistics.${categoryType.toLowerCase()}`)}</div>
                        </div>
                        <div className="d-flex flex-column gap-2 category-list-scroll">
                          {visibleCategoryTotals.map((cat) => (
                            <div key={cat.id} className="d-flex align-items-center gap-2" aria-label={`category-${categoryType}`}>
                              <div
                                className="ledger-row__icon"
                                style={{
                                  backgroundColor: cat.color,
                                  width: '32px',
                                  height: '32px',
                                  fontSize: '1.25rem'
                                }}
                              >
                                {cat.icon}
                              </div>
                              <div style={{ width: '40%' }} className="text-truncate">
                                {cat.name}
                              </div>
                              <div
                                className={`flex-grow-1 text-end fw-semibold ${categoryType === 'Expenses' ? 'text-danger' : 'text-success'}`}
                              >
                                {categoryType === 'Expenses' ? '-' : '+'}
                                {formatMoney(categoryType === 'Expenses' ? cat.expenses : cat.income)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-center text-muted">{t('common.noData')}</p>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
                  <div className="fw-bold">{t('statistics.labelDistribution')}</div>
                  <div className="toggle-switch-container" role="group" aria-label="label type selector">
                    <input
                      type="checkbox"
                      id="labelToggle"
                      className="toggle-switch-input"
                      checked={labelType === 'Income'}
                      onChange={(e) => setLabelType(e.target.checked ? 'Income' : 'Expenses')}
                    />
                    <label htmlFor="labelToggle" className="toggle-switch-label">
                      <span className="toggle-switch-inner">
                        <span className="toggle-switch-icon-off">💸 {t('statistics.expenses')}</span>
                        <span className="toggle-switch-icon-on">💰 {t('statistics.income')}</span>
                      </span>
                      <span className="toggle-switch-switch" />
                    </label>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="loading">
                    <div className="loading-spinner" />
                  </div>
                ) : labelChartData.labels.length > 0 ? (
                  <>
                    <Doughnut data={labelChartData} options={pieOptions} />
                    {visibleLabelTotals.length > 0 && (
                      <div className="small label-list-container">
                        <div className="d-flex text-muted fw-semibold mb-2">
                          <div style={{ width: '40%' }}>{t('dashboard.label')}</div>
                          <div className="flex-grow-1 text-end">{t(`statistics.${labelType.toLowerCase()}`)}</div>
                        </div>
                        <div className="d-flex flex-column gap-2 label-list-scroll">
                          {visibleLabelTotals.map((lab) => (
                            <div key={lab.id} className="d-flex align-items-center gap-2" aria-label={`label-${labelType}`}>
                              <span
                                className="label-pill text-truncate"
                                style={{
                                  backgroundColor: lab.color,
                                  color: '#fff',
                                  minWidth: '40%',
                                  padding: '4px 10px'
                                }}
                              >
                                {lab.name}
                              </span>
                              <div
                                className={`flex-grow-1 text-end fw-semibold ${labelType === 'Expenses' ? 'text-danger' : 'text-success'}`}
                              >
                                {labelType === 'Expenses' ? '-' : '+'}
                                {formatMoney(labelType === 'Expenses' ? lab.expenses : lab.income)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-center text-muted">{t('common.noData')}</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-3 mt-3">
          <Col md={12}>
            <Card>
              <Card.Header>
                <div className="fw-bold">{t('statistics.topSpending')}</div>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="loading">
                    <div className="loading-spinner" />
                  </div>
                ) : categoryRanking.length > 0 ? (
                  <Table hover responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>{t('statistics.category')}</th>
                        <th>{t('dashboard.label')}</th>
                        <th style={{ minWidth: '80px' }}>{t('common.type')}</th>
                        <th className="text-end">{t('statistics.amount')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryRanking.slice(0, 10).map((cat, idx) => (
                        <tr key={cat.id}>
                          <td>{idx + 1}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="ledger-row__icon"
                                style={{
                                  backgroundColor: cat.color,
                                  width: '36px',
                                  height: '36px',
                                  fontSize: '1.5rem'
                                }}
                              >
                                {cat.icon}
                              </div>
                              <span>{cat.name}</span>
                            </div>
                          </td>
                          <td>
                            {cat.labels && cat.labels.length > 0 ? (
                              <div className="d-flex flex-wrap gap-1">
                                {cat.labels.map((label) => (
                                  <span
                                    key={label._id}
                                    className="label-pill"
                                    style={{ backgroundColor: label.color }}
                                  >
                                    {label.name}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </td>
                          <td>
                            <span className={`badge ${cat.type === 'Income' ? 'bg-success' : 'bg-danger'}`}>
                              {cat.type}
                            </span>
                          </td>
                          <td className={`text-end fw-bold ${cat.type === 'Income' ? 'text-success' : 'text-danger'}`}>
                            {cat.type === 'Income' ? '+' : '-'}{formatMoney(cat.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p className="text-center text-muted">{t('common.noData')}</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
}

export default Statistics;
