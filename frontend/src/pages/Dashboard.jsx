import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, ShoppingCart, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react';
import { analyticsAPI, orderAPI } from '../utils/api';
import AIAssistant from '../components/AIAssistant';
import SmartInsights from '../components/SmartInsights';
import ManagerDashboard from '../components/ManagerDashboard';
import StaffDashboard from '../components/StaffDashboard';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await analyticsAPI.getDashboard();
      setAnalytics(response.data);
      await generateChartData();
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics({
        totalProducts: 0,
        totalOrders: 0,
        lowStock: 0,
        topProducts: []
      });
    } finally {
      setLoading(false);
    }
  };



  const [chartData, setChartData] = useState([]);
  
  const generateChartData = async () => {
    try {
      const ordersResponse = await orderAPI.getAll();
      const orders = ordersResponse.data;
      
      const monthlyData = {};
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      orders.forEach(order => {
        const date = new Date(order.createdAt);
        const monthIndex = date.getMonth();
        const monthName = months[monthIndex];
        
        if (!monthlyData[monthName]) {
          monthlyData[monthName] = 0;
        }
        monthlyData[monthName]++;
      });
      
      const chartArray = months.map(month => ({
        name: month,
        orders: monthlyData[month] || 0
      })).filter(item => item.orders > 0);
      
      setChartData(chartArray.length > 0 ? chartArray : [
        { name: 'Current', orders: orders.length }
      ]);
    } catch (error) {
      console.error('Error generating chart data:', error);
      setChartData([{ name: 'Current', orders: 0 }]);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const getRoleTheme = () => {
    const role = user?.role || 'staff';
    switch (role) {
      case 'admin':
        return {
          primary: 'indigo-900',
          secondary: 'indigo-800',
          accent: 'indigo-600',
          accentHover: 'indigo-700',
          background: 'indigo-50',
          surface: 'white',
          border: 'indigo-200',
          text: 'indigo-900',
          textMuted: 'indigo-600',
          title: 'Executive Dashboard'
        };
      case 'manager':
        return {
          primary: 'blue-900',
          secondary: 'blue-800',
          accent: 'blue-600',
          accentHover: 'blue-700',
          background: 'blue-50',
          surface: 'white',
          border: 'blue-200',
          text: 'blue-900',
          textMuted: 'blue-600',
          title: 'Management Center'
        };
      default:
        return {
          primary: 'orange-900',
          secondary: 'orange-800',
          accent: 'orange-600',
          accentHover: 'orange-700',
          background: 'orange-50',
          surface: 'white',
          border: 'orange-200',
          text: 'orange-900',
          textMuted: 'orange-600',
          title: 'Operations Hub'
        };
    }
  };

  const theme = getRoleTheme();

  return (
    <div className={`min-h-screen bg-${theme.background} p-6 space-y-6`}>
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-4xl font-bold text-${theme.primary} tracking-tight`}>{theme.title}</h1>
            <p className={`text-lg text-${theme.textMuted} mt-1`}>Welcome back, {user?.name || 'User'}</p>
          </div>
          <div className={`px-4 py-2 bg-${theme.accent} text-white rounded-lg font-medium capitalize`}>
            {user?.role || 'Staff'}
          </div>
        </div>
        <div className={`h-1 bg-${theme.accent} rounded-full w-24`}></div>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`group relative overflow-hidden bg-${theme.surface} border border-${theme.border} rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:border-${theme.accent}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium text-${theme.textMuted} uppercase tracking-wide`}>Products</p>
              <p className={`text-3xl font-bold text-${theme.text} mt-2`}>{analytics?.totalProducts || 0}</p>
            </div>
            <div className={`p-3 bg-${theme.accent}/10 rounded-lg group-hover:bg-${theme.accent}/20 transition-colors`}>
              <Package className={`h-6 w-6 text-${theme.accent}`} />
            </div>
          </div>
          <div className={`absolute bottom-0 left-0 h-1 bg-${theme.accent} w-0 group-hover:w-full transition-all duration-300`}></div>
        </div>

        <div className={`group relative overflow-hidden bg-${theme.surface} border border-${theme.border} rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:border-emerald-500`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium text-${theme.textMuted} uppercase tracking-wide`}>Orders</p>
              <p className={`text-3xl font-bold text-${theme.text} mt-2`}>{analytics?.totalOrders || 0}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
              <ShoppingCart className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 w-0 group-hover:w-full transition-all duration-300"></div>
        </div>

        <div className={`group relative overflow-hidden bg-${theme.surface} border border-${theme.border} rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:border-red-500`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium text-${theme.textMuted} uppercase tracking-wide`}>Low Stock</p>
              <p className={`text-3xl font-bold text-${theme.text} mt-2`}>{analytics?.lowStock || 0}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 h-1 bg-red-500 w-0 group-hover:w-full transition-all duration-300"></div>
        </div>

        <div className={`group relative overflow-hidden bg-${theme.surface} border border-${theme.border} rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:border-${theme.accent}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium text-${theme.textMuted} uppercase tracking-wide`}>Trending</p>
              <p className={`text-sm font-medium text-${theme.text} mt-2 leading-tight`}>{analytics?.topProducts?.slice(0, 2).join(', ') || 'Loading...'}</p>
            </div>
            <div className={`p-3 bg-${theme.accent}/10 rounded-lg group-hover:bg-${theme.accent}/20 transition-colors`}>
              <TrendingUp className={`h-6 w-6 text-${theme.accent}`} />
            </div>
          </div>
          <div className={`absolute bottom-0 left-0 h-1 bg-${theme.accent} w-0 group-hover:w-full transition-all duration-300`}></div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Chart Section */}
        <div className={`lg:col-span-2 bg-${theme.surface} border border-${theme.border} rounded-lg p-6`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className={`p-2 bg-${theme.accent}/10 rounded-lg`}>
                <BarChart3 className={`h-5 w-5 text-${theme.accent}`} />
              </div>
              <h3 className={`text-xl font-semibold text-${theme.text}`}>Orders Trend</h3>
            </div>
            <div className={`text-sm text-${theme.textMuted} bg-${theme.background} px-3 py-1 rounded-full`}>
              Last 6 months
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={`rgb(${theme.border === 'indigo-200' ? '199 210 254' : theme.border === 'blue-200' ? '191 219 254' : '254 215 170'})`} />
              <XAxis 
                dataKey="name" 
                stroke={`rgb(${theme.textMuted === 'indigo-600' ? '79 70 229' : theme.textMuted === 'blue-600' ? '37 99 235' : '234 88 12'})`}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke={`rgb(${theme.textMuted === 'indigo-600' ? '79 70 229' : theme.textMuted === 'blue-600' ? '37 99 235' : '234 88 12'})`}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: `1px solid rgb(${theme.border === 'indigo-200' ? '199 210 254' : theme.border === 'blue-200' ? '191 219 254' : '254 215 170'})`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="orders" 
                fill={`rgb(${theme.accent === 'indigo-600' ? '79 70 229' : theme.accent === 'blue-600' ? '37 99 235' : '234 88 12'})`}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Role-specific Dashboard */}
        <div className={`lg:col-span-3 bg-${theme.surface} border border-${theme.border} rounded-lg overflow-hidden`}>
          {user?.role === 'manager' ? (
            <ManagerDashboard />
          ) : user?.role === 'staff' ? (
            <StaffDashboard />
          ) : (
            <SmartInsights />
          )}
        </div>
      </div>

      {/* AI Assistant Section */}
      <div className={`bg-${theme.surface} border border-${theme.border} rounded-lg p-6`}>
        <div className="flex items-center space-x-3 mb-6">
          <div className={`p-2 bg-${theme.accent}/10 rounded-lg`}>
            <svg className={`h-5 w-5 text-${theme.accent}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className={`text-xl font-semibold text-${theme.text}`}>AI Assistant</h3>
        </div>
        <AIAssistant />
      </div>
    </div>
  );
};

export default Dashboard;