import React from 'react';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-serif font-bold text-pink-400 mb-4">Studio Letícia</h3>
            <p className="text-gray-400">
              Realce sua beleza com unhas perfeitas. Profissionais qualificados e ambiente acolhedor.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/" className="hover:text-pink-400 transition-colors">Início</a></li>
              <li><a href="/#services" className="hover:text-pink-400 transition-colors">Serviços</a></li>
              <li><a href="/agendar" className="hover:text-pink-400 transition-colors">Agendamento</a></li>
              <li><a href="/login" className="hover:text-pink-400 transition-colors">Área Admin</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contato</h4>
            <p className="text-gray-400 mb-2">WhatsApp: (11) 99999-9999</p>
            <p className="text-gray-400">Email: contato@agendanailspro.com</p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
          <p className="flex items-center justify-center gap-2">
            Sistema desenvolvido por João Layon <Heart size={16} className="text-pink-500 fill-current" />
          </p>
        </div>
      </div>
    </footer>
  );
}
