import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, TrendingUp, FileText, Zap, Brain, BarChart3, AlertTriangle } from 'lucide-react';
import { analyticsAPI } from '../utils/api';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "👋 Hello! I'm INVENTRA AI, your intelligent inventory assistant. I can help you with:\n\n• **Inventory Analysis** - Stock levels, trends, and optimization\n• **Demand Forecasting** - Predict future needs\n• **Smart Recommendations** - Reorder suggestions and alerts\n• **Business Insights** - Performance analysis and reports\n\nWhat would you like to know about your inventory?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    "Which items are running low on stock?",
    "Show me my top-selling products",
    "Generate a weekly inventory report",
    "Predict demand for next month",
    "What's my inventory value?",
    "Which suppliers perform best?",
    "Analyze sales trends",
    "Suggest reorder quantities"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await analyticsAPI.getAIInsights(input);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.data.insights || 'I received your question and am processing it.',
        timestamp: new Date(),
        context: response.data.context || {},
        suggestions: response.data.suggestions || []
      };

      setMessages(prev => [...prev, aiMessage]);
      setSuggestions(response.data.suggestions || []);
    } catch (error) {
      console.error('AI Assistant Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm having trouble connecting right now. Here are some things you can try:\n\n• Check your inventory in the Products section\n• View recent orders in the Orders section\n• Review analytics in the Analytics section\n\nPlease try your question again in a moment.",
        timestamp: new Date(),
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setLoading(false);
  };

  const handleQuickQuestion = (question) => {
    setInput(question);
  };

  const generateReport = async (reportType) => {
    setLoading(true);
    try {
      const response = await analyticsAPI.generateReport(reportType);
      const reportMessage = {
        id: Date.now(),
        type: 'ai',
        content: `📊 **${reportType.toUpperCase()} REPORT**\n\n${response.data.report}`,
        timestamp: new Date(),
        reportType
      };
      setMessages(prev => [...prev, reportMessage]);
    } catch (error) {
      console.error('Report generation failed:', error);
    }
    setLoading(false);
  };

  const formatMessage = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg h-96 flex flex-col">
      <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6" />
          <h3 className="font-semibold">INVENTRA AI Assistant</h3>
          <div className="flex space-x-1 ml-auto">
            <button
              onClick={() => generateReport('weekly')}
              className="p-1 hover:bg-white/20 rounded"
              title="Generate Weekly Report"
            >
              <FileText className="h-4 w-4" />
            </button>
            <button
              onClick={() => generateReport('forecast')}
              className="p-1 hover:bg-white/20 rounded"
              title="Demand Forecast"
            >
              <TrendingUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => generateReport('performance')}
              className="p-1 hover:bg-white/20 rounded"
              title="Performance Analysis"
            >
              <BarChart3 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.type === 'user' 
                ? 'bg-blue-600 text-white' 
                : message.error 
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-gray-100 text-gray-800'
            }`}>
              <div className="flex items-start space-x-2">
                {message.type === 'ai' && <Bot className="h-4 w-4 mt-1 flex-shrink-0" />}
                {message.type === 'user' && <User className="h-4 w-4 mt-1 flex-shrink-0" />}
                <div className="flex-1">
                  <div 
                    className="text-sm"
                    dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                  />
                  {message.context && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <span>📦 Products: {message.context.totalProducts}</span>
                        <span>⚠️ Low Stock: {message.context.lowStockItems}</span>
                        {message.context.totalValue && (
                          <span>💰 Value: ${message.context.totalValue.toLocaleString()}</span>
                        )}
                        {message.context.topProduct && (
                          <span>🏆 Top: {message.context.topProduct}</span>
                        )}
                      </div>
                    </div>
                  )}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.suggestions.map((suggestion, idx) => (
                        <div key={idx} className={`p-2 rounded text-xs ${
                          suggestion.priority === 'high' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          <div className="flex items-center space-x-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span className="font-medium">{suggestion.title}</span>
                          </div>
                          {suggestion.message && <p className="mt-1">{suggestion.message}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <Bot className="h-4 w-4" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="p-4 border-t bg-gray-50">
          <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
          <div className="grid grid-cols-2 gap-1">
            {quickQuestions.slice(0, 4).map((question, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(question)}
                className="text-xs p-2 bg-white border rounded hover:bg-blue-50 text-left"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about inventory, trends, forecasts..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;