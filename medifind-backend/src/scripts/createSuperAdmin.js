import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Admin from '../models/hospitalAdmin.js';
import bcrypt from 'bcrypt';

// Connect to the database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'ntwarifrank100@gmail.com' });
    
    if (existingAdmin) {
      console.log('Super admin account already exists');
      mongoose.disconnect();
      return;
    }
    
    // Create the super admin
    const passwordHash = await bcrypt.hash('ntwarifrank', 12);
    
    const superAdmin = new Admin({
      hospitalName: 'MediFind Super Admin',
      adminName: 'Super Admin',
      email: 'ntwarifrank100@gmail.com',
      password: passwordHash,
      role: 'super_admin',
      phone: '123456789',
      address: 'MediFind Headquarters'
    });
    
    await superAdmin.save();
    console.log('Super admin account created successfully');
    
  } catch (error) {
    console.error('Error creating super admin:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
})
.catch(err => {
  console.error('Database connection error:', err);
  process.exit(1);
});
