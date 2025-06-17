import fs from 'fs';
import t from '@babel/types';
import template from '@babel/template';
import {parseJs} from '../../handlers/babelHandler';
import {areCodeBlocksEqual} from '../../handlers/codeCheckHandler.js';
import {fileExistCheckSameCode} from '../../utils/fileHandler.js';

const nextConfigjsWritePlugin = function() {

  return {
    visitor: {
      ClassDeclaration: {
        enter(path) {
          // const componentName = path.node.id.name;
          path.traverse({
            JSXElement(innerPath) {
              innerPath;
              //TODO
            },
          });
        },
      }, FunctionDeclaration: {
        enter(path) {
          // const componentName = path.node.id.name;
          path.traverse({
            JSXElement(innerPath) {
              innerPath;
              //TODO
            },
          });

        },
      }, VariableDeclarator: {
        enter(path) {
          if (path.node.init && path.node.init.type === 'ArrowFunctionExpression') {
            // const componentName = path.node.id.name;
            path.traverse({
              JSXElement(innerPath) {
                innerPath;
                //TODO
              },
            });
          }
        },
      }, Program: {
        enter(path) {
          const createNextIntlPluginDeclaration = template.statement.ast`const createNextIntlPlugin = require('next-intl/plugin');`;
          const withNextIntlDeclaration = template.statement.ast`const withNextIntl = createNextIntlPlugin();`;

          // 检查是否已经存在需要插入的语句
          const hasCreateNextIntlPluginDeclaration = path.node.body.some(node => t.isVariableDeclaration(node) && node.declarations.some(declaration => t.isVariableDeclarator(declaration) && declaration.id.name === 'createNextIntlPlugin' && t.isCallExpression(declaration.init) && declaration.init.callee.name === 'require' && declaration.init.arguments.some(arg => arg.value === 'next-intl/plugin')));

          const hasWithNextIntlDeclaration = path.node.body.some(node => t.isVariableDeclaration(node) && node.declarations.some(declaration => t.isVariableDeclarator(declaration) && declaration.id.name === 'withNextIntl' && t.isCallExpression(declaration.init) && declaration.init.callee.name === 'createNextIntlPlugin'));

          // 如果不存在，插入语句，注意顺序
          if (!hasWithNextIntlDeclaration) {
            path.node.body.unshift(withNextIntlDeclaration);
          }
          if (!hasCreateNextIntlPluginDeclaration) {
            path.node.body.unshift(createNextIntlPluginDeclaration);
          }
        },
      }, ExportDefaultDeclaration(path) {
        path;
        //TODO
      },
      AssignmentExpression(path) {
        // 检查是否是 `module.exports = nextConfig;`
        if (
          t.isMemberExpression(path.node.left) &&
          t.isIdentifier(path.node.left.object, {name: 'module'}) &&
          t.isIdentifier(path.node.left.property, {name: 'exports'}) &&
          t.isIdentifier(path.node.right, {name: 'nextConfig'})
        ) {
          // 构建新的表达式：withNextIntl(nextConfig)
          const newExpression = t.callExpression(
            t.identifier('withNextIntl'),
            [t.identifier('nextConfig')],
          );

          // 替换原来的表达式为：module.exports = withNextIntl(nextConfig);
          path.replaceWith(
            t.assignmentExpression(
              '=',
              path.node.left,
              newExpression,
            ),
          );
        }
      },
    }, post(state) {
      state;
      //结束时的处理

    },
  };
};

export default function replace(source, target) {
  const output = parseJs(nextConfigjsWritePlugin, source);
  const outputCode = output.code;

  if (fileExistCheckSameCode(source, outputCode)) {
    return;
  }

  // 将新的代码写入新文件
  fs.writeFileSync(target, outputCode);
  console.log('Written to new file: ', 'next.config.js');
}

