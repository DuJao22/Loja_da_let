
import db from './src/db/database';

async function check() {
  try {
    console.log('Checking clients table schema...');
    const columns = await db.sql`PRAGMA table_info(clients)`;
    console.log('Columns:', columns);
    
    console.log('Checking if email column exists...');
    const hasEmail = columns.some((col: any) => col.name === 'email');
    console.log('Has Email:', hasEmail);

    console.log('Checking if password column exists...');
    const hasPassword = columns.some((col: any) => col.name === 'password');
    console.log('Has Password:', hasPassword);

  } catch (error) {
    console.error('Error checking DB:', error);
  }
}

check();
