import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ShoppingBag, Clock, Package, ChevronRight, MapPin, CheckCircle2, Circle, XCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price: number;
  product_image?: string;
}

interface Order {
  id: number;
  created_at: string;
  total: number;
  status: string;
  delivery_method?: string;
  payment_method?: string;
  items: OrderItem[];
}

const ORDER_STEPS = ['Pendente', 'Pago', 'Enviado', 'Entregue'];

function OrderStatusStepper({ status }: { status: string }) {
  if (status === 'Cancelado') {
    return (
      <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg w-full">
        <XCircle size={20} />
        <span className="font-medium">Pedido Cancelado</span>
      </div>
    );
  }

  const currentStepIndex = ORDER_STEPS.indexOf(status);
  // If status is not in the list (e.g. unknown), default to -1
  
  return (
    <div className="w-full py-4">
      <div className="relative flex justify-between items-center">
        {/* Progress Bar Background */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
        
        {/* Active Progress Bar */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-emerald-500 -z-10 rounded-full transition-all duration-500"
          style={{ width: `${Math.max(0, (currentStepIndex / (ORDER_STEPS.length - 1)) * 100)}%` }}
        ></div>

        {ORDER_STEPS.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div key={step} className="flex flex-col items-center gap-2 bg-white px-2">
              {isCompleted ? (
                <CheckCircle2 className="text-emerald-500 bg-white" size={24} fill="white" />
              ) : (
                <Circle className="text-gray-300 bg-white" size={24} fill="white" />
              )}
              <span className={`text-xs font-medium ${isCurrent ? 'text-emerald-600' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ClientProfile() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch('/api/client/orders')
        .then(res => res.json())
        .then(data => {
          setOrders(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      
      <div className="pt-24 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sidebar / User Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              <div className="p-6 bg-gradient-to-br from-emerald-50 to-white border-b border-gray-100 text-center">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-3xl font-bold mx-auto mb-4 shadow-inner">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-500 text-sm">{user.email}</p>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3 text-gray-600">
                  <MapPin className="text-emerald-500 mt-1 shrink-0" size={18} />
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Endereço de Entrega</p>
                    <p className="text-sm">{user.address || 'Endereço não cadastrado'}</p>
                  </div>
                </div>
                
                {/* Add more user details here if needed */}
              </div>
            </div>
          </div>

          {/* Main Content / Orders */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="text-emerald-600" />
              Meus Pedidos
            </h2>

            {loading ? (
              <div className="text-center py-12 bg-white rounded-3xl shadow-sm border border-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="text-gray-400 mt-4 text-sm">Carregando pedidos...</p>
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map(order => (
                  <div key={order.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-gray-50">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="text-emerald-600" size={20} />
                          <span className="text-lg font-bold text-gray-900">Pedido #{order.id}</span>
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock size={14} />
                          {format(parseISO(order.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total</p>
                        <span className="text-xl font-bold text-emerald-600">
                          R$ {order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Status Stepper */}
                    <div className="mb-8 px-2">
                      <OrderStatusStepper status={order.status} />
                    </div>

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Entrega</p>
                        <p className="text-sm font-medium text-gray-700">{order.delivery_method || 'Padrão'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Pagamento</p>
                        <p className="text-sm font-medium text-gray-700">{order.payment_method || 'Cartão de Crédito'}</p>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Itens do Pedido</p>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                                {item.product_image ? (
                                    <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                                ) : (
                                    <ShoppingBag size={16} className="text-gray-400" />
                                )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                              <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-600">
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag size={32} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhum pedido encontrado</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Você ainda não fez nenhuma compra. Explore nossa loja e encontre produtos incríveis!
                </p>
                <a 
                  href="/loja" 
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 font-medium"
                >
                  Ir para a Loja <ChevronRight size={18} />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
