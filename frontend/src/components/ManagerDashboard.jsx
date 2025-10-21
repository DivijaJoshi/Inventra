import React, { useState, useEffect } from 'react';
import { Users, Clock, TrendingUp, AlertTriangle, CheckCircle, Target, BarChart3 } from 'lucide-react';
import { analyticsAPI, orderAPI, productAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const ManagerDashboard = () => {
  const [insights, setInsights] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    setLoading(true);
    try {
      const [roleResponse, ordersResponse, productsResponse] = await Promise.all([
        analyticsAPI.getRoleInsights('manager'),
        orderAPI.getAll(),
        productAPI.getAll()
      ]);

      if (roleResponse.data?.insights) {
        const insightLines = roleResponse.data.insights.split('\n').filter(line => line.trim() && line.includes(':'));
        const formattedInsights = insightLines.slice(0, 4).map((insight, index) => {
          const [typeText, content] = insight.split(':', 2);
          return {
            id: index,
            text: content?.trim() || insight,
            type: typeText.toLowerCase().includes('priority') ? 'priority' : 
                  typeText.toLowerCase().includes('workflow') ? 'workflow' : 
                  typeText.toLowerCase().includes('team') ? 'team' : 'alert',
            urgency: typeText.toLowerCase().includes('urgent') ? 'high' : 'medium'
          };
        });
        setInsights(formattedInsights);
      }

      const orders = ordersResponse.data;
      const products = productsResponse.data;
      
      const todayOrders = orders.filter(order => {
        const today = new Date();
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === today.toDateString();
      });

      const weeklyOrders = orders.filter(order => {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return new Date(order.createdAt) >= weekAgo;
      });

      const lowStockItems = products.filter(p => p.quantity <= p.reorderLevel);
      const pendingOrders = orders.filter(o => o.status === 'Pending');
      const processingOrders = orders.filter(o => o.status === 'Processing');

      const completedOrders = orders.filter(o => o.status === 'Delivered' || o.status === 'Shipped');
      const totalActiveOrders = pendingOrders.length + processingOrders.length;
      const efficiencyRate = totalActiveOrders > 0 ? Math.round((completedOrders.length / (completedOrders.length + totalActiveOrders)) * 100) : 0;
      
      setMetrics({
        todayOrders: todayOrders.length,
        weeklyOrders: weeklyOrders.length,
        pendingOrders: pendingOrders.length,
        processingOrders: processingOrders.length,
        lowStockItems: lowStockItems.length,
        avgOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length : 0,
        teamEfficiency: efficiencyRate,
        completedOrders: completedOrders.length
      });
    } catch (error) {
      console.error('Error fetching manager data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-indigo-600 font-medium">Loading Operations Center...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 rounded-xl shadow-lg">
          <Users className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <h2 className="text-xl font-bold text-blue-900">Operations Command</h2>
          <p className="text-blue-600 text-xs font-medium">Team Performance & Workflow</p>
        </div>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 text-sm font-semibold">Today's Orders</p>
              <p className="text-3xl font-bold text-green-900">{metrics?.todayOrders || 0}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 text-sm font-semibold">Weekly Total</p>
              <p className="text-3xl font-bold text-blue-900">{metrics?.weeklyOrders || 0}</p>
            </div>
            <BarChart3 className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-700 text-sm font-semibold">Processing</p>
              <p className="text-3xl font-bold text-orange-900">{metrics?.processingOrders || 0}</p>
            </div>
            <Clock className="h-10 w-10 text-orange-500" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-4 border border-red-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-700 text-sm font-semibold">Alerts</p>
              <p className="text-3xl font-bold text-red-900">{metrics?.lowStockItems || 0}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
        </div>
      </div>

      {/* Team Performance Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-blue-900">Team Performance</h3>
          <Target className="h-6 w-6 text-blue-600" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center bg-white/50 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-900">${(metrics?.avgOrderValue || 0).toFixed(0)}</div>
            <div className="text-sm text-blue-600 font-medium">Avg Order Value</div>
          </div>
          <div className="text-center bg-white/50 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-900">{metrics?.pendingOrders || 0}</div>
            <div className="text-sm text-blue-600 font-medium">Pending Queue</div>
          </div>
        </div>
      </div>

      {/* AI Management Insights */}
      <div className="space-y-4 mb-6">
        <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          AI Management Insights
        </h3>
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
              insight.type === 'priority' ? 'bg-orange-50 border-orange-200 hover:bg-orange-100' :
              insight.type === 'workflow' ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' :
              insight.type === 'team' ? 'bg-green-50 border-green-200 hover:bg-green-100' :
              'bg-red-50 border-red-200 hover:bg-red-100'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-gray-900 leading-5 flex-1">
                {insight.text.length > 80 ? `${insight.text.substring(0, 80)}...` : insight.text}
              </p>
              <button
                onClick={() => navigate(insight.type === 'team' ? '/orders' : '/products')}
                className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
              >
                MANAGE
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/orders')}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <div className="text-center">
            <Clock className="h-8 w-8 mx-auto mb-2" />
            <div className="font-semibold text-lg">Manage Orders</div>
          </div>
        </button>
        <button
          onClick={() => navigate('/products?filter=lowstock')}
          className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <div className="font-semibold text-lg">Review Alerts</div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ManagerDashboard;