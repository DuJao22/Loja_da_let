import express from 'express';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import compression from 'compression';
import db, { initDb } from './src/db/database.ts';

const SECRET_KEY = process.env.JWT_SECRET || 'secret-key-shampoo-leticia';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize DB
  await initDb();

  app.use(compression());
  app.use(express.json());
  app.use(cookieParser());

  // --- API Routes ---

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // Login (Admin)
  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const users = await db.sql`SELECT * FROM users WHERE username = ${username}`;
      const user = users[0] as any;

      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const token = jwt.sign({ username: user.username, id: user.id, role: 'admin' }, SECRET_KEY, { expiresIn: '24h' });
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.json({ success: true, role: 'admin' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro interno' });
    }
  });

  // Client Register
  app.post('/api/client/register', async (req, res) => {
    const { name, email, phone, password, address } = req.body;
    try {
      // Check if email already exists
      const existing = await db.sql`SELECT * FROM clients WHERE email = ${email}`;
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      
      // Use standard INSERT and separate SELECT for ID to be safe across versions
      await db.sql`INSERT INTO clients (name, email, phone, password, address) VALUES (${name}, ${email}, ${phone}, ${hashedPassword}, ${address || ''})`;
      
      // Get the ID of the newly inserted client
      const result = await db.sql`SELECT last_insert_rowid() as id`;
      const newId = result[0].id;
      
      const token = jwt.sign({ email, id: newId, role: 'client', name }, SECRET_KEY, { expiresIn: '24h' });
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.json({ success: true, role: 'client' });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Erro ao criar conta: ' + (error.message || 'Erro desconhecido') });
    }
  });

  // Client Login
  app.post('/api/client/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const clients = await db.sql`SELECT * FROM clients WHERE email = ${email}`;
      const client = clients[0] as any;

      if (!client || !client.password || !bcrypt.compareSync(password, client.password)) {
        return res.status(401).json({ error: 'Email ou senha incorretos' });
      }

      const token = jwt.sign({ email: client.email, id: client.id, role: 'client', name: client.name }, SECRET_KEY, { expiresIn: '24h' });
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.json({ success: true, role: 'client' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro interno' });
    }
  });

  // Logout
  app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  // Check Auth Status
  app.get('/api/me', authenticateToken, (req: any, res) => {
    res.json({ user: req.user });
  });

  // Products (Public)
  app.get('/api/products', async (req, res) => {
    try {
      const products = await db.sql`SELECT * FROM products`;
      res.json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
  });

  // Products (Admin)
  app.post('/api/products', authenticateToken, async (req, res) => {
    const { name, description, price, image, category, stock } = req.body;
    try {
      const result = await db.sql`INSERT INTO products (name, description, price, image, category, stock) VALUES (${name}, ${description}, ${price}, ${image}, ${category}, ${stock}) RETURNING id`;
      res.json({ id: result[0].id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao criar produto' });
    }
  });

  app.put('/api/products/:id', authenticateToken, async (req, res) => {
    const { name, description, price, image, category, stock } = req.body;
    const { id } = req.params;
    try {
      await db.sql`UPDATE products SET name = ${name}, description = ${description}, price = ${price}, image = ${image}, category = ${category}, stock = ${stock} WHERE id = ${id}`;
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
  });

  app.delete('/api/products/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
      await db.sql`DELETE FROM products WHERE id = ${id}`;
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao deletar produto' });
    }
  });

  // Orders (Create)
  app.post('/api/orders', authenticateToken, async (req: any, res) => {
    const { items, total } = req.body; // items: [{ productId, quantity, price }]
    const client_id = req.user.id;

    try {
      // Start transaction (simulated with sequence of steps, SQLite Cloud might support BEGIN TRANSACTION via SQL)
      
      // 1. Create Order
      await db.sql`INSERT INTO orders (client_id, total, status) VALUES (${client_id}, ${total}, 'Pendente')`;
      const orderResult = await db.sql`SELECT last_insert_rowid() as id`;
      const orderId = orderResult[0].id;

      // 2. Insert Items
      for (const item of items) {
        await db.sql`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (${orderId}, ${item.productId}, ${item.quantity}, ${item.price})`;
        
        // 3. Update Stock (Optional, but good practice)
        await db.sql`UPDATE products SET stock = stock - ${item.quantity} WHERE id = ${item.productId}`;
      }

      res.json({ id: orderId, success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao criar pedido' });
    }
  });

  // Client Orders
  app.get('/api/client/orders', authenticateToken, async (req: any, res) => {
    try {
      const orders = await db.sql`
        SELECT * FROM orders WHERE client_id = ${req.user.id} ORDER BY created_at DESC
      `;
      
      // Fetch items for each order (N+1 problem, but okay for small scale)
      const ordersWithItems = await Promise.all(orders.map(async (order: any) => {
        const items = await db.sql`
          SELECT oi.*, p.name as product_name, p.image as product_image 
          FROM order_items oi 
          JOIN products p ON oi.product_id = p.id 
          WHERE oi.order_id = ${order.id}
        `;
        return { ...order, items };
      }));

      res.json(ordersWithItems);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar pedidos' });
    }
  });

  // Admin Orders
  app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
      const orders = await db.sql`
        SELECT o.*, c.name as client_name, c.email as client_email
        FROM orders o
        JOIN clients c ON o.client_id = c.id
        ORDER BY o.created_at DESC
      `;
      
      const ordersWithItems = await Promise.all(orders.map(async (order: any) => {
        const items = await db.sql`
          SELECT oi.*, p.name as product_name 
          FROM order_items oi 
          JOIN products p ON oi.product_id = p.id 
          WHERE oi.order_id = ${order.id}
        `;
        return { ...order, items };
      }));

      res.json(ordersWithItems);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao listar pedidos' });
    }
  });

  app.put('/api/orders/:id', authenticateToken, async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    try {
      await db.sql`UPDATE orders SET status = ${status} WHERE id = ${id}`;
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao atualizar pedido' });
    }
  });

  // Dashboard Stats (Admin)
  app.get('/api/stats', authenticateToken, async (req, res) => {
    try {
      const totalOrdersResult = await db.sql`SELECT count(*) as count FROM orders`;
      const totalOrders = totalOrdersResult[0].count;
      
      const today = new Date().toISOString().split('T')[0];
      const ordersTodayResult = await db.sql`SELECT count(*) as count FROM orders WHERE date(created_at) = date('now')`; // SQLite specific date function
      const ordersToday = ordersTodayResult[0].count;
      
      const totalClientsResult = await db.sql`SELECT count(*) as count FROM clients`;
      const totalClients = totalClientsResult[0].count;

      const totalProductsResult = await db.sql`SELECT count(*) as count FROM products`;
      const totalProducts = totalProductsResult[0].count;

      // Revenue
      const revenueResult = await db.sql`SELECT sum(total) as total FROM orders WHERE status != 'Cancelado'`;
      const totalRevenue = revenueResult[0].total || 0;

      res.json({
        totalOrders,
        ordersToday,
        totalClients,
        totalProducts,
        totalRevenue
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  });

  // Clients (Admin)
  app.get('/api/clients', authenticateToken, async (req, res) => {
    try {
      const clients = await db.sql`
        SELECT c.*, count(o.id) as order_count, max(o.created_at) as last_order
        FROM clients c
        LEFT JOIN orders o ON c.id = o.client_id
        GROUP BY c.id
        ORDER BY c.name ASC
      `;
      res.json(clients);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao listar clientes' });
    }
  });


  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static('dist'));
    // Handle SPA fallback
    app.get('*', (req, res) => {
      res.sendFile('index.html', { root: 'dist' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
