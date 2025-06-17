import log from 'electron-log/main';
import * as path from 'path';

log.transports.console.level = false; // 控制台关闭输出（只输出到文件）
log.transports.file.level = 'silly';
log.transports.file.maxSize = 1002430; // 文件最大不超过 1M
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}';

function today() {
  const date = new Date();
  const dateStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
  return dateStr;
}

log.transports.file.resolvePathFn = (variables) => {
  return path.join(variables.libraryDefaultDir, today() + '.log');
};

//替换console.log
Object.assign(console, log.functions);

export default log;
