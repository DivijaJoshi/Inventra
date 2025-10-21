import React, { useState, useEffect } from 'react';
import { Plus, Edit, Package, Trash2 } from 'lucide-react';
import { orderAPI, productAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
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
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    products: [{ product: '', quantity: 1 }]
  });

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAll();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Calculate total amount
      let totalAmount = 0;
      for (let item of formData.products) {
        const product = products.find(p => p._id === item.product);
        if (product) {
          totalAmount += product.price * item.quantity;
        }
      }
      
      const orderData = {
        ...formData,
        totalAmount
      };
      
      await orderAPI.create(orderData);
      fetchOrders();
      resetForm();
      alert('Order created successfully!');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order: ' + (error.response?.data?.message || error.message));
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await orderAPI.updateStatus(orderId, status);
      fetchOrders();
      alert('Order status updated successfully!');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status: ' + (error.response?.data?.message || error.message));
    }
  };

  const deleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await orderAPI.delete(orderId);
        fetchOrders();
        alert('Order deleted successfully!');
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Error deleting order: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerEmail: '',
      products: [{ product: '', quantity: 1 }]
    });
    setShowModal(false);
  };

  const addProductLine = () => {
    setFormData({
      ...formData,
      products: [...formData.products, { product: '', quantity: 1 }]
    });
  };

  const updateProductLine = (index, field, value) => {
    const updatedProducts = formData.products.map((item, i) =>
      i === index ? { ...item, [field]: field === 'quantity' ? parseInt(value) || 1 : value } : item
    );
    setFormData({ ...formData, products: updatedProducts });
  };

  const removeProductLine = (index) => {
    if (formData.products.length > 1) {
      const updatedProducts = formData.products.filter((_, i) => i !== index);
      setFormData({ ...formData, products: updatedProducts });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Processing: 'bg-blue-100 text-blue-800',
      Shipped: 'bg-purple-100 text-purple-800',
      Delivered: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Track and manage customer orders</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className={`bg-${theme.primary} text-white px-6 py-3 rounded-lg hover:bg-${theme.primaryHover} flex items-center transition-colors shadow-sm`}
        >
          <Plus className="h-5 w-5 mr-2" />
          New Order
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Items
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Total
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Date
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {orders.map((order, index) => (
              <tr key={order._id} className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${index === orders.length - 1 ? 'border-b-0' : ''}`}>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{order.customerName}</div>
                    <div className="text-sm text-gray-600">{order.customerEmail}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900 font-medium">{order.products.length}</span>
                    <span className="text-gray-600 text-sm">items</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900">
                  ${order.totalAmount.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className={`text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-${theme.primary} transition-all`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                    <button
                      onClick={() => deleteOrder(order._id)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                      title="Delete Order"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900">Create New Order</h3>
              <p className="text-gray-600 mt-1">Add customer details and select products</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                  <input
                    type="text"
                    placeholder="Enter customer name"
                    required
                    className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent transition-all`}
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Email</label>
                  <input
                    type="email"
                    placeholder="customer@example.com"
                    required
                    className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent transition-all`}
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Order Items</label>
                  <button
                    type="button"
                    onClick={addProductLine}
                    className={`text-${theme.primary} hover:text-${theme.primaryHover} text-sm font-medium flex items-center transition-colors`}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Product
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.products.map((item, index) => (
                    <div key={index} className="flex space-x-3 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <select
                          required
                          className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent transition-all`}
                          value={item.product}
                          onChange={(e) => updateProductLine(index, 'product', e.target.value)}
                        >
                          <option value="">Select Product</option>
                          {products.map((product) => (
                            <option key={product._id} value={product._id}>
                              {product.name} - ${product.price} (Stock: {product.quantity})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          required
                          className={`w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent transition-all text-center`}
                          value={item.quantity}
                          onChange={(e) => updateProductLine(index, 'quantity', e.target.value)}
                        />
                      </div>
                      {formData.products.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProductLine(index)}
                          className="px-3 py-3 text-red-600 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className={`flex justify-end p-4 bg-${theme.primaryLight} rounded-lg`}>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Order Total</div>
                    <div className="text-2xl font-bold text-gray-900">
                      ${formData.products.reduce((sum, item) => {
                        const product = products.find(p => p._id === item.product);
                        return sum + (product ? product.price * item.quantity : 0);
                      }, 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-6 py-3 bg-${theme.primary} text-white rounded-lg hover:bg-${theme.primaryHover} transition-colors font-medium shadow-sm`}
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;