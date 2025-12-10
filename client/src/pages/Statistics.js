import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Table } from 'react-bootstrap';
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

  const monthlySeries = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      months.push({ key, label: d.toLocaleString('default', { month: 'short' }) });
    }

    const incomeData = months.map(({ key }) =>
      transactions
        .filter((tx) => {
          const d = new Date(tx.date);
          return `${d.getFullYear()}-${d.getMonth()}` === key && tx.type === 'Income';
        })
        .reduce((acc, tx) => acc + tx.amount, 0)
    );

    const expenseData = months.map(({ key }) =>
      transactions
        .filter((tx) => {
          const d = new Date(tx.date);
          return `${d.getFullYear()}-${d.getMonth()}` === key && tx.type === 'Expenses';
        })
        .reduce((acc, tx) => acc + tx.amount, 0)
    );

    return {
      labels: months.map((m) => m.label),
      incomeData,
      expenseData
    };
  }, [transactions]);

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
      labels: monthlySeries.labels,
      datasets: [
        {
          label: 'Income',
          data: monthlySeries.incomeData,
          backgroundColor: '#22c55e'
        },
        {
          label: 'Expenses',
          data: monthlySeries.expenseData,
          backgroundColor: '#ef4444'
        }
      ]
    }),
    [monthlySeries]
  );

  const pieChartData = useMemo(
    () => ({
      labels: categoryRanking.map((c) => c.name),
      datasets: [
        {
          data: categoryRanking.map((c) => c.total),
          backgroundColor: categoryRanking.map((c) => c.color),
          borderWidth: 2,
          borderColor: '#fff'
        }
      ]
    }),
    [categoryRanking]
  );

  const labelChartData = useMemo(() => {
    const labelMap = {};
    transactions
      .filter((tx) => tx.labelId)
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
  }, [transactions]);

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
                  <Button size="sm" variant="outline-secondary" onClick={fetchData}>
                    {t('common.refresh')}
                  </Button>
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
                <div className="fw-bold">{t('statistics.categoryDistribution')}</div>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="loading">
                    <div className="loading-spinner" />
                  </div>
                ) : categoryRanking.length > 0 ? (
                  <Doughnut data={pieChartData} options={pieOptions} />
                ) : (
                  <p className="text-center text-muted">{t('common.noData')}</p>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Header>
                <div className="fw-bold">{t('statistics.labelDistribution')}</div>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="loading">
                    <div className="loading-spinner" />
                  </div>
                ) : labelChartData.labels.length > 0 ? (
                  <Doughnut data={labelChartData} options={pieOptions} />
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
