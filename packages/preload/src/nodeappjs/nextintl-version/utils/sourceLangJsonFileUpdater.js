import fs from 'fs';
import lodash from 'lodash';
import {isBlank} from './ObjectUtil';

/***
 * 创建阻塞队列写入JSON文件
 * @param filePath
 * @param newContent
 */
export function writeLangJsonFile(filePath, newContent) {
  let oldContent = {};
  if (fs.existsSync(filePath)) {
    oldContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  if (isBlank(newContent)) {
    return;
  }
  newContent = typeof newContent === 'string' ? JSON.parse(newContent) : newContent;
  const mergedContent = lodash.merge({}, oldContent, newContent);
  fs.writeFileSync(filePath, JSON.stringify(mergedContent, null, 2));
}
