import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const AlertSlider = ({ isOpen, toggleAlertSlider }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchAlerts();
    }
  }, [isOpen]);

  const fetchAlerts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8070/api/alerts');
      if (!response.ok) throw new Error('Failed to fetch alerts');
      const data = await response.json();
      setAlerts(data);
    } catch (err) {
      setError('Error fetching alerts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 w-80 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Alerts</h2>
          <button onClick={toggleAlertSlider} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {loading ? (
            <p>Loading alerts...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="bg-blue-100 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">{alert.description}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p>No alerts found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertSlider;