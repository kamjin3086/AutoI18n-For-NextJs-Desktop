import path from 'path';
import fs from 'fs';
import {store} from './electronApis';

function today() {
  const date = new Date();
  const dateStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
  return dateStr;
}

export function queryTodayLogTextForLines(line = 100) {
  try {
    // 拼接日志文件路径
    const logFolderPath = store.get('app_logs_dir') as string;
    const logFilePath = path.join(logFolderPath, `${today()}.log`);

    // 读取日志文件
    const logFile = fs.readFileSync(logFilePath, 'utf-8');

    // 将日志文件按行分割
    const logLines = logFile.split('\n');

    // 取最后的 line 条日志
    const lastLogLines = logLines.slice(-line);

    // 返回日志文本
    return lastLogLines.join('\n');
  } catch (error) {
    console.error('Error reading log file:', error);
    return '';
  }
}
