import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter } from 'recharts';
import { analyticsAPI, productAPI, orderAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Package, ShoppingCart, AlertTriangle, DollarSign } from 'lucide-react';

const Analytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const getThemeColors = () => {
    switch(user?.role) {
      case 'admin': return {
        primary: 'indigo-600', primaryHover: 'indigo-700', primaryLight: 'indigo-50', primaryText: 'indigo-700',
        secondary: 'indigo-100', border: 'indigo-200'
      };
      case 'manager': return {
        primary: 'blue-600', primaryHover: 'blue-700', primaryLight: 'blue-50', primaryText: 'blue-700',
        secondary: 'blue-100', border: 'blue-200'
      };
      default: return {
        primary: 'orange-600', primaryHover: 'orange-700', primaryLight: 'orange-50', primaryText: 'orange-700',
        secondary: 'orange-100', border: 'orange-200'
      };
    }
  };
  
  const theme = getThemeColors();

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    try {
      const [dashboardResponse, productsResponse, ordersResponse] = await Promise.all([
        analyticsAPI.getDashboard(),
        productAPI.getAll(),
        orderAPI.getAll()
      ]);
      
      setAnalytics(dashboardResponse.data);
      
      // Generate real sales data from orders
      const orders = ordersResponse.data;
      const monthlyData = {};
      
      orders.forEach(order => {
        const date = new Date(order.createdAt);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { month: monthKey, sales: 0, orders: 0 };
        }
        
        monthlyData[monthKey].sales += order.totalAmount;
        monthlyData[monthKey].orders += 1;
      });
      
      setSalesData(Object.values(monthlyData));
      
      // Generate real category data from products
      const products = productsResponse.data;
      const categoryMap = {};
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];
      
      products.forEach(product => {
        if (!categoryMap[product.category]) {
          categoryMap[product.category] = {
            name: product.category,
            value: 0,
            color: colors[Object.keys(categoryMap).length % colors.length]
          };
        }
        categoryMap[product.category].value += product.quantity * product.price;
      });
      
      setCategoryData(Object.values(categoryMap));
      
      // Generate real stock data
      const stockInfo = products.slice(0, 8).map(product => ({
        product: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
        current: product.quantity,
        reorder: product.reorderLevel
      }));
      
      setStockData(stockInfo);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">Comprehensive insights and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className={`h-5 w-5 text-${theme.primary}`} />
            <h3 className="text-lg font-semibold text-gray-900">Monthly Sales & Orders</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#3B82F6" name="Sales ($)" />
              <Bar dataKey="orders" fill="#10B981" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Package className={`h-5 w-5 text-${theme.primary}`} />
            <h3 className="text-lg font-semibold text-gray-900">Sales by Category</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className={`h-5 w-5 text-${theme.primary}`} />
              <h3 className="text-lg font-semibold text-gray-900">Stock vs Reorder Analysis</h3>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Safe Stock</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Low Stock</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Critical</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={stockData.map(item => ({
              ...item,
              stockRatio: (item.current / item.reorder),
              status: item.current <= item.reorder * 0.5 ? 'critical' : 
                     item.current <= item.reorder ? 'low' : 'safe'
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="reorder" 
                name="Reorder Level"
                label={{ value: 'Reorder Level', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                dataKey="current" 
                name="Current Stock"
                label={{ value: 'Current Stock', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    const data = payload[0].payload;
                    const status = data.status || 'unknown';
                    return (
                      <div className="bg-white p-3 border rounded shadow-lg">
                        <p className="font-medium">{data.product || 'Unknown Product'}</p>
                        <p className="text-sm">Current: {data.current || 0} units</p>
                        <p className="text-sm">Reorder at: {data.reorder || 0} units</p>
                        <p className={`text-sm font-medium ${
                          status === 'critical' ? 'text-red-600' :
                          status === 'low' ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          Status: {status.toUpperCase()}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Diagonal line showing reorder threshold */}
              <Line 
                type="linear" 
                dataKey="reorder" 
                stroke="#F59E0B" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={false}
                name="Reorder Line"
              />
              {/* Safe stock points */}
              <Scatter 
                data={stockData.filter(item => item.current > item.reorder).map(item => ({
                  ...item,
                  fill: '#10B981'
                }))}
                fill="#10B981"
                name="Safe Stock"
              />
              {/* Low stock points */}
              <Scatter 
                data={stockData.filter(item => item.current <= item.reorder && item.current > item.reorder * 0.5).map(item => ({
                  ...item,
                  fill: '#F59E0B'
                }))}
                fill="#F59E0B"
                name="Low Stock"
              />
              {/* Critical stock points */}
              <Scatter 
                data={stockData.filter(item => item.current <= item.reorder * 0.5).map(item => ({
                  ...item,
                  fill: '#EF4444'
                }))}
                fill="#EF4444"
                name="Critical Stock"
              />
            </ScatterChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="text-2xl font-bold text-green-600">
                {stockData.filter(item => item.current > item.reorder).length}
              </div>
              <div className="text-sm font-medium text-green-700">Safe Stock</div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <div className="text-2xl font-bold text-yellow-600">
                {stockData.filter(item => item.current <= item.reorder && item.current > item.reorder * 0.5).length}
              </div>
              <div className="text-sm font-medium text-yellow-700">Low Stock</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="text-2xl font-bold text-red-600">
                {stockData.filter(item => item.current <= item.reorder * 0.5).length}
              </div>
              <div className="text-sm font-medium text-red-700">Critical</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-6">
            <DollarSign className={`h-5 w-5 text-${theme.primary}`} />
            <h3 className="text-lg font-semibold text-gray-900">Key Metrics</h3>
          </div>
          <div className="space-y-4">
            <div className={`p-5 bg-${theme.primaryLight} rounded-lg border border-${theme.border}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium text-${theme.primaryText}`}>Total Products</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{analytics?.totalProducts || 0}</p>
                </div>
                <Package className={`h-8 w-8 text-${theme.primary}`} />
              </div>
            </div>
            <div className="p-5 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Orders This Month</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{analytics?.totalOrders || 0}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="p-5 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">Low Stock Items</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{analytics?.lowStock || 0}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <div className="p-5 bg-purple-50 rounded-lg border border-purple-100">
              <p className="text-sm font-medium text-purple-700 mb-3">Top Products</p>
              <div className="space-y-2">
                {analytics?.topProducts?.slice(0, 3).map((product, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-purple-200 text-purple-800 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-900 font-medium">{product}</span>
                  </div>
                )) || <p className="text-sm text-gray-600">No data available</p>}
              </div>
            </div>
            <div className="p-5 bg-orange-50 rounded-lg border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Inventory Value</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    ${categoryData.reduce((sum, cat) => sum + cat.value, 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className={`h-5 w-5 text-${theme.primary}`} />
          <h3 className="text-lg font-semibold text-gray-900">Sales Trend</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          {salesData.length > 0 ? (
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'sales' ? `$${value.toLocaleString()}` : value,
                  name === 'sales' ? 'Sales' : 'Orders'
                ]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke={user?.role === 'admin' ? '#4f46e5' : user?.role === 'manager' ? '#2563eb' : '#ea580c'} 
                strokeWidth={3}
                dot={{ fill: user?.role === 'admin' ? '#4f46e5' : user?.role === 'manager' ? '#2563eb' : '#ea580c', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No sales data available
            </div>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;