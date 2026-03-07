import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Truck, CreditCard, ShoppingBag, Home } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'motion/react';

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: number;
  total: number;
  status: string;
  delivery_method: string;
  payment_method: string;
  created_at: string;
  items: OrderItem[];
}

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetch(`/api/orders/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Order not found');
          return res.json();
        })
        .then(data => {
          setOrder(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
          // navigate('/me'); // Redirect if error? Maybe just show error state.
        });
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Pedido não encontrado</h1>
        <Link to="/loja" className="text-emerald-600 hover:underline">Voltar para a loja</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
        >
          <div className="bg-emerald-600 p-8 text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <CheckCircle size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Pedido Realizado com Sucesso!</h1>
            <p className="text-emerald-100 text-lg">Obrigado pela sua compra. Seu pedido foi recebido.</p>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-center border-b border-gray-100 pb-6 mb-6">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Número do Pedido</p>
                <p className="text-2xl font-bold text-gray-900">#{order.id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Status</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  {order.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="text-emerald-600" size={20} />
                  Entrega
                </h3>
                <p className="text-gray-600 font-medium">{order.delivery_method}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {order.delivery_method === 'Entrega' 
                    ? 'Seu pedido será enviado para o endereço cadastrado.' 
                    : 'Disponível para retirada na loja.'}
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="text-emerald-600" size={20} />
                  Pagamento
                </h3>
                <p className="text-gray-600 font-medium">{order.payment_method}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Total: <span className="font-bold text-gray-900">R$ {order.total.toFixed(2)}</span>
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6 mb-8">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag className="text-emerald-600" size={20} />
                Itens do Pedido
              </h3>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-xs">
                        {item.quantity}x
                      </div>
                      <span className="text-gray-700 font-medium">{item.product_name}</span>
                    </div>
                    <span className="text-gray-900 font-semibold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                <span className="font-bold text-gray-900 text-lg">Total</span>
                <span className="font-bold text-emerald-600 text-xl">R$ {order.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/loja" 
                className="flex-1 py-3 px-6 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
              >
                <ShoppingBag size={18} />
                Continuar Comprando
              </Link>
              <Link 
                to="/me" 
                className="flex-1 py-3 px-6 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Home size={18} />
                Meus Pedidos
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
