import { Database } from '@sqlitecloud/drivers';
import bcrypt from 'bcryptjs';

const connectionString = 'sqlitecloud://cmq6frwshz.g4.sqlite.cloud:8860/Shampoo_Let.db?apikey=Dor8OwUECYmrbcS5vWfsdGpjCpdm9ecSDJtywgvRw8k';

const db = new Database(connectionString);

// Initialize database schema
export async function initDb() {
  try {
    // Products table (formerly services)
    await db.sql`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image TEXT,
        category TEXT, -- Shampoo, Colônia, Ampola, Kit, etc.
        stock INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Clients table (unchanged)
    await db.sql`
      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT UNIQUE,
        password TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Migration: Force add columns if they don't exist (using try-catch as robust fallback)
    try {
      await db.sql`ALTER TABLE clients ADD COLUMN email TEXT`;
      console.log('Migration: Added email to clients');
    } catch (e) { /* Column exists */ }

    try {
      await db.sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_email ON clients(email)`;
    } catch (e) { /* Index exists or error */ }

    try {
      await db.sql`ALTER TABLE clients ADD COLUMN password TEXT`;
      console.log('Migration: Added password to clients');
    } catch (e) { /* Column exists */ }

    try {
      await db.sql`ALTER TABLE clients ADD COLUMN address TEXT`;
      console.log('Migration: Added address to clients');
    } catch (e) { /* Column exists */ }

    // Migration: Products table
    try {
      await db.sql`ALTER TABLE products ADD COLUMN category TEXT`;
      console.log('Migration: Added category to products');
    } catch (e) { /* Column exists */ }

    try {
      await db.sql`ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0`;
      console.log('Migration: Added stock to products');
    } catch (e) { /* Column exists */ }

    // Orders table (formerly appointments)
    await db.sql`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER,
        total REAL NOT NULL,
        status TEXT DEFAULT 'Pendente', -- Pendente, Pago, Enviado, Entregue, Cancelado
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(client_id) REFERENCES clients(id)
      )
    `;

    // Order Items table
    await db.sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        product_id INTEGER,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL, -- Price at the time of purchase
        FOREIGN KEY(order_id) REFERENCES orders(id),
        FOREIGN KEY(product_id) REFERENCES products(id)
      )
    `;

    // Users table (for admin)
    await db.sql`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `;

    // Seed initial products if empty
    const productsCountResult = await db.sql`SELECT count(*) as count FROM products`;
    const productsCount = productsCountResult[0].count;

    if (productsCount === 0) {
      const initialProducts = [
        ['Shampoo Bomba Crescimento', 'Acelera o crescimento e fortalece os fios.', 45.00, 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=800', 'Shampoo', 50],
        ['Kit Cronograma Capilar', 'Tratamento completo: Hidratação, Nutrição e Reconstrução.', 120.00, 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=80&w=800', 'Kit', 20],
        ['Ampola de Vitaminas', 'Explosão de vitaminas para cabelos fracos.', 15.00, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800', 'Ampola', 100],
        ['Colônia Capilar Floral', 'Perfume para cabelos com notas florais e brilho intenso.', 35.00, 'https://images.unsplash.com/photo-1620917670397-a333b79f88c1?auto=format&fit=crop&q=80&w=800', 'Colônia', 30],
        ['Shampoo Anticaspa', 'Limpeza profunda e controle da oleosidade.', 40.00, 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&q=80&w=800', 'Shampoo', 40],
        ['Máscara de Hidratação', 'Hidratação profunda para cabelos ressecados.', 55.00, 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800', 'Máscara', 25],
        ['Tônico Fortalecedor', 'Combate a queda e fortalece a raiz.', 28.00, 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?auto=format&fit=crop&q=80&w=800', 'Tônico', 60],
        ['Óleo Reparador de Pontas', 'Fim das pontas duplas e frizz.', 22.00, 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&q=80&w=800', 'Óleo', 45]
      ];
      
      for (const product of initialProducts) {
        await db.sql`INSERT INTO products (name, description, price, image, category, stock) VALUES (${product[0]}, ${product[1]}, ${product[2]}, ${product[3]}, ${product[4]}, ${product[5]})`;
      }
    }

    // Seed admin user if not exists
    const adminExistsResult = await db.sql`SELECT count(*) as count FROM users WHERE username = 'admin'`;
    const adminExists = adminExistsResult[0].count;

    if (adminExists === 0) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      await db.sql`INSERT INTO users (username, password) VALUES ('admin', ${hashedPassword})`;
    }

    // Keep-alive ping every 5 minutes
    console.log('Starting database keep-alive...');
    setInterval(async () => {
      try {
        await db.sql`SELECT 1`;
        // console.log('DB Ping success');
      } catch (err) {
        console.error('DB Ping failed:', err);
      }
    }, 5 * 60 * 1000);

  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

export default db;
