import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, User as UserIcon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const links = [
    { name: 'Início', path: '/' },
    { name: 'Produtos', path: '/loja' },
    { name: 'Contato', path: '/#contact' },
  ];

  return (
    <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="font-serif text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
                <ShoppingBag size={24} />
              </span>
              Studio Letícia
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-gray-600 hover:text-emerald-600 transition-colors font-medium"
              >
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                <Link to="/me" className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors">
                  Olá, {user.name || user.username}
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-emerald-600 font-medium hover:underline">Admin</Link>
                )}
                <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-gray-600 hover:text-emerald-600 font-medium flex items-center gap-2 pl-4 border-l border-gray-200">
                <UserIcon size={20} />
                Entrar
              </Link>
            )}

            <Link
              to="/loja"
              className="bg-gray-900 text-white px-6 py-2.5 rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 font-medium flex items-center gap-2"
            >
              <ShoppingBag size={18} />
              Loja Online
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            {user ? (
               <button onClick={logout} className="text-gray-500 hover:text-red-500">
                  <LogOut size={20} />
               </button>
            ) : (
              <Link to="/login" className="text-gray-600">
                <UserIcon size={24} />
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-emerald-600 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {links.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-3 text-base font-medium text-gray-600 hover:text-emerald-600 hover:bg-gray-50 rounded-xl"
                >
                  {link.name}
                </Link>
              ))}
              {user && user.role === 'admin' && (
                 <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-3 text-base font-medium text-emerald-600 hover:bg-emerald-50 rounded-xl"
                >
                  Painel Admin
                </Link>
              )}
              <Link
                to="/loja"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center mt-4 bg-gray-900 text-white px-6 py-4 rounded-xl hover:bg-gray-800 transition-colors shadow-lg font-medium flex items-center justify-center gap-2"
              >
                <ShoppingBag size={20} />
                Ir para Loja
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
