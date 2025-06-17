import fs from 'fs';
import babel from '@babel/core';
import pluginSyntaxJsx from '@babel/plugin-syntax-jsx';
import pluginSyntaxTypeScript from '@babel/plugin-syntax-typescript';

export function parseJsx(plugin, filepath) {
  const jsxContent = fs.readFileSync(filepath, 'utf8');
  const options = {
    presets: [],
    plugins: [pluginSyntaxJsx, plugin], // Use the imported plugin variable
  };
  return babel.transform(jsxContent, options);
}

export function parseTsx(plugin, filepath) {
  const tsxContent = fs.readFileSync(filepath, 'utf8');
  const options = {
    presets: [],
    plugins: [
      [pluginSyntaxTypeScript, {isTSX: true, allExtensions: true}],
      plugin,  // This is correctly used here
    ],
  };
  return babel.transform(tsxContent, options);
}

export function parseTs(plugin, filepath) {
    // 读取JS文件
    const tsContent = fs.readFileSync(filepath, 'utf8');

    // 解析选项
    const options = {
        // presets: [],//使用预设，当前只是修改源码，不需要使用预设
        plugins: [pluginSyntaxTypeScript, plugin], // 直接使用插件
    };

    // 使用Babel解析
    return babel.transform(tsContent, options);
}

export function parseJs(plugin, filepath) {
  // 读取JS文件
  const jsContent = fs.readFileSync(filepath, 'utf8');

  // 解析选项
  const options = {
    // presets: [],//使用预设，当前只是修改源码，不需要使用预设
    plugins: [plugin], // 直接使用插件
  };

  // 使用Babel解析
  return babel.transform(jsContent, options);
}

