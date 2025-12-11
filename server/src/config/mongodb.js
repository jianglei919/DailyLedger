/**
 * MongoDB 数据库连接配置
 * 使用 Mongoose ODM 连接 MongoDB
 * 支持连接状态管理和错误处理
 */

import mongoose from 'mongoose';

// 连接状态标志
let isConnected = false;

/**
 * 连接 MongoDB 数据库
 * 支持连接复用，避免重复连接
 */
export const connectMongoDB = async () => {
  // 如果已连接，直接返回
  if (isConnected) {
    console.log('✅ MongoDB already connected');
    return;
  }

  try {
    // 从环境变量读取 MongoDB URI，否则使用默认本地地址
    const mongoUri =
      process.env.MONGODB_URI || process.env.MONGODB_URL;
    
    // 连接 MongoDB
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,  // 服务器选择超时：5秒
      socketTimeoutMS: 45000,      // Socket 超时：45秒
    });

    isConnected = true;
    console.log('✅ MongoDB connected successfully');

    // 监听连接错误事件
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
      isConnected = false;
    });

    // 监听连接断开事件
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
      isConnected = false;
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;  // 抛出错误，让调用者处理
  }
};

export const disconnectMongoDB = async () => {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('✅ MongoDB disconnected successfully');
  } catch (error) {
    console.error('❌ MongoDB disconnection failed:', error);
    throw error;
  }
};

export default mongoose;
