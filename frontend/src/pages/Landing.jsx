import React, { useState } from 'react';
import { ArrowRight, BarChart3, Users, Shield, Zap, CheckCircle, Star, TrendingUp, Package, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Smart inventory predictions and automated recommendations using advanced AI",
      color: "from-purple-500 to-indigo-600"
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Live dashboards with comprehensive business intelligence and performance metrics",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: Package,
      title: "Smart Inventory",
      description: "Automated stock tracking, low-stock alerts, and intelligent reorder suggestions",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description: "Customized interfaces for Admin, Manager, and Staff with appropriate permissions",
      color: "from-orange-500 to-red-600"
    }
  ];

  const roles = [
    {
      title: "Admin",
      description: "Strategic oversight and business intelligence",
      features: ["Financial Analytics", "Supplier Management", "Strategic Planning", "Performance Reports"],
      color: "bg-gradient-to-br from-purple-600 to-indigo-700",
      icon: Shield
    },
    {
      title: "Manager",
      description: "Operations management and team coordination",
      features: ["Team Performance", "Workflow Optimization", "Order Management", "Inventory Control"],
      color: "bg-gradient-to-br from-blue-600 to-cyan-700",
      icon: Users
    },
    {
      title: "Staff",
      description: "Daily operations and task execution",
      features: ["Task Management", "Stock Alerts", "Order Processing", "Quick Actions"],
      color: "bg-gradient-to-br from-orange-600 to-red-700",
      icon: Zap
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900 to-slate-900"></div>
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <div className="flex items-center justify-center mb-12">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-75"></div>
                <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 border border-white/10">
                  <Package className="h-12 w-12 text-white" />
                </div>
              </div>
              <h1 className="ml-6 text-5xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Inventra</h1>
            </div>
            <div className="space-y-6 mb-12">
              <h2 className="text-6xl md:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent">
                  Smart Inventory
                </span>
                <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent">
                  Management
                </span>
              </h2>
              <p className="text-xl text-slate-400 max-w-4xl mx-auto leading-relaxed font-medium">
                Revolutionize your inventory management with AI-powered insights, real-time analytics, 
                and intelligent automation. Built for modern businesses.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button
                onClick={() => navigate('/login')}
                className="group relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-indigo-500/25 border border-white/10"
              >
                <span className="relative z-10 flex items-center">
                  Get Started
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="group relative bg-white/10 backdrop-blur-sm text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 border border-white/20 hover:bg-white/20"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
              <span className="text-sm font-semibold text-indigo-600">✨ Powerful Features</span>
            </div>
            <h3 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Everything you need to manage
              <span className="block text-indigo-600">your inventory intelligently</span>
            </h3>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Advanced tools and AI-powered insights designed to streamline your operations
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 border border-slate-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 transform hover:-translate-y-2"
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-Based Access */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-indigo-50/30 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-100/20 via-transparent to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
              <span className="text-sm font-semibold text-indigo-600">👥 Role-Based Access</span>
            </div>
            <h3 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Built for Every Role
              <span className="block text-indigo-600">in Your Organization</span>
            </h3>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Customized experiences designed for different user roles and responsibilities
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {roles.map((role, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden transform hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10"
              >
                <div className={`${role.color} p-8 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="relative">
                    <div className="inline-flex p-3 bg-white/20 rounded-xl mb-4 backdrop-blur-sm">
                      <role.icon className="h-8 w-8" />
                    </div>
                    <h4 className="text-2xl font-bold mb-3">{role.title}</h4>
                    <p className="text-white/90 leading-relaxed">{role.description}</p>
                  </div>
                </div>
                <div className="p-8">
                  <ul className="space-y-4">
                    {role.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center group-hover:translate-x-1 transition-transform duration-300" style={{transitionDelay: `${idx * 50}ms`}}>
                        <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-4">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <span className="text-slate-700 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>





      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-slate-800"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-3 mr-4">
              <Package className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Inventra</span>
          </div>
          <p className="text-slate-400 text-lg mb-4">Smart Inventory Management System</p>
          <p className="text-slate-500">© 2024 Inventra. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;