import fs from 'fs';
import path from 'path';
import {areCodeBlocksEqual} from '../handlers/codeCheckHandler.js';

/**
 * 依次创建目录
 * @param dirPath
 */
export function createDirectories(dirPath) {
  // 使用fs.existsSync检查目录是否存在
  if (!fs.existsSync(dirPath)) {
    // 使用fs.mkdirSync创建目录，{ recursive: true }选项会创建所有需要的父目录
    fs.mkdirSync(dirPath, {recursive: true});
    console.info('dirs create finish:', dirPath);
  }
}

export function fileExistCheckSameCode(file_path, target_code) {
  //在文件存在的情况下，检查处理后的代码和原来代码是否相同，相同则直接返回，这可以避免再度格式化代码
  const file_exist = fs.existsSync(file_path);
  if (file_exist) {
    const sourceCode = fs.readFileSync(file_path, 'utf8');
    if (areCodeBlocksEqual(sourceCode, target_code)) {
      console.debug(`No code changes. Skip modify file:${file_path}.`);
      return true;
    }
  }
  return false;
}

// function copyDirectory(sourceDir, targetDir, excludeDirs = []) {
//   // 读取源目录中的所有文件和子目录
//   const items = fs.readdirSync(sourceDir);
//
//   // 创建目标目录
//   if (!fs.existsSync(targetDir)) {
//     fs.mkdirSync(targetDir);
//   }
//
//   items.forEach(item => {
//     const sourcePath = path.join(sourceDir, item);
//     const targetPath = path.join(targetDir, item);
//
//     // 检查是否是排除的目录
//     if (!excludeDirs.includes(item) && sourcePath !== targetDir) {
//       const stat = fs.statSync(sourcePath);
//
//       if (stat.isDirectory()) {
//         // 如果是目录，递归复制
//         copyDirectory(sourcePath, targetPath, excludeDirs);
//       } else {
//         // 如果是文件，直接复制
//         console.log(`Copying file: ${sourcePath} to ${targetPath}`); // 添加这行来检查正在复制的文件
//         fs.copyFileSync(sourcePath, targetPath);
//       }
//     } else {
//       console.log(`Skipping file: ${sourcePath}`); // 添加这行来检查被跳过的文件
//     }
//   });
// }
