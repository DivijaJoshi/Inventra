const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const Product = require('./models/productModel');
const User = require('./models/userModel');
const Supplier = require('./models/supplierModel');
const Order = require('./models/orderModel');

dotenv.config();

const app = express();

connectDB();

// Create default admin user and sample data
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@inventra.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@inventra.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Default admin created: admin@inventra.com / admin123');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

const createSampleData = async () => {
  try {
    const supplierCount = await Supplier.countDocuments();
    if (supplierCount === 0) {
      const suppliers = await Supplier.insertMany([
        {
          name: 'TechCorp Solutions',
          contactEmail: 'sales@techcorp.com',
          contactPhone: '+1-555-0101',
          address: '123 Tech Street, Silicon Valley, CA 94000',
          rating: 5
        },
        {
          name: 'Global Electronics Ltd',
          contactEmail: 'orders@globalelec.com',
          contactPhone: '+1-555-0202',
          address: '456 Electronics Ave, Austin, TX 78701',
          rating: 4
        },
        {
          name: 'Office Supplies Pro',
          contactEmail: 'contact@officesupplies.com',
          contactPhone: '+1-555-0303',
          address: '789 Business Blvd, New York, NY 10001',
          rating: 4
        }
      ]);

      const products = await Product.insertMany([
        {
          name: 'MacBook Pro 16"',
          sku: 'MBP-16-001',
          category: 'Electronics',
          price: 2499,
          quantity: 15,
          reorderLevel: 5,
          supplier: suppliers[0]._id
        },
        {
          name: 'Dell XPS 13',
          sku: 'DELL-XPS-002',
          category: 'Electronics',
          price: 1299,
          quantity: 8,
          reorderLevel: 10,
          supplier: suppliers[1]._id
        },
        {
          name: 'iPhone 15 Pro',
          sku: 'IPH-15P-003',
          category: 'Electronics',
          price: 999,
          quantity: 25,
          reorderLevel: 15,
          supplier: suppliers[0]._id
        },
        {
          name: 'Wireless Mouse',
          sku: 'WM-LOG-004',
          category: 'Accessories',
          price: 79,
          quantity: 45,
          reorderLevel: 20,
          supplier: suppliers[1]._id
        },
        {
          name: 'Mechanical Keyboard',
          sku: 'KB-MEC-005',
          category: 'Accessories',
          price: 149,
          quantity: 3,
          reorderLevel: 10,
          supplier: suppliers[1]._id
        },
        {
          name: 'Office Chair',
          sku: 'OC-ERG-006',
          category: 'Furniture',
          price: 299,
          quantity: 12,
          reorderLevel: 8,
          supplier: suppliers[2]._id
        },
        {
          name: 'Standing Desk',
          sku: 'SD-ADJ-007',
          category: 'Furniture',
          price: 599,
          quantity: 6,
          reorderLevel: 5,
          supplier: suppliers[2]._id
        },
        {
          name: 'Monitor 27" 4K',
          sku: 'MON-4K-008',
          category: 'Electronics',
          price: 449,
          quantity: 18,
          reorderLevel: 12,
          supplier: suppliers[1]._id
        },
        {
          name: 'Webcam HD',
          sku: 'WC-HD-009',
          category: 'Accessories',
          price: 89,
          quantity: 2,
          reorderLevel: 15,
          supplier: suppliers[0]._id
        },
        {
          name: 'Printer Laser',
          sku: 'PRT-LAS-010',
          category: 'Office Equipment',
          price: 199,
          quantity: 7,
          reorderLevel: 5,
          supplier: suppliers[2]._id
        }
      ]);

      await Order.insertMany([
        {
          customerName: 'John Smith',
          customerEmail: 'john@company.com',
          products: [
            { product: products[0]._id, quantity: 2 },
            { product: products[3]._id, quantity: 4 }
          ],
          totalAmount: 5314,
          status: 'Delivered',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        {
          customerName: 'Sarah Johnson',
          customerEmail: 'sarah@startup.com',
          products: [
            { product: products[1]._id, quantity: 1 },
            { product: products[4]._id, quantity: 2 }
          ],
          totalAmount: 1597,
          status: 'Shipped',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        {
          customerName: 'Mike Wilson',
          customerEmail: 'mike@enterprise.com',
          products: [
            { product: products[2]._id, quantity: 5 },
            { product: products[7]._id, quantity: 3 }
          ],
          totalAmount: 6342,
          status: 'Processing',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
          customerName: 'Lisa Brown',
          customerEmail: 'lisa@agency.com',
          products: [
            { product: products[5]._id, quantity: 8 },
            { product: products[6]._id, quantity: 4 }
          ],
          totalAmount: 4788,
          status: 'Pending'
        }
      ]);

      console.log('Sample data created successfully!');
      console.log('- 3 Suppliers added');
      console.log('- 10 Products added');
      console.log('- 4 Orders added');
    }
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
};


setTimeout(createDefaultAdmin, 2000);
setTimeout(createSampleData, 4000);

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

cron.schedule('0 9 * * *', async () => {
  try {
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    });
    
    if (lowStockProducts.length > 0) {
      console.log(`Alert: ${lowStockProducts.length} products are running low on stock`);
    }
  } catch (error) {
    console.error('Cron job error:', error);
  }
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});