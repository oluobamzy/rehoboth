// Test PostgreSQL connection
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Exists (starting with ' + process.env.DATABASE_URL.substring(0, 20) + '...)' : 'Missing');

async function testConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Attempting to connect to database...');
    await client.connect();
    console.log('Successfully connected to database!');
    
    const result = await client.query('SELECT current_database(), current_user');
    console.log('Connected to database:', result.rows[0]);
  } catch (error) {
    console.error('Error connecting to database:', error.message);
    console.error(error);
  } finally {
    try {
      await client.end();
      console.log('Database connection closed.');
    } catch (err) {
      console.error('Error closing connection:', err);
    }
  }
}

testConnection();
