import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Star, Mail, Phone, MapPin } from 'lucide-react';
import { supplierAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Suppliers = () => {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  
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
    contactEmail: '',
    contactPhone: '',
    address: '',
    rating: 3
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

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
      if (editingSupplier) {
        await supplierAPI.update(editingSupplier._id, formData);
        alert('Supplier updated successfully!');
      } else {
        await supplierAPI.create(formData);
        alert('Supplier created successfully!');
      }
      fetchSuppliers();
      resetForm();
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert('Error saving supplier: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contactEmail: supplier.contactEmail,
      contactPhone: supplier.contactPhone,
      address: supplier.address,
      rating: supplier.rating
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await supplierAPI.delete(id);
        fetchSuppliers();
        alert('Supplier deleted successfully!');
      } catch (error) {
        console.error('Error deleting supplier:', error);
        alert('Error deleting supplier: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      rating: 3
    });
    setEditingSupplier(null);
    setShowModal(false);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-600 mt-1">Manage your supplier relationships and contacts</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className={`bg-${theme.primary} text-white px-6 py-3 rounded-lg hover:bg-${theme.primaryHover} flex items-center transition-colors shadow-sm`}
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Supplier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((supplier) => (
          <div key={supplier._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{supplier.name}</h3>
                <div className="flex items-center space-x-1">
                  {renderStars(supplier.rating)}
                  <span className="text-sm text-gray-600 ml-2">({supplier.rating}/5)</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(supplier)}
                  className={`text-${theme.primary} hover:text-${theme.primaryHover} transition-colors p-2 hover:bg-gray-50 rounded-lg`}
                  title="Edit Supplier"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(supplier._id)}
                  className="text-red-600 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
                  title="Delete Supplier"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{supplier.contactEmail}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{supplier.contactPhone}</span>
              </div>
              <div className="flex items-start space-x-3 text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <span className="text-sm">{supplier.address}</span>
              </div>
              
              <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{supplier.products?.length || 0}</div>
                    <div className="text-xs text-gray-600">Products</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Last Supply</div>
                    <div className="text-sm font-medium text-gray-900">
                      {supplier.lastSupplied ? new Date(supplier.lastSupplied).toLocaleDateString() : 'Never'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </h3>
              <p className="text-gray-600 mt-1">
                {editingSupplier ? 'Update supplier information' : 'Enter supplier details below'}
              </p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Name</label>
                <input
                  type="text"
                  placeholder="Enter supplier name"
                  required
                  className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent transition-all`}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                  <input
                    type="email"
                    placeholder="supplier@example.com"
                    required
                    className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent transition-all`}
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="+1-555-0123"
                    required
                    className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent transition-all`}
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  placeholder="Enter complete address"
                  required
                  rows="3"
                  className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent transition-all resize-none`}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex items-center space-x-4">
                  <select
                    className={`flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-${theme.primary} focus:border-transparent transition-all`}
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5].map(rating => (
                      <option key={rating} value={rating}>{rating} Star{rating > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                  <div className="flex items-center space-x-1">
                    {renderStars(formData.rating)}
                  </div>
                </div>
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
                  {editingSupplier ? 'Update Supplier' : 'Create Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;