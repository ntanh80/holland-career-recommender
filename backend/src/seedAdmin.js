require('dotenv').config();
const adminModel = require('./models/adminModel');

async function seed() {
  try {
    const id = await adminModel.create({
      username: 'admin',
      email: 'admin@holland.vn',
      password: 'admin123',
      role: 'super_admin',
    });
    console.log(`Admin account created (id: ${id})`);
    console.log('Username: admin');
    console.log('Password: admin123');
    process.exit(0);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.log('Admin account already exists, skipping.');
      process.exit(0);
    }
    console.error('Failed to seed admin:', err.message);
    process.exit(1);
  }
}

seed();
