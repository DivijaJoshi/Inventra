import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertCircle, Lightbulb, BarChart3, RefreshCw, ArrowRight, ShoppingCart, Package, Users, Shield, Briefcase } from 'lucide-react';
import { analyticsAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SmartInsights = () => {
  const [insights, setInsights] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchSmartInsights();
  }, []);

  const [roleData, setRoleData] = useState(null);

  const fetchSmartInsights = async () => {
    setLoading(true);
    try {
      const role = user?.role || 'staff';
      
      if (role === 'admin') {
        const response = await analyticsAPI.getSmartInsights();
        if (response.data?.insights) {
          const insightLines = response.data.insights.split('\n').filter(line => line.trim() && line.includes(':'));
          const formattedInsights = insightLines.slice(0, 4).map((insight, index) => {
            const [typeText, content] = insight.split(':', 2);
            const type = typeText.toLowerCase().includes('alert') ? 'alert' :
                        typeText.toLowerCase().includes('trend') ? 'trend' :
                        typeText.toLowerCase().includes('optimization') ? 'optimization' : 'recommendation';
            return {
              id: index,
              text: content?.trim() || insight,
              type,
              icon: type === 'trend' ? TrendingUp : type === 'alert' ? AlertCircle : 
                    type === 'optimization' ? Brain : Lightbulb
            };
          });
          setInsights(formattedInsights);
          setMetadata(response.data.metadata);
        }
      } else {
        const response = await analyticsAPI.getRoleInsights(role);
        if (response.data?.insights) {
          const insightLines = response.data.insights.split('\n').filter(line => line.trim() && line.includes(':'));
          const formattedInsights = insightLines.slice(0, 4).map((insight, index) => {
            const [typeText, content] = insight.split(':', 2);
            const type = typeText.toLowerCase().includes('urgent') || typeText.toLowerCase().includes('alert') ? 'urgent' :
                        typeText.toLowerCase().includes('priority') || typeText.toLowerCase().includes('workflow') ? 'priority' :
                        typeText.toLowerCase().includes('team') ? 'team' : 'task';
            return {
              id: index,
              text: content?.trim() || insight,
              type,
              priority: typeText.toLowerCase().includes('urgent') ? 'high' : 
                       typeText.toLowerCase().includes('priority') ? 'medium' : 'normal',
              icon: type === 'urgent' ? AlertCircle : type === 'priority' ? TrendingUp : 
                    type === 'team' ? Users : Lightbulb
            };
          });
          setInsights(formattedInsights);
          setRoleData(response.data.data);
        }
      }
      
      const dashboardResponse = await analyticsAPI.getDashboard();
      setMetadata(dashboardResponse.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching smart insights:', error);
      setInsights([{ id: 1, text: "Unable to load insights. Please try again.", type: 'alert', icon: AlertCircle }]);
    } finally {
      setLoading(false);
    }
  };

  const handleInsightAction = (type) => {
    const role = user?.role || 'staff';
    
    if (role === 'admin') {
      switch (type) {
        case 'alert': navigate('/analytics'); break;
        case 'recommendation': navigate('/suppliers'); break;
        default: navigate('/analytics');
      }
    } else if (role === 'manager') {
      switch (type) {
        case 'alert': navigate('/orders'); break;
        case 'recommendation': navigate('/products'); break;
        default: navigate('/orders');
      }
    } else {
      switch (type) {
        case 'alert': navigate('/products?filter=lowstock'); break;
        case 'recommendation': navigate('/orders'); break;
        default: navigate('/products');
      }
    }
  };
  
  const getRoleConfig = () => {
    const role = user?.role || 'staff';
    switch (role) {
      case 'admin':
        return { icon: Shield, title: 'Executive Dashboard', subtitle: 'Strategic Overview' };
      case 'manager':
        return { icon: Briefcase, title: 'Management Center', subtitle: 'Team & Operations' };
      default:
        return { icon: Users, title: 'Daily Tasks', subtitle: 'Operational Focus' };
    }
  };

  const getInsightStyle = (insight) => {
    const role = user?.role || 'staff';
    
    if (role === 'admin') {
      switch (insight.type) {
        case 'trend': return 'bg-blue-50 border-blue-200 text-blue-800';
        case 'alert': return 'bg-red-50 border-red-200 text-red-800';
        case 'optimization': return 'bg-green-50 border-green-200 text-green-800';
        case 'recommendation': return 'bg-purple-50 border-purple-200 text-purple-800';
        default: return 'bg-gray-50 border-gray-200 text-gray-800';
      }
    } else if (role === 'manager') {
      switch (insight.type) {
        case 'urgent': return 'bg-red-50 border-red-300 text-red-900 border-l-4 border-l-red-500';
        case 'priority': return 'bg-orange-50 border-orange-300 text-orange-900 border-l-4 border-l-orange-500';
        case 'team': return 'bg-blue-50 border-blue-300 text-blue-900 border-l-4 border-l-blue-500';
        default: return 'bg-gray-50 border-gray-300 text-gray-900 border-l-4 border-l-gray-400';
      }
    } else {
      switch (insight.priority) {
        case 'high': return 'bg-red-50 border-red-400 text-red-900 shadow-md border-2';
        case 'medium': return 'bg-yellow-50 border-yellow-400 text-yellow-900 shadow-sm border-2';
        default: return 'bg-green-50 border-green-300 text-green-900 border';
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600">Analyzing inventory data...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 p-6 pb-0">
        <div className="flex items-center">
          <div className="p-2 bg-indigo-100 rounded-lg mr-3">
            {React.createElement(getRoleConfig().icon, { className: "h-5 w-5 text-indigo-600" })}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-indigo-900">{getRoleConfig().title}</h3>
            <span className="text-sm text-indigo-600">{getRoleConfig().subtitle}</span>
          </div>
        </div>
        {lastUpdated && (
          <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-1 rounded">
            {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>
      
      {(metadata || roleData) && (
        <div className="mb-6">
          {user?.role === 'admin' ? (
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl text-center border border-blue-200 shadow-sm">
                <div className="text-2xl font-bold text-blue-900">${((metadata?.totalProducts || 0) * 1500).toLocaleString()}</div>
                <div className="text-sm font-medium text-blue-700">Est. Value</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl text-center border border-green-200 shadow-sm">
                <div className="text-2xl font-bold text-green-900">{metadata?.totalProducts || 0}</div>
                <div className="text-sm font-medium text-green-700">Products</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl text-center border border-purple-200 shadow-sm">
                <div className="text-2xl font-bold text-purple-900">{metadata?.totalOrders || 0}</div>
                <div className="text-sm font-medium text-purple-700">Orders</div>
              </div>
            </div>
          ) : user?.role === 'manager' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl text-center border border-blue-200 shadow-sm">
                  <div className="font-bold text-blue-900 text-xl">{roleData?.weeklyOrders || 0}</div>
                  <div className="text-xs font-medium text-blue-700">This Week</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl text-center border border-orange-200 shadow-sm">
                  <div className="font-bold text-orange-900 text-xl">{roleData?.pendingOrders || 0}</div>
                  <div className="text-xs font-medium text-orange-700">Pending</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl text-center border border-green-200 shadow-sm">
                  <div className="font-bold text-green-900 text-xl">{roleData?.processingOrders || 0}</div>
                  <div className="text-xs font-medium text-green-700">Processing</div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-xl text-center border border-red-300 shadow-sm">
                  <div className="font-bold text-red-900 text-xl">{roleData?.criticalStockCount || 0}</div>
                  <div className="text-xs font-medium text-red-700">Critical</div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-3 rounded-lg border">
                <div className="text-sm font-medium text-indigo-900">Team Performance</div>
                <div className="text-xs text-indigo-700">Avg Order Value: ${(roleData?.avgOrderValue || 0).toFixed(0)} • {roleData?.supplierCount || 0} Active Suppliers</div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl text-center border-l-4 border-red-600 shadow-sm">
                  <div className="font-bold text-red-900 text-2xl">{roleData?.criticalStockCount || 0}</div>
                  <div className="text-red-700 font-bold text-sm">URGENT</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl text-center border-l-4 border-yellow-600 shadow-sm">
                  <div className="font-bold text-yellow-900 text-2xl">{roleData?.pendingOrdersCount || 0}</div>
                  <div className="text-yellow-700 font-bold text-sm">PENDING</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl text-center border-l-4 border-blue-600 shadow-sm">
                  <div className="font-bold text-blue-900 text-2xl">{roleData?.todayOrdersCount || 0}</div>
                  <div className="text-blue-700 font-bold text-sm">TODAY</div>
                </div>
              </div>
              {roleData?.criticalItems?.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                  <div className="text-sm font-bold text-red-900 mb-1">⚠️ CRITICAL ITEMS</div>
                  <div className="text-xs text-red-800">
                    {roleData.criticalItems.map(item => `${item.name} (${item.quantity})`).join(' • ')}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="space-y-4 px-6">
        {insights.map((insight) => {
          const IconComponent = insight.icon;
          const hasAction = insight.type === 'alert' || insight.type === 'recommendation';
          
          // Enhanced color coding based on insight type and role
          const getEnhancedStyle = () => {
            if (user?.role === 'admin') {
              switch (insight.type) {
                case 'trend': return 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300 shadow-blue-100';
                case 'alert': return 'bg-gradient-to-r from-red-50 to-pink-50 border-red-300 shadow-red-100';
                case 'optimization': return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-green-100';
                case 'recommendation': return 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-300 shadow-purple-100';
                default: return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300 shadow-gray-100';
              }
            } else if (user?.role === 'manager') {
              switch (insight.type) {
                case 'urgent': return 'bg-gradient-to-r from-red-50 to-orange-50 border-red-400 shadow-red-200 border-l-4 border-l-red-600';
                case 'priority': return 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-400 shadow-orange-200 border-l-4 border-l-orange-600';
                case 'team': return 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 shadow-blue-200 border-l-4 border-l-blue-600';
                default: return 'bg-gradient-to-r from-gray-50 to-blue-50 border-gray-400 shadow-gray-200 border-l-4 border-l-gray-500';
              }
            } else {
              switch (insight.priority) {
                case 'high': return 'bg-gradient-to-r from-red-50 to-red-100 border-red-500 shadow-red-300 border-2';
                case 'medium': return 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-500 shadow-yellow-300 border-2';
                default: return 'bg-gradient-to-r from-green-50 to-green-100 border-green-400 shadow-green-200';
              }
            }
          };
          
          const getIconColor = () => {
            if (user?.role === 'admin') {
              switch (insight.type) {
                case 'trend': return 'bg-blue-200 text-blue-700';
                case 'alert': return 'bg-red-200 text-red-700';
                case 'optimization': return 'bg-green-200 text-green-700';
                case 'recommendation': return 'bg-purple-200 text-purple-700';
                default: return 'bg-gray-200 text-gray-700';
              }
            } else if (user?.role === 'manager') {
              switch (insight.type) {
                case 'urgent': return 'bg-red-200 text-red-800';
                case 'priority': return 'bg-orange-200 text-orange-800';
                case 'team': return 'bg-blue-200 text-blue-800';
                default: return 'bg-gray-200 text-gray-800';
              }
            } else {
              switch (insight.priority) {
                case 'high': return 'bg-red-200 text-red-800';
                case 'medium': return 'bg-yellow-200 text-yellow-800';
                default: return 'bg-green-200 text-green-800';
              }
            }
          };
          
          return (
            <div
              key={insight.id}
              className={`p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${getEnhancedStyle()}`}
            >
              <div className="flex items-start gap-5">
                <div className={`p-2 rounded-lg ${getIconColor()} flex-shrink-0`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-sm font-semibold text-gray-900 leading-6 break-words whitespace-normal">
                    {insight.text}
                  </p>
                </div>
                {hasAction && (
                  <div className="flex-shrink-0">
                    <button 
                      onClick={() => handleInsightAction(insight.type)}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 hover:scale-105 shadow-sm ${
                        user?.role === 'admin' ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200' :
                        insight.priority === 'high' ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-200' :
                        insight.priority === 'medium' ? 'bg-yellow-600 text-white hover:bg-yellow-700 shadow-yellow-200' :
                        'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                      }`}
                    >
                      {user?.role === 'admin' ? 'ANALYZE' : user?.role === 'staff' ? 'DO IT' : 'MANAGE'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 space-y-2">
        {user?.role === 'admin' && metadata?.topCategory && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg border">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => navigate(`/products?category=${metadata.topCategory}`)}>
              <div>
                <div className="text-sm font-medium text-gray-900">Top Category: {metadata.topCategory}</div>
                <div className="text-xs text-gray-600">Strategic focus area • Click to analyze</div>
              </div>
              <div className="flex items-center">
                <Package className="h-5 w-5 text-purple-600 mr-1" />
                <ArrowRight className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </div>
        )}
        {user?.role === 'manager' && (
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-3 rounded-lg border">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => navigate('/orders')}>
              <div>
                <div className="text-sm font-medium text-gray-900">Team Performance</div>
                <div className="text-xs text-gray-600">Monitor operations • Click to manage</div>
              </div>
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 text-orange-600 mr-1" />
                <ArrowRight className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </div>
        )}
        {user?.role === 'staff' && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg border">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => navigate('/products')}>
              <div>
                <div className="text-sm font-medium text-gray-900">Quick Actions</div>
                <div className="text-xs text-gray-600">Check inventory & process orders</div>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-green-600 mr-1" />
                <ArrowRight className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </div>
        )}
        <div className="p-6 pt-0">
          <button
            onClick={fetchSmartInsights}
            disabled={loading}
            className={`w-full px-4 py-2 text-sm rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center ${
              user?.role === 'admin' ? 'bg-indigo-600 text-white hover:bg-indigo-700' :
              user?.role === 'manager' ? 'bg-blue-600 text-white hover:bg-blue-700' :
              'bg-orange-600 text-white hover:bg-orange-700'
            }`}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {user?.role === 'admin' ? 'Update Strategic View' : 
             user?.role === 'manager' ? 'Refresh Operations' : 
             'Update Tasks'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartInsights;