import React, { useState, useEffect } from 'react';
import { Package, Clock, AlertCircle, CheckSquare, Zap, ArrowRight } from 'lucide-react';
import { analyticsAPI, orderAPI, productAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [urgentItems, setUrgentItems] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    setLoading(true);
    try {
      const [roleResponse, ordersResponse, productsResponse] = await Promise.all([
        analyticsAPI.getRoleInsights('staff'),
        orderAPI.getAll(),
        productAPI.getAll()
      ]);

      if (roleResponse.data?.insights) {
        const insightLines = roleResponse.data.insights.split('\n').filter(line => line.trim() && line.includes(':'));
        const formattedTasks = insightLines.slice(0, 4).map((task, index) => {
          const [typeText, content] = task.split(':', 2);
          return {
            id: index,
            text: content?.trim() || task,
            priority: typeText.toLowerCase().includes('urgent') ? 'HIGH' : 
                     typeText.toLowerCase().includes('restock') ? 'MEDIUM' : 'NORMAL',
            type: typeText.toLowerCase().includes('urgent') ? 'urgent' : 
                  typeText.toLowerCase().includes('restock') ? 'restock' : 'task',
            completed: false
          };
        });
        setTasks(formattedTasks);
      }

      const orders = ordersResponse.data;
      const products = productsResponse.data;
      
      const criticalStock = products.filter(p => p.quantity <= p.reorderLevel * 0.5);
      const lowStock = products.filter(p => p.quantity <= p.reorderLevel);
      const pendingOrders = orders.filter(o => o.status === 'Pending');
      const todayOrders = orders.filter(order => {
        const today = new Date();
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === today.toDateString();
      });

      setUrgentItems(criticalStock.slice(0, 5));
      setMetrics({
        criticalStock: criticalStock.length,
        lowStock: lowStock.length,
        pendingOrders: pendingOrders.length,
        todayOrders: todayOrders.length,
        totalTasks: criticalStock.length + pendingOrders.length
      });
    } catch (error) {
      console.error('Error fetching staff data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <span className="ml-3 text-red-600 font-medium">Loading Task Center...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-3 rounded-xl animate-pulse shadow-lg">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <h2 className="text-2xl font-bold text-red-900">⚡ TASK COMMAND CENTER</h2>
          <p className="text-red-600 text-sm font-semibold">Immediate Actions Required</p>
        </div>
      </div>

      {/* Urgent Status Bar */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6 rounded-2xl mb-6 shadow-2xl border border-red-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 mr-4 animate-bounce" />
            <div>
              <div className="font-bold text-2xl">{metrics?.totalTasks || 0} URGENT TASKS</div>
              <div className="text-red-100 text-sm font-medium">Immediate attention required</div>
            </div>
          </div>
          <div className="text-right bg-white/20 rounded-xl p-4">
            <div className="text-3xl font-bold">{metrics?.criticalStock || 0}</div>
            <div className="text-red-100 text-sm font-medium">CRITICAL ITEMS</div>
          </div>
        </div>
      </div>

      {/* Task Counters */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border-2 border-red-300 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="text-center">
            <div className="text-4xl font-bold text-red-900 mb-2">{metrics?.criticalStock || 0}</div>
            <div className="text-red-600 font-bold text-sm">🚨 CRITICAL</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-300 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-900 mb-2">{metrics?.pendingOrders || 0}</div>
            <div className="text-yellow-600 font-bold text-sm">⏰ PENDING</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-300 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-900 mb-2">{metrics?.todayOrders || 0}</div>
            <div className="text-blue-600 font-bold text-sm">📦 TODAY</div>
          </div>
        </div>
      </div>

      {/* Critical Items Alert */}
      {urgentItems.length > 0 && (
        <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-3">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="font-bold text-red-900">🚨 CRITICAL STOCK ALERT</h3>
          </div>
          <div className="space-y-2">
            {urgentItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-red-300">
                <div>
                  <span className="font-medium text-red-900">{item.name}</span>
                  <span className="text-red-600 text-sm ml-2">({item.quantity} left)</span>
                </div>
                <button
                  onClick={() => navigate(`/products?search=${item.name}`)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-700"
                >
                  RESTOCK NOW
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Task List */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">🤖 AI TASK PRIORITIZER</h3>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-lg border-2 ${
                task.priority === 'HIGH' ? 'bg-red-50 border-red-400' :
                task.priority === 'MEDIUM' ? 'bg-yellow-50 border-yellow-400' :
                'bg-green-50 border-green-400'
              } ${task.completed ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`mr-3 mt-1 ${task.completed ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    <CheckSquare className="h-5 w-5" />
                  </button>
                  <div>
                    <div className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.text}
                    </div>
                    <div className={`text-xs font-bold ${
                      task.priority === 'HIGH' ? 'text-red-600' :
                      task.priority === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {task.priority} PRIORITY
                    </div>
                  </div>
                </div>
                {!task.completed && (
                  <button
                    onClick={() => navigate(task.type === 'restock' ? '/products?filter=lowstock' : '/orders')}
                    className={`px-4 py-2 rounded font-bold text-white text-sm ${
                      task.priority === 'HIGH' ? 'bg-red-600 hover:bg-red-700' :
                      task.priority === 'MEDIUM' ? 'bg-yellow-600 hover:bg-yellow-700' :
                      'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    DO IT NOW
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/products?filter=lowstock')}
          className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6 rounded-2xl hover:from-red-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
        >
          <div className="text-center">
            <Package className="h-10 w-10 mx-auto mb-3" />
            <div className="font-bold text-lg">CHECK STOCK</div>
            <div className="text-red-100 text-sm font-medium">Critical Items</div>
          </div>
        </button>
        <button
          onClick={() => navigate('/orders')}
          className="bg-gradient-to-r from-orange-600 to-yellow-600 text-white p-6 rounded-2xl hover:from-orange-700 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
        >
          <div className="text-center">
            <Clock className="h-10 w-10 mx-auto mb-3" />
            <div className="font-bold text-lg">PROCESS ORDERS</div>
            <div className="text-orange-100 text-sm font-medium">Pending Queue</div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default StaffDashboard;