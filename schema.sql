-- Tabela de Serviços
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  image TEXT,
  duration INTEGER DEFAULT 30
);

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER,
  service_id INTEGER,
  date TEXT NOT NULL, -- YYYY-MM-DD
  time TEXT NOT NULL, -- HH:MM
  observation TEXT,
  status TEXT DEFAULT 'Agendado', -- Agendado, Confirmado, Concluído, Cancelado
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(client_id) REFERENCES clients(id),
  FOREIGN KEY(service_id) REFERENCES services(id)
);

-- Tabela de Usuários (Admin)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

-- Dados Iniciais de Serviços
INSERT INTO services (name, description, price, image) VALUES 
('Alongamento de unhas', 'Técnica avançada para alongar suas unhas com naturalidade.', 150.00, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800'),
('Unha de gel', 'Aplicação de gel sobre a unha natural para maior resistência e brilho.', 120.00, 'https://images.unsplash.com/photo-1632922267756-9b71242b1592?auto=format&fit=crop&q=80&w=800'),
('Manutenção de gel', 'Manutenção periódica para garantir a durabilidade do gel.', 80.00, 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800'),
('Banho de gel', 'Camada protetora de gel sobre a unha natural sem alongamento.', 90.00, 'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&q=80&w=800'),
('Esmaltação em gel', 'Esmalte de longa duração com secagem em cabine UV.', 60.00, 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&q=80&w=800'),
('Spa para mãos', 'Hidratação profunda e massagem relaxante para as mãos.', 50.00, 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=800'),
('Pedicure', 'Cuidado completo para os pés, incluindo esmaltação.', 45.00, 'https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?auto=format&fit=crop&q=80&w=800'),
('Manicure tradicional', 'Cutilagem e esmaltação tradicional.', 35.00, 'https://images.unsplash.com/photo-1599693359672-8ea06c380981?auto=format&fit=crop&q=80&w=800');

-- Usuário Admin Inicial (Senha: admin123)
-- O hash abaixo é gerado pelo bcrypt para a senha 'admin123'
INSERT INTO users (username, password) VALUES 
('admin', '$2a$10$X7V.j5.J.j5.J.j5.J.j5.J.j5.J.j5.J.j5.J.j5.J.j5.J.j5.J'); 
-- Nota: O hash real deve ser gerado pelo backend, este é apenas um exemplo placeholder.
-- Para garantir o acesso, o sistema recria o admin se não existir ao iniciar.
