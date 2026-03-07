import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, X, Trash2, ArrowRight, Check, ShoppingBag, Plus, Minus, Truck, Store, CreditCard, Banknote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  
  // Checkout State
  const [deliveryMethod, setDeliveryMethod] = useState<'Retirada' | 'Entrega'>('Retirada');
  const [paymentMethod, setPaymentMethod] = useState<'Pix' | 'Cartão' | 'Dinheiro'>('Pix');
  
  const navigate = useNavigate();
  const { 
    cart, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    cartTotal, 
    cartCount, 
    isCartOpen, 
    setIsCartOpen,
    clearCart
  } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
      
      // Extract unique categories
      const cats = ['Todos', ...new Set(data.map((p: Product) => p.category))];
      setCategories(cats as string[]);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    try {
      const authRes = await fetch('/api/me');
      if (!authRes.ok) {
        // Close cart before redirecting so it doesn't pop up immediately on return if state persisted weirdly
        setIsCartOpen(false);
        navigate('/login?redirect=/loja');
        return;
      }

      const orderData = {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        total: cartTotal,
        deliveryMethod,
        paymentMethod
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        alert('Pedido realizado com sucesso!');
        clearCart();
        setIsCartOpen(false);
        navigate('/me');
      } else {
        alert('Erro ao finalizar pedido.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  const filteredProducts = selectedCategory === 'Todos' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nossos Produtos</h1>
            <p className="text-gray-500 mt-1">Os melhores cuidados para o seu cabelo</p>
          </div>
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors group"
          >
            <ShoppingCart className="text-gray-700 group-hover:text-emerald-600 transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart} 
              />
            ))}
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingBag size={20} className="text-emerald-600" />
                  Seu Carrinho
                </h2>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-5 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-20 text-gray-400">
                    <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Seu carrinho está vazio</p>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="mt-4 text-emerald-600 font-medium hover:underline"
                    >
                      Continuar comprando
                    </button>
                  </div>
                ) : (
                  <>
                    {cart.map(item => (
                      <div key={item.id} className="flex gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                        <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow flex flex-col justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 line-clamp-1">{item.name}</h3>
                            <p className="text-emerald-600 font-bold text-sm">R$ {item.price.toFixed(2)}</p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1 border border-gray-100">
                              <button 
                                onClick={() => updateQuantity(item.id, -1)}
                                className="text-gray-500 hover:text-gray-900 p-1"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, 1)}
                                className="text-gray-500 hover:text-gray-900 p-1"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="w-full py-3 mt-4 border border-emerald-600 text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                    >
                      Continuar Comprando
                    </button>

                    {/* Checkout Options */}
                    <div className="mt-8 space-y-6 border-t border-gray-100 pt-6">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <Truck size={18} className="text-emerald-600" />
                          Forma de Entrega
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setDeliveryMethod('Retirada')}
                            className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                              deliveryMethod === 'Retirada'
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                : 'border-gray-200 hover:border-emerald-200'
                            }`}
                          >
                            Retirada no Local
                          </button>
                          <button
                            onClick={() => setDeliveryMethod('Entrega')}
                            className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                              deliveryMethod === 'Entrega'
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                : 'border-gray-200 hover:border-emerald-200'
                            }`}
                          >
                            Entrega
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <CreditCard size={18} className="text-emerald-600" />
                          Forma de Pagamento
                        </h3>
                        <div className="space-y-2">
                          {['Pix', 'Cartão', 'Dinheiro'].map((method) => (
                            <button
                              key={method}
                              onClick={() => setPaymentMethod(method as any)}
                              className={`w-full p-3 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between ${
                                paymentMethod === method
                                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                  : 'border-gray-200 hover:border-emerald-200'
                              }`}
                            >
                              {method}
                              {paymentMethod === method && <Check size={16} />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="p-5 border-t border-gray-100 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-500">Total</span>
                  <span className="text-2xl font-bold text-gray-900">R$ {cartTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                >
                  Finalizar Compra
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
