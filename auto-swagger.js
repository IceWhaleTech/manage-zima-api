const fs = require('fs');
const path = require('path');

// 遍历目录并获取所有路由文件
function getRouteFiles(dir) {
  const files = fs.readdirSync(dir);
  const routeFiles = files.filter(file => file.endsWith('.js'));
  return routeFiles.map(file => path.join(dir, file));
}

// 为指定路由文件添加 Swagger 注释
function addSwaggerComments(filePath) {
  const routeContent = fs.readFileSync(filePath, 'utf8');
  const lines = routeContent.split('\n');

  // 检查是否已经存在 Swagger 注释
  const hasSwaggerComments = lines.some(line => line.trim().startsWith('* @swagger'));

  // 如果不存在 Swagger 注释，则添加注释
  if (!hasSwaggerComments) {
    const swaggerComments = `
/**
 * @swagger
 * /example:
 *   get:
 *     description: Example route
 *     responses:
 *       200:
 *         description: Success
 */
`;

    // 插入 Swagger 注释到文件开头
    lines.unshift(swaggerComments);

    // 更新路由文件
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log(`Swagger comments added to ${filePath}`);
  } else {
    console.log(`Swagger comments already exist in ${filePath}`);
  }
}

// 获取所有路由文件并为每个文件添加 Swagger 注释
function autoAddSwaggerComments(routeDir) {
  const routeFiles = getRouteFiles(routeDir);
  routeFiles.forEach(addSwaggerComments);
}

// 指定路由文件目录
const routeDir = path.join(__dirname, 'routes');

// 自动添加 Swagger 注释
autoAddSwaggerComments(routeDir);
