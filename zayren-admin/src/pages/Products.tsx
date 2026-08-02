import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, MoreVertical, Image as ImageIcon } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  stock: number;
  status: string;
  image_url?: string;
}

const Products = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'draft' | 'out of stock'>('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token') || 'mock_token';
        const response = await axios.get('http://127.0.0.1:8000/api/admin/products', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setProducts(response.data.products);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        
        // Fallback for visual testing
        const mockProducts = [
          { id: "1", name: "Classic White T-Shirt", category: "Clothing", price: "₦5,000", stock: 24, status: "Active", image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&q=80" },
          { id: "2", name: "Leather Crossbody Bag", category: "Accessories", price: "₦15,000", stock: 12, status: "Active", image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=100&q=80" },
          { id: "3", name: "Wireless Earbuds", category: "Electronics", price: "₦25,000", stock: 0, status: "Out of Stock", image_url: "https://images.unsplash.com/photo-1572569431965-31f104ce896e?w=100&q=80" },
          { id: "4", name: "Summer Floral Dress", category: "Clothing", price: "₦18,500", stock: 5, status: "Active", image_url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=100&q=80" },
          { id: "5", name: "Winter Jacket", category: "Clothing", price: "₦35,000", stock: 0, status: "Draft", image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=100&q=80" }
        ];
        setProducts(mockProducts);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getFilteredProducts = () => {
    if (activeTab === 'all') return products;
    return products.filter(p => p.status.toLowerCase() === activeTab);
  };

  const filteredProducts = getFilteredProducts();

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'badge-success';
      case 'draft': return 'badge-warning';
      case 'out of stock': return 'badge-danger';
      default: return 'badge-warning';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="text-primary">Loading products...</div></div>;
  }

  return (
    <div className="flex-col gap-6 animate-fade-in" style={{ maxWidth: '900px' }}>
      
      <div className="glass-card flex-col gap-4">
        
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Products / Items</h2>
          <button className="btn btn-primary flex items-center gap-2" style={{ padding: '8px 16px', fontSize: '14px' }}>
            <Plus size={16} />
            Add New Product
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          {(['all', 'active', 'draft', 'out of stock'] as const).map(tab => (
            <button 
              key={tab}
              className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline'}`}
              style={{ borderRadius: '20px', padding: '6px 16px', fontSize: '12px', border: activeTab === tab ? 'none' : 'none', textTransform: 'capitalize' }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List Table */}
        <div className="flex-col mt-2">
          
          <div className="flex items-center text-xs font-bold text-muted uppercase tracking-wider mb-2" style={{ padding: '0 12px' }}>
            <div style={{ flex: 2.5 }}>Product</div>
            <div style={{ flex: 1 }}>Price</div>
            <div style={{ flex: 1 }}>Stock</div>
            <div style={{ flex: 1 }}>Status</div>
            <div style={{ width: '32px' }}></div>
          </div>

          <div className="flex-col gap-2">
            {filteredProducts.length === 0 ? (
              <div className="text-center text-muted text-sm py-8">No {activeTab} products found.</div>
            ) : (
              filteredProducts.map(product => (
                <div key={product.id} className="flex items-center" style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  
                  <div className="flex items-center gap-4" style={{ flex: 2.5 }}>
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ImageIcon size={20} className="text-muted" />
                      </div>
                    )}
                    <div className="flex-col">
                      <span className="text-sm font-semibold">{product.name}</span>
                      <span className="text-xs text-muted">{product.category}</span>
                    </div>
                  </div>

                  <div className="text-sm font-bold" style={{ flex: 1 }}>
                    {product.price}
                  </div>

                  <div className="text-sm text-muted" style={{ flex: 1 }}>
                    {product.stock} in stock
                  </div>

                  <div style={{ flex: 1 }}>
                    <span className={`badge ${getStatusBadge(product.status)}`}>
                      {product.status}
                    </span>
                  </div>

                  <div style={{ width: '32px' }} className="flex justify-end">
                    <button className="btn btn-outline" style={{ padding: '4px', border: 'none', background: 'transparent' }}>
                      <MoreVertical size={16} className="text-muted hover:text-white transition-colors" />
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Products;
