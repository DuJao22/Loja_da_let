import React, { useEffect, useState } from 'react';
import { ShoppingBag, Users, Package, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChartData {
  date: string;
  revenue: number;
}

interface Stats {
  totalOrders: number;
  ordersToday: number;
  totalClients: number;
  totalProducts: number;
  totalRevenue: number;
  chartData: ChartData[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    ordersToday: 0,
    totalClients: 0,
    totalProducts: 0,
    totalRevenue: 0,
    chartData: []
  });

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Error fetching stats:', err));
  }, []);

  const cards = [
    { 
      title: 'Vendas Hoje', 
      value: stats.ordersToday, 
      icon: ShoppingBag, 
      color: 'bg-blue-500',
      shadow: 'shadow-blue-500/30'
    },
    { 
      title: 'Receita Total', 
      value: `R$ ${stats.totalRevenue.toFixed(2)}`, 
      icon: DollarSign, 
      color: 'bg-emerald-500',
      shadow: 'shadow-emerald-500/30'
    },
    { 
      title: 'Clientes', 
      value: stats.totalClients, 
      icon: Users, 
      color: 'bg-purple-500',
      shadow: 'shadow-purple-500/30'
    },
    { 
      title: 'Produtos', 
      value: stats.totalProducts, 
      icon: Package, 
      color: 'bg-orange-500',
      shadow: 'shadow-orange-500/30'
    },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <Calendar size={16} />
            Visão geral do desempenho da loja
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-sm font-medium text-gray-600">
          Última atualização: {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow group"
            >
              <div className={`p-4 rounded-xl ${card.color} text-white shadow-lg ${card.shadow} group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">{card.title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="text-emerald-500" />
                Relatório de Faturamento
              </h2>
              <p className="text-sm text-gray-500 mt-1">Receita dos últimos 7 dias</p>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickFormatter={(str) => format(parseISO(str), 'dd/MM')}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickFormatter={(number) => `R$${number}`}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                  labelFormatter={(label) => format(parseISO(label), "dd 'de' MMMM", { locale: ptBR })}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions / Summary */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Resumo Rápido</h2>
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-sm text-blue-600 font-medium mb-1">Ticket Médio</p>
              <p className="text-2xl font-bold text-blue-900">
                R$ {stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
              <p className="text-sm text-purple-600 font-medium mb-1">Novos Clientes (Hoje)</p>
              <p className="text-2xl font-bold text-purple-900">
                {/* This would require backend support, placeholder for now */}
                -
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-4">Ações Rápidas</p>
              <div className="grid grid-cols-2 gap-3">
                <a href="/admin/produtos" className="flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-xs font-medium text-gray-700">
                  <Package className="mb-2 text-gray-400" size={20} />
                  Add Produto
                </a>
                <a href="/admin/pedidos" className="flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-xs font-medium text-gray-700">
                  <ShoppingBag className="mb-2 text-gray-400" size={20} />
                  Ver Pedidos
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
