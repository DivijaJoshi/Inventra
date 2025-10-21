const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const Supplier = require('../models/supplierModel');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getDashboardAnalytics = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const currentMonth = new Date();
    currentMonth.setDate(1);
    
    const totalOrders = await Order.countDocuments({
      createdAt: { $gte: currentMonth }
    });
    
    const lowStockProducts = await Product.countDocuments({
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    });
    
    const topProducts = await Order.aggregate([
      { $unwind: '$products' },
      { $group: { _id: '$products.product', totalSold: { $sum: '$products.quantity' } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { name: '$product.name', totalSold: 1 } }
    ]);

    res.json({
      totalProducts,
      totalOrders,
      lowStock: lowStockProducts,
      topProducts: topProducts.map(p => p.name)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAIInsights = async (req, res) => {
  const { query } = req.body;
  try {
    const products = await Product.find().populate('supplier');
    const orders = await Order.find().populate('products.product');
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    });

    const context = {
      inventory: {
        totalProducts: products.length,
        totalValue: products.reduce((sum, p) => sum + (p.quantity * p.price), 0),
        lowStockCount: lowStockProducts.length,
        lowStockItems: lowStockProducts.map(p => ({
          name: p.name,
          currentStock: p.quantity,
          reorderLevel: p.reorderLevel
        }))
      },
      sales: {
        totalOrders: orders.length,
        topProducts: products.slice(0, 3).map(p => ({ name: p.name }))
      }
    };

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `You are INVENTRA AI. Answer this question about inventory: "${query}"

Data:
- Products: ${context.inventory.totalProducts}
- Low Stock: ${context.inventory.lowStockCount}
- Orders: ${context.sales.totalOrders}
- Value: $${context.inventory.totalValue}

Provide helpful insights.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    
    res.json({
      query,
      insights: response.text(),
      context: {
        lowStockItems: lowStockProducts.length,
        totalProducts: products.length,
        totalValue: context.inventory.totalValue
      },
      suggestions: []
    });
  } catch (error) {
    console.error('AI Error:', error);
    res.json({
      query: query || 'General inquiry',
      insights: `📊 **Inventory Status**\n\n• Products in system\n• Orders being processed\n• Stock levels monitored\n\n💡 **Try asking:**\n- "Which items are low on stock?"\n- "Show me top products"\n- "What's my inventory value?"`,
      context: { lowStockItems: 0, totalProducts: 0 },
      suggestions: []
    });
  }
};

const generateInventoryReport = async (req, res) => {
  try {
    const { reportType } = req.params;
    
    const products = await Product.find().populate('supplier');
    const orders = await Order.find().populate('products.product');
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    let prompt = '';
    
    switch (reportType) {
      case 'weekly':
        prompt = `Generate a comprehensive weekly inventory report based on this data: ${JSON.stringify({ products: products.slice(0, 20), orders: orders.slice(-50) }, null, 2)}. Include trends, alerts, and recommendations.`;
        break;
      case 'forecast':
        prompt = `Create a demand forecast report for the next 30 days based on historical data: ${JSON.stringify({ products, orders }, null, 2)}. Include predicted stock needs and reorder recommendations.`;
        break;
      case 'performance':
        prompt = `Analyze product performance and create a detailed report with insights on best/worst performers: ${JSON.stringify({ products, orders }, null, 2)}.`;
        break;
      default:
        prompt = `Generate a general inventory status report: ${JSON.stringify({ products: products.slice(0, 10) }, null, 2)}.`;
    }
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    
    res.json({
      reportType,
      generatedAt: new Date(),
      report: response.text()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const predictDemand = async (req, res) => {
  try {
    const { productId, days = 30 } = req.body;
    
    const product = await Product.findById(productId);
    const orderHistory = await Order.find({
      'products.product': productId
    }).populate('products.product');
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
    Analyze this product's sales history and predict demand for the next ${days} days:
    
    Product: ${JSON.stringify(product, null, 2)}
    Order History: ${JSON.stringify(orderHistory, null, 2)}
    
    Provide:
    1. Predicted daily demand
    2. Recommended reorder quantity
    3. Optimal reorder timing
    4. Risk assessment
    5. Seasonal factors to consider
    
    Format as JSON with specific numbers.
    `;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    
    res.json({
      productId,
      product: product.name,
      forecastPeriod: days,
      prediction: response.text(),
      generatedAt: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSmartInsights = async (req, res) => {
  try {
    const products = await Product.find().populate('supplier');
    const orders = await Order.find().populate('products.product');
    const suppliers = await Supplier.find();
    
    const lowStockProducts = products.filter(p => p.quantity <= p.reorderLevel);
    const criticalStock = products.filter(p => p.quantity <= p.reorderLevel * 0.5);
    
    const categoryAnalysis = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = { count: 0, value: 0, lowStock: 0 };
      }
      acc[product.category].count++;
      acc[product.category].value += product.quantity * product.price;
      if (product.quantity <= product.reorderLevel) {
        acc[product.category].lowStock++;
      }
      return acc;
    }, {});
    
    const recentOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return orderDate >= weekAgo;
    });
    
    const totalInventoryValue = products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
    const avgOrderValue = orders.length > 0 ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length : 0;
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
    Analyze this inventory data and provide 4 smart business insights:
    
    INVENTORY OVERVIEW:
    - Total Products: ${products.length}
    - Total Value: $${totalInventoryValue.toLocaleString()}
    - Low Stock Items: ${lowStockProducts.length}
    - Critical Stock: ${criticalStock.length}
    
    CATEGORY BREAKDOWN:
    ${Object.entries(categoryAnalysis).map(([cat, data]) => 
      `- ${cat}: ${data.count} items, $${data.value.toLocaleString()} value, ${data.lowStock} low stock`
    ).join('\n')}
    
    SALES DATA:
    - Total Orders: ${orders.length}
    - Recent Orders (7 days): ${recentOrders.length}
    - Average Order Value: $${avgOrderValue.toFixed(2)}
    
    SUPPLIERS:
    - Total Suppliers: ${suppliers.length}
    - Average Rating: ${(suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1)}
    
    Provide exactly 4 insights in this format:
    1. [TREND/ALERT/OPTIMIZATION/RECOMMENDATION]: Brief insight about the data
    2. [TREND/ALERT/OPTIMIZATION/RECOMMENDATION]: Brief insight about the data
    3. [TREND/ALERT/OPTIMIZATION/RECOMMENDATION]: Brief insight about the data
    4. [TREND/ALERT/OPTIMIZATION/RECOMMENDATION]: Brief insight about the data
    
    Focus on actionable insights, stock alerts, sales trends, and optimization opportunities.
    `;
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    res.json({
      insights: response,
      metadata: {
        totalProducts: products.length,
        lowStockCount: lowStockProducts.length,
        criticalStockCount: criticalStock.length,
        totalValue: totalInventoryValue,
        recentOrdersCount: recentOrders.length,
        avgOrderValue: avgOrderValue,
        topCategory: Object.entries(categoryAnalysis).sort((a, b) => b[1].value - a[1].value)[0]?.[0] || 'N/A'
      },
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Smart Insights Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getRoleBasedInsights = async (req, res) => {
  try {
    const { role } = req.params;
    const products = await Product.find().populate('supplier');
    const orders = await Order.find().populate('products.product');
    const suppliers = await Supplier.find();
    
    const lowStockProducts = products.filter(p => p.quantity <= p.reorderLevel);
    const criticalStock = products.filter(p => p.quantity <= p.reorderLevel * 0.5);
    const todayOrders = orders.filter(order => {
      const today = new Date();
      const orderDate = new Date(order.createdAt);
      return orderDate.toDateString() === today.toDateString();
    });
    
    const pendingOrders = orders.filter(order => order.status === 'Pending');
    const processingOrders = orders.filter(order => order.status === 'Processing');
    
    let rolePrompt = '';
    let roleData = {};
    
    if (role === 'manager') {
      const avgOrderValue = orders.length > 0 ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length : 0;
      const weeklyOrders = orders.filter(order => {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return new Date(order.createdAt) >= weekAgo;
      });
      
      roleData = {
        totalOrders: orders.length,
        weeklyOrders: weeklyOrders.length,
        pendingOrders: pendingOrders.length,
        processingOrders: processingOrders.length,
        avgOrderValue: avgOrderValue,
        lowStockCount: lowStockProducts.length,
        criticalStockCount: criticalStock.length,
        supplierCount: suppliers.length
      };
      
      rolePrompt = `As an inventory manager, analyze this operational data and provide 4 concise management insights (max 80 characters each):
      
      OPERATIONAL METRICS:
      - Total Orders: ${roleData.totalOrders}
      - Weekly Orders: ${roleData.weeklyOrders}
      - Pending Orders: ${roleData.pendingOrders}
      - Processing Orders: ${roleData.processingOrders}
      - Average Order Value: $${roleData.avgOrderValue.toFixed(2)}
      - Low Stock Items: ${roleData.lowStockCount}
      - Critical Stock Items: ${roleData.criticalStockCount}
      - Active Suppliers: ${roleData.supplierCount}
      
      Focus on: team efficiency, workflow optimization, resource allocation, and operational improvements.
      Format: [PRIORITY/WORKFLOW/TEAM/ALERT]: brief actionable insight (max 80 chars)`;
    } else if (role === 'staff') {
      const urgentTasks = {
        criticalStock: criticalStock.map(p => ({ name: p.name, quantity: p.quantity, reorderLevel: p.reorderLevel })),
        pendingOrders: pendingOrders.map(o => ({ customer: o.customerName, amount: o.totalAmount, items: o.products.length })),
        todayDeadlines: processingOrders.filter(o => {
          const orderDate = new Date(o.createdAt);
          const daysDiff = (new Date() - orderDate) / (1000 * 60 * 60 * 24);
          return daysDiff >= 1;
        })
      };
      
      roleData = {
        criticalStockCount: criticalStock.length,
        pendingOrdersCount: pendingOrders.length,
        todayOrdersCount: todayOrders.length,
        urgentTasksCount: urgentTasks.criticalStock.length + urgentTasks.pendingOrders.length + urgentTasks.todayDeadlines.length,
        criticalItems: urgentTasks.criticalStock.slice(0, 3),
        priorityOrders: urgentTasks.pendingOrders.slice(0, 3)
      };
      
      rolePrompt = `As warehouse staff, analyze these urgent tasks and provide 4 immediate action items:
      
      URGENT TASKS:
      - Critical Stock Items: ${roleData.criticalStockCount}
      - Pending Orders: ${roleData.pendingOrdersCount}
      - Today's Orders: ${roleData.todayOrdersCount}
      - Total Urgent Tasks: ${roleData.urgentTasksCount}
      
      CRITICAL ITEMS: ${roleData.criticalItems.map(item => `${item.name} (${item.quantity}/${item.reorderLevel})`).join(', ')}
      PRIORITY ORDERS: ${roleData.priorityOrders.map(order => `${order.customer} ($${order.amount})`).join(', ')}
      
      Focus on: immediate actions, task prioritization, safety checks, and customer service.
      Format: [URGENT/RESTOCK/ORDER/CHECK]: specific task with clear action`;
    }
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(rolePrompt);
    const insights = result.response.text();
    
    res.json({
      role,
      insights,
      data: roleData,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Role-based insights error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardAnalytics, getAIInsights, generateInventoryReport, predictDemand, getSmartInsights, getRoleBasedInsights };