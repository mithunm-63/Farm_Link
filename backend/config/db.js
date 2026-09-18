/**
 * MongoDB Connection Config
 * Connects to MongoDB using Mongoose with retry logic
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/farmlink';

  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
  };

  let retries = 5;

  while (retries > 0) {
    try {
      const conn = await mongoose.connect(MONGO_URI, options);
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);

      // Connection event listeners
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
      });

      return conn;
    } catch (error) {
      retries -= 1;
      console.error(`❌ MongoDB connection failed. Retries left: ${retries}`);
      console.error('Error:', error.message);

      if (retries === 0) {
        console.error('🔴 Max retries reached. Exiting...');
        process.exit(1);
      }

      // Wait 5 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

module.exports = connectDB;
