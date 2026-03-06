import React, { useEffect, useState } from 'react';
import { ShoppingBag, Users, Package, TrendingUp, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';

interface Stats {
  totalOrders: number;
  ordersToday: number;
  totalClients: number;
  totalProducts: number;
  totalRevenue: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    ordersToday: 0,
    totalClients: 0,
    totalProducts: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data));
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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral da sua loja</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className={`p-4 rounded-xl ${card.color} text-white shadow-lg ${card.shadow}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{card.title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-12 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Bem-vindo ao Painel Administrativo</h2>
        <p className="text-gray-600">
          Utilize o menu lateral para gerenciar seus pedidos, produtos e clientes.
        </p>
      </div>
    </div>
  );
}
