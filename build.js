require('dotenv').config();
const { execSync } = require('child_process');

console.log('正在使用环境变量进行构建...');

// 检查环境变量是否设置
if (!process.env.TENCENT_CLOUD_SECRET_ID) {
    console.error('错误: 未设置 TENCENT_CLOUD_SECRET_ID 环境变量');
    process.exit(1);
}

// 执行构建命令
try {
    execSync('npm run build-frontend', { stdio: 'inherit' });
    execSync('npm run build-electron', { stdio: 'inherit' });
    execSync('ee-bin encrypt', { stdio: 'inherit' });
} catch (error) {
    console.error('构建失败:', error);
    process.exit(1);
}