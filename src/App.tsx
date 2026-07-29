import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Plus, Trash2, Lock, X, Phone, MessageCircle, Check, Menu } from 'lucide-react';
import { Product, CartItem } from './types';
import { INITIAL_PRODUCTS } from './data/products';

const PHONE_NUMBER = "03248355112";
const WHATSAPP_NUMBER = "923248355112";

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Admin States
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  
  // New Product Form
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: 'Tote' as Product['category'],
    image: '',
    description: ''
  });

  // Checkout States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '', city: '' });
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Initialize LocalStorage Database
  useEffect(() => {
    const savedProducts = localStorage.getItem('awais_products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      localStorage.setItem('awais_products', JSON.stringify(INITIAL_PRODUCTS));
      setProducts(INITIAL_PRODUCTS);
    }
  }, []);

  const saveProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    localStorage.setItem('awais_products', JSON.stringify(updatedProducts));
  };

  // Cart Handlers
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(prev =>
      prev.map(item => {
        if (item.product.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Admin Handlers
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin123') {
      setIsAdminLoggedIn(true);
      setAdminError('');
    } else {
      setAdminError('Invalid Admin Password!');
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;

    const productToAdd: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      price: Number(newProduct.price),
      category: newProduct.category,
      image: newProduct.image.trim() || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800',
      description: newProduct.description || 'Luxury Handbag from Awais Collection.',
      inStock: true
    };

    saveProducts([productToAdd, ...products]);
    setNewProduct({ name: '', price: '', category: 'Tote', image: '', description: '' });
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to remove this handbag?')) {
      const updated = products.filter(p => p.id !== id);
      saveProducts(updated);
    }
  };

  // WhatsApp Order Routing
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orderDetails = cart.map(i => `- ${i.product.name} (x${i.quantity}): Rs. ${i.product.price * i.quantity}`).join('%0A');
    const text = `*NEW ORDER - AWAIS HANDBAGS*%0A%0A*Customer Details:*%0AName: ${customerInfo.name}%0APhone: ${customerInfo.phone}%0AAddress: ${customerInfo.address}, ${customerInfo.city}%0A%0A*Items Ordered:*%0A${orderDetails}%0A%0A*Total Amount:* Rs. ${cartTotal}`;
    
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
    setCart([]);
    setIsCheckoutOpen(false);
    setOrderSuccess(true);
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-black text-amber-100 text-xs py-2 px-4 text-center tracking-widest font-medium uppercase">
        Free Delivery Nationwide | Call / WhatsApp: <span className="font-bold text-amber-400">{PHONE_NUMBER}</span>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setSelectedCategory('All')}>
            <div className="w-11 h-11 bg-black text-amber-400 font-serif font-bold text-2xl flex items-center justify-center rounded-none shadow-md border-2 border-amber-400 tracking-tighter">
              A
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-widest uppercase text-black block leading-none">
                AWAIS
              </span>
              <span className="text-[10px] tracking-[0.3em] uppercase text-amber-700 font-bold block mt-1">
                Luxury Handbags
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xs mx-8 relative">
            <input
              type="text"
              placeholder="Search luxury bags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 pl-10 pr-4 py-2 rounded-full text-sm border-none focus:ring-2 focus:ring-black outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-5">
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-xs uppercase tracking-wider font-semibold text-gray-500 hover:text-black flex items-center gap-1 border border-gray-300 px-3 py-1.5 rounded-full transition"
            >
              <Lock className="w-3.5 h-3.5" /> Admin
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-black hover:opacity-75 transition"
            >
              <ShoppingBag className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative bg-black text-white py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=1600')" }}></div>
        <div className="relative max-w-3xl mx-auto space-y-4">
          <span className="text-amber-400 text-xs tracking-[0.4em] uppercase font-semibold">Exquisite Craftsmanship</span>
          <h1 className="text-4xl md:text-6xl font-serif font-normal tracking-wide">AWAIS Luxury Collection</h1>
          <p className="text-gray-300 text-sm md:text-base font-light max-w-xl mx-auto">
            Discover timeless handbags designed to elevate your style. Handcrafted elegance delivered directly to your doorstep.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        
        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {['All', 'Tote', 'Clutch', 'Shoulder Bag', 'Crossbody'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 text-xs tracking-wider uppercase font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-black text-amber-400 font-semibold shadow'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group bg-white border border-gray-100 flex flex-col justify-between transition-all duration-300 hover:shadow-xl">
              <div className="relative overflow-hidden aspect-square bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-black text-amber-300 text-[10px] font-bold tracking-widest uppercase px-2 py-1">
                  {product.category}
                </span>
                {isAdminLoggedIn && (
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="absolute top-3 right-3 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-md"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-gray-900 text-lg group-hover:text-amber-800 transition">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 text-xs line-clamp-2 mt-1">{product.description}</p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-black font-bold text-base">Rs. {product.price.toLocaleString()}</span>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-black text-amber-400 text-xs tracking-wider uppercase font-semibold px-4 py-2 hover:bg-amber-400 hover:text-black transition"
                  >
                    Add To Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-emerald-600 text-white p-4 rounded-full shadow-2xl hover:bg-emerald-500 transition-all z-40 flex items-center justify-center group"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 whitespace-nowrap text-xs font-bold uppercase tracking-wider">
          Chat With Awais
        </span>
      </a>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-full flex flex-col justify-between shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-serif text-xl font-bold">Shopping Cart ({cart.length})</h2>
              <button onClick={() => setIsCartOpen(false)}><X className="w-6 h-6 text-gray-400" /></button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-12">Your cart is empty.</p>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="flex gap-4 border-b pb-4">
                    <img src={item.product.image} className="w-16 h-16 object-cover border" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">{item.product.name}</h4>
                      <p className="text-xs text-gray-500">Rs. {item.product.price}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateCartQty(item.product.id, -1)} className="px-2 bg-gray-200">-</button>
                        <span className="text-xs font-bold">{item.quantity}</span>
                        <button onClick={() => updateCartQty(item.product.id, 1)} className="px-2 bg-gray-200">+</button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>Rs. {cartTotal.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                  className="w-full bg-black text-amber-400 py-3 font-bold uppercase tracking-widest text-xs hover:bg-amber-400 hover:text-black transition"
                >
                  Proceed To Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 shadow-2xl relative">
            <button onClick={() => setIsCheckoutOpen(false)} className="absolute top-4 right-4"><X className="w-5 h-5 text-gray-400" /></button>
            <h2 className="font-serif text-xl font-bold mb-4">Complete Order (Cash on Delivery)</h2>
            <form onSubmit={handleCheckoutSubmit} className="space-y-3">
              <input type="text" placeholder="Full Name" required value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full border p-2 text-sm" />
              <input type="tel" placeholder="Phone / WhatsApp Number" required value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full border p-2 text-sm" />
              <input type="text" placeholder="Full Delivery Address" required value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} className="w-full border p-2 text-sm" />
              <input type="text" placeholder="City" required value={customerInfo.city} onChange={e => setCustomerInfo({...customerInfo, city: e.target.value})} className="w-full border p-2 text-sm" />
              <button type="submit" className="w-full bg-emerald-600 text-white py-3 font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition">
                Send Order Via WhatsApp
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Panel Modal */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsAdminOpen(false)} className="absolute top-4 right-4"><X className="w-5 h-5 text-gray-400" /></button>

            {!isAdminLoggedIn ? (
              <form onSubmit={handleAdminLogin} className="space-y-4 py-6">
                <h2 className="font-serif text-xl font-bold text-center">Store Owner Login</h2>
                <p className="text-xs text-gray-500 text-center">Enter admin password to manage products.</p>
                {adminError && <p className="text-red-500 text-xs text-center font-bold">{adminError}</p>}
                <input
                  type="password"
                  placeholder="Admin Password (Default: admin123)"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  className="w-full border p-2 text-sm"
                />
                <button type="submit" className="w-full bg-black text-amber-400 py-2.5 text-xs font-bold uppercase tracking-wider">
                  Login To Admin Panel
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b pb-3">
                  <h2 className="font-serif text-xl font-bold">Admin Control Panel</h2>
                  <button onClick={() => setIsAdminLoggedIn(false)} className="text-xs text-red-600 font-bold">Logout</button>
                </div>

                <form onSubmit={handleAddProduct} className="space-y-3 bg-gray-50 p-4 border border-gray-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700">Add New Handbag</h3>
                  <input type="text" placeholder="Bag Title" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full border p-2 text-xs" />
                  <input type="number" placeholder="Price (PKR)" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full border p-2 text-xs" />
                  <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value as any})} className="w-full border p-2 text-xs">
                    <option value="Tote">Tote</option>
                    <option value="Clutch">Clutch</option>
                    <option value="Shoulder Bag">Shoulder Bag</option>
                    <option value="Crossbody">Crossbody</option>
                  </select>
                  <input type="url" placeholder="Image URL (Unsplash or Direct Link)" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="w-full border p-2 text-xs" />
                  <textarea placeholder="Description" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full border 
