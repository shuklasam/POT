import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function DemandForecastModal({ onClose, selectedIds, allProducts}) {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForecast();
  }, []);

  const fetchForecast = async () => {
    try {
      const res = await api.get('/api/products/forecast');
      // if any specific products are selected then show only them
      // if nothing is selected then show all
      if(selectedIds && selectedIds.length > 0){
        setForecasts(res.data.filter(p => selectedIds.includes(p.product_id)));
      } else{
        setForecasts(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: forecasts.map((p) => p.name),
    datasets: [
      {
        label: 'Product Demand',
        data: forecasts.map((p) => parseFloat(p.demand_forecast) || 0),
        borderColor: '#9B59B6',
        backgroundColor: 'rgba(155, 89, 182, 0.1)',
        tension: 0.4,
        pointRadius: 4,
      },
      {
        label: 'Selling Price',
        data: forecasts.map((p) => parseFloat(p.selling_price) || 0),
        borderColor: '#00D4AA',
        backgroundColor: 'rgba(0, 212, 170, 0.1)',
        tension: 0.4,
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: 'white', font: { size: 12 } },
      },
    },
    scales: {
      x: {
        ticks: { color: '#aaa', font: { size: 11 } },
        grid: { color: '#333' },
      },
      y: {
        ticks: { color: '#aaa' },
        grid: { color: '#333' },
      },
    },
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <h3 style={styles.title}>Demand Forecast</h3>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <p style={styles.loading}>Loading...</p>
        ) : (
          <>
            {/* Chart */}
            <div style={styles.chartWrapper}>
              <Line data={chartData} options={chartOptions} />
            </div>

            {/* Table */}
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    <th style={styles.th}>Product Name</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Selling Price</th>
                    <th style={styles.thAccent}>Calculated Demand Forecast</th>
                  </tr>
                </thead>
                <tbody>
                  {forecasts.map((p, i) => (
                    <tr key={p.product_id} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                      <td style={styles.td}>{p.name}</td>
                      <td style={styles.td}>{p.category}</td>
                      <td style={styles.td}>$ {p.selling_price}</td>
                      <td style={styles.tdAccent}>
                        {p.demand_forecast ? parseFloat(p.demand_forecast).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#1a1a1a', borderRadius: '10px', padding: '28px', width: '900px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #333' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { color: 'white', margin: 0, fontSize: '18px' },
  closeBtn: { background: '#ff4444', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer', borderRadius: '50%', width: '28px', height: '28px' },
  chartWrapper: { backgroundColor: '#111', borderRadius: '8px', padding: '20px', marginBottom: '20px' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#222' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', color: 'white', borderBottom: '1px solid #333' },
  thAccent: { padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 'bold', color: '#00D4AA', borderBottom: '1px solid #333' },
  td: { padding: '11px 16px', fontSize: '13px', color: 'white', borderBottom: '1px solid #222' },
  tdAccent: { padding: '11px 16px', fontSize: '13px', color: '#000', fontWeight: 'bold', backgroundColor: '#00D4AA', borderBottom: '1px solid #222' },
  trEven: { backgroundColor: '#1a1a1a' },
  trOdd: { backgroundColor: '#1f1f1f' },
  loading: { color: '#aaa', textAlign: 'center', padding: '40px' },
};