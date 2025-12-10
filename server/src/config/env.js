/**
 * 环境变量加载模块
 * 必须在所有其他模块之前加载
 * 支持根据 NODE_ENV 加载不同的环境配置文件
 * 优先级：.env.<NODE_ENV> > .env > 默认配置
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES6 模块中获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
// 优先使用 .env.<NODE_ENV> 文件，如果不存在则回退到 .env
const envName = (process.env.NODE_ENV || 'development').trim();
const envPathCandidate = path.resolve(__dirname, `../../.env.${envName}`);
const envPathFallback = path.resolve(__dirname, '../../.env');

if (fs.existsSync(envPathCandidate)) {
  // 加载环境特定的配置文件（例：.env.production）
  dotenv.config({ path: envPathCandidate });
  console.log(`📋 Loaded env from: .env.${envName}`);
} else if (fs.existsSync(envPathFallback)) {
  // 加载默认 .env 文件
  dotenv.config({ path: envPathFallback });
  console.log(`📋 Loaded env from: .env`);
} else {
  // 使用 dotenv 默认加载机制
  dotenv.config();
  console.log(`📋 Loaded env from default`);
}

// 导出 process.env 供其他模块使用
export default process.env;
