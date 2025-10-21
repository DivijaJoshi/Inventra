import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, AlertTriangle } from 'lucide-react';
import { productAPI, supplierAPI } from '../utils/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  
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
    name: '',
    sku: '',
    category: '',
    price: '',
    quantity: '',
    reorderLevel: '',
    supplier: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
    
    // Handle URL parameters
    const params = new URLSearchParams(location.search);
    const filter = params.get('filter');
    const category = params.get('category');
    
    if (filter === 'lowstock') {
      setActiveFilter('lowstock');
    } else if (category) {
      setActiveFilter(`category:${category}`);
      setSearchTerm(category);
    }
  }, [location.search]);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await supplierAPI.getAll();
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productAPI.update(editingProduct._id, formData);
        alert('Product updated successfully!');
      } else {
        await productAPI.create(formData);
        alert('Product created successfully!');
      }
      fetchProducts();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      reorderLevel: product.reorderLevel,
      supplier: product.supplier?._id || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.delete(id);
        fetchProducts();
        alert('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      category: '',
      price: '',
      quantity: '',
      reorderLevel: '',
      supplier: ''
    });
    setEditingProduct(null);
    setShowModal(false);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === 'lowstock') {
      return matchesSearch && product.quantity <= product.reorderLevel;
    }
    
    if (activeFilter.startsWith('category:')) {
      const filterCategory = activeFilter.split(':')[1];
      return matchesSearch && product.category.toLowerCase() === filterCategory.toLowerCase();
    }
    
    return matchesSearch;
  });
  
  const clearFilters = () => {
    setActiveFilter('');
    setSearchTerm('');
    navigate('/products');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your inventory and product catalog</p>
          {activeFilter && (
            <div className="flex items-center mt-3">
              <span className="text-sm text-gray-600 mr-2">
                {activeFilter === 'lowstock' ? 'Showing low stock items' : 
                 activeFilter.startsWith('category:') ? `Showing ${activeFilter.split(':')[1]} category` : ''}
              </span>
              <button 
                onClick={clearFilters}
                className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className={`bg-${theme.primary} text-white px-6 py-3 rounded-lg hover:bg-${theme.primaryHover} flex items-center transition-colors shadow-sm`}
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Product
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="p-6 border-b border-gray-100">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search products by name, SKU, or category..."
                className={`pl-12 pr-4 py-3 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent transition-all`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => {
                setActiveFilter('lowstock');
                navigate('/products?filter=lowstock');
              }}
              className={`px-6 py-3 rounded-lg flex items-center text-sm font-medium transition-colors ${
                activeFilter === 'lowstock' 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Low Stock
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  SKU
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Supplier
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredProducts.map((product, index) => (
                <tr key={product._id} className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${index === filteredProducts.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{product.sku}</code>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full bg-${theme.secondary} text-${theme.primaryText}`}>
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    ${product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                        product.quantity <= product.reorderLevel
                          ? 'bg-red-100 text-red-800'
                          : product.quantity <= product.reorderLevel * 1.5
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {product.quantity}
                      </span>
                      {product.quantity <= product.reorderLevel && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {product.supplier?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleEdit(product)}
                        className={`text-${theme.primary} hover:text-${theme.primaryHover} transition-colors`}
                        title="Edit Product"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        title="Delete Product"
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
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <p className="text-gray-600 mt-1">
                {editingProduct ? 'Update product information' : 'Enter product details below'}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    placeholder="Enter product name"
                    required
                    className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent transition-all`}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                  <input
                    type="text"
                    placeholder="Product SKU"
                    required
                    className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent transition-all`}
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    placeholder="Product category"
                    required
                    className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent transition-all`}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    required
                    className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent transition-all`}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    placeholder="Stock quantity"
                    required
                    className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent transition-all`}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reorder Level</label>
                  <input
                    type="number"
                    placeholder="Minimum stock"
                    required
                    className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent transition-all`}
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                <select
                  className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent transition-all`}
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                >
                  <option value="">Select a supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
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
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;