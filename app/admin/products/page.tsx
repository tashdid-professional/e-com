'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discount_price?: number | null;
  image_url: string | null;
  category: string | null;
  stock: number;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    image_url: '',
    category: '',
    stock: '',
  });
  const [additionalImages, setAdditionalImages] = useState<string[]>(['']);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const productData = {
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
      image_url: formData.image_url || null,
      category: formData.category || null,
      stock: parseInt(formData.stock) || 0,
    };

    try {
      let productId: string;

      if (editingProduct) {
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
          .select();

        if (error) throw error;
        productId = editingProduct.id;

        // Delete existing additional images
        await supabase
          .from('product_images')
          .delete()
          .eq('product_id', productId);
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select();

        if (error) throw error;
        if (!data || data.length === 0) throw new Error('No product data returned');
        productId = data[0].id;
      }

      // Save additional images
      const validImages = additionalImages.filter(url => url.trim() !== '');
      if (validImages.length > 0) {
        const imageRecords = validImages.map((url, index) => ({
          product_id: productId,
          image_url: url,
          display_order: index,
        }));

        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imageRecords);

        if (imagesError) throw imagesError;
      }

      alert(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
      resetForm();
      await fetchProducts();
    } catch (error: any) {
      console.error('Error:', error);
      alert(`Error: ${error.message || 'Failed to save product'}`);
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('Product deleted successfully!');
      await fetchProducts();
    } catch (error: any) {
      console.error('Error:', error);
      alert(`Error: ${error.message || 'Failed to delete product'}`);
      setLoading(false);
    }
  };

  const handleEdit = async (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      discount_price: product.discount_price ? product.discount_price.toString() : '',
      image_url: product.image_url || '',
      category: product.category || '',
      stock: product.stock.toString(),
    });

    // Fetch additional images
    const { data: images } = await supabase
      .from('product_images')
      .select('image_url')
      .eq('product_id', product.id)
      .order('display_order');

    if (images && images.length > 0) {
      setAdditionalImages(images.map(img => img.image_url));
    } else {
      setAdditionalImages(['']);
    }

    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      discount_price: '',
      image_url: '',
      category: '',
      stock: '',
    });
    setAdditionalImages(['']);
    setEditingProduct(null);
    setShowForm(false);
  };

  const addImageField = () => {
    setAdditionalImages([...additionalImages, '']);
  };

  const removeImageField = (index: number) => {
    const newImages = additionalImages.filter((_, i) => i !== index);
    setAdditionalImages(newImages.length > 0 ? newImages : ['']);
  };

  const updateImageField = (index: number, value: string) => {
    const newImages = [...additionalImages];
    newImages[index] = value;
    setAdditionalImages(newImages);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Products Management</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>

        {/* Product Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">
              {editingProduct ? 'Edit Product' : 'New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Discount Price (Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Leave empty for no discount"
                  value={formData.discount_price}
                  onChange={(e) =>
                    setFormData({ ...formData, discount_price: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black"
                />
                {formData.discount_price && formData.price && parseFloat(formData.discount_price) >= parseFloat(formData.price) && (
                  <p className="text-red-500 text-xs mt-1">Discount price should be less than regular price</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Main Image (used in product cards)
                </label>
                <ImageUpload
                  currentImage={formData.image_url}
                  onUpload={(url) => setFormData({ ...formData, image_url: url })}
                  onRemove={() => setFormData({ ...formData, image_url: '' })}
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">
                    Additional Images (for product detail page)
                  </label>
                  <button
                    type="button"
                    onClick={addImageField}
                    className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Image
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {additionalImages.map((image, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Image {index + 1}</span>
                        {additionalImages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImageField(index)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <ImageUpload
                        currentImage={image}
                        onUpload={(url) => updateImageField(index, url)}
                        onRemove={() => updateImageField(index, '')}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading...</div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No products yet. Add your first product!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.image_url && (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="font-semibold">{product.name}</p>
                            {product.description && (
                              <p className="text-sm text-gray-600 line-clamp-1">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {product.category || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {product.discount_price ? (
                          <div>
                            <p className="font-semibold text-green-600">
                              ${product.discount_price.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500 line-through">
                              ${product.price.toFixed(2)}
                            </p>
                          </div>
                        ) : (
                          <p className="font-semibold">
                            ${product.price.toFixed(2)}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${
                            product.stock > 10
                              ? 'bg-green-100 text-green-800'
                              : product.stock > 0
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
