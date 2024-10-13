import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Loader, Trash2, Edit2, X } from 'lucide-react';

const AdminAlertComponent = () => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingAlert, setEditingAlert] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8070/api/alerts');
      if (!response.ok) throw new Error('Failed to fetch alerts');
      const data = await response.json();
      setAlerts(data.map(alert => ({
        ...alert,
        timestamp: new Date(alert.timestamp).toLocaleString() // Format timestamp for display
      })));
    } catch (err) {
      setError('Error fetching alerts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editingAlert) {
        // Update existing alert
        const response = await fetch(`http://localhost:8070/api/alerts/${editingAlert.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description, category }),
        });

        if (!response.ok) throw new Error('Failed to update alert');
        setSuccess('Alert updated successfully!');
        setEditingAlert(null);
      } else {
        // Create new alert
        const response = await fetch('http://localhost:8070/api/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description, category }),
        });

        if (!response.ok) throw new Error('Failed to create alert');
        setSuccess('Alert created successfully!');
      }
      
      setDescription('');
      setCategory('');
      fetchAlerts();
    } catch (err) {
      setError(`Error ${editingAlert ? 'updating' : 'creating'} alert: ` + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8070/api/alerts/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete alert');
      setSuccess('Alert deleted successfully!');
      fetchAlerts();
    } catch (err) {
      setError('Error deleting alert: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (alert) => {
    setEditingAlert(alert);
    setDescription(alert.description);
    setCategory(alert.category);
  };

  const cancelEdit = () => {
    setEditingAlert(null);
    setDescription('');
    setCategory('');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center mb-6">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
              {editingAlert ? 'Edit Alert' : 'Create New Alert'}
            </h1>
            {error && (
              <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
                <p>{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded" role="alert">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <p>{success}</p>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? <Loader className="animate-spin h-5 w-5 mr-3" /> : editingAlert ? 'Update Alert' : 'Create Alert'}
                </button>
                {editingAlert && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Existing Alerts</h2>
            {loading && !editingAlert ? (
              <div className="flex justify-center items-center">
                <Loader className="animate-spin h-5 w-5 mr-3" />
                <span>Loading alerts...</span>
              </div>
            ) : alerts.length > 0 ? (
              <div className="space-y-4">
                {alerts.slice().reverse().map((alert) => (
                  
                  <div key={alert.id} className="border-b border-gray-200 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-lg font-medium text-gray-900">{alert.description}</p>
                        <p className="text-sm text-gray-600">Category: {alert.category}</p>
                        <p className="text-sm text-gray-500">Created at: {alert.timestamp}</p> {/* Display timestamp */}
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => handleEdit(alert)} className="text-indigo-600 hover:text-indigo-900">
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(alert.id)} className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                ))}
              </div>
            ) : (
              <p className="text-gray-600">No alerts found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAlertComponent;