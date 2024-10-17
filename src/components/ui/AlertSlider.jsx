import React, { useState, useEffect, useRef } from 'react';
import { X, Bell, XCircle, AlertCircle } from 'lucide-react';

const AlertSlider = ({ isOpen, toggleAlertSlider }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);
  const websocketRef = useRef(null);
  const lastAlertRef = useRef('');

  useEffect(() => {
    if (isOpen) {
      fetchAlerts();
    }
  }, [isOpen]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
        websocketRef.current.close();
        console.log('WebSocket closed');
      }
    };
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8070/api/alerts');
      if (!response.ok) throw new Error('Failed to fetch alerts');
      const data = await response.json();
      setAlerts(sortAlertsByTimestamp(data));
    } catch (err) {
      setError('Error fetching alerts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const sortAlertsByTimestamp = (alertsArray) => {
    return alertsArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const connectWebSocket = () => {
    const ws = new WebSocket('ws://localhost:9091/subscribe/yourUsername');

    ws.onopen = () => {
      console.log('Connected to the alert service');
    };

    ws.onmessage = (event) => {
      const message = event.data;
      console.log('Received WebSocket message:', message);

      const messageParts = message.split(' at ');
      const description = messageParts[0].replace('New Alert: ', '').trim();
      const timestamp = messageParts[1];

      const newAlertMessage = `${description}`;

      if (lastAlertRef.current !== newAlertMessage) {
        console.log('Displaying new alert:', newAlertMessage);

        showNotification(newAlertMessage);

        setAlerts((prevAlerts) => {
          const newAlert = { id: Date.now(), description, timestamp };
          const updatedAlerts = [newAlert, ...prevAlerts];
          
          // Remove duplicates based on description and keep the most recent
          const uniqueAlerts = updatedAlerts.reduce((acc, current) => {
            const x = acc.find(item => item.description === current.description);
            if (!x) {
              return acc.concat([current]);
            } else {
              // If duplicate found, keep the one with the latest timestamp
              return acc.map(item => item.description === current.description && new Date(current.timestamp) > new Date(item.timestamp) ? current : item);
            }
          }, []);

          // Sort alerts by timestamp, most recent first
          return sortAlertsByTimestamp(uniqueAlerts);
        });

        lastAlertRef.current = newAlertMessage;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = (event) => {
      if (event.wasClean) {
        console.log(`WebSocket connection closed cleanly, code=${event.code}, reason=${event.reason}`);
      } else {
        console.error('WebSocket connection closed unexpectedly');
      }
    };

    websocketRef.current = ws;
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 5000);
  };

  const dismissAlert = (alertId) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
  };

  return (
    <>
      <div
        className={`fixed top-0 right-0 w-80 h-full bg-gray-50 shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center text-gray-800">
              <Bell className="mr-2 text-blue-600" /> Alerts
            </h2>
            <button onClick={toggleAlertSlider} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          {loading ? (
            <p className="text-center text-gray-600">Loading alerts...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : alerts.length > 0 ? (
            <div className="space-y-4 overflow-y-auto flex-grow pr-2">
              {alerts.map((alert) => (
                <div key={alert.id} className="bg-white border-l-4 border-blue-500 rounded-r-lg shadow-md p-4 relative hover:shadow-lg transition-shadow duration-200">
                  <h3 className="text-blue-800 font-semibold text-sm mb-1">
                    {new Date(alert.timestamp).toLocaleString()}
                  </h3>
                  <p className="text-gray-700 text-sm">
                    {alert.description}
                  </p>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">No alerts found.</p>
          )}
        </div>
      </div>
      {notification && (
        <div className="fixed bottom-4 right-4 max-w-sm w-full bg-white border-l-4 border-blue-500 rounded-lg shadow-lg z-50 animate-[slideUp_0.3s_ease-out]">
          <div className="p-4 flex items-start">
            <AlertCircle className="text-blue-500 mr-3 flex-shrink-0 mt-1" size={20} />
            <div className="flex-grow">
              <h4 className="text-sm font-semibold text-gray-800 mb-1">New Alert</h4>
              <p className="text-sm text-gray-600">{notification}</p>
            </div>
            <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-gray-600 transition-colors duration-200 ml-2 flex-shrink-0">
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AlertSlider;