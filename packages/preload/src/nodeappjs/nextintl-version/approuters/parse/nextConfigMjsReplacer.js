import fs from 'fs';
import t, {expressionStatement} from '@babel/types';
import template from '@babel/template';
import {parseJs} from '../../handlers/babelHandler';
import {areCodeBlocksEqual} from '../../handlers/codeCheckHandler.js';
import {fileExistCheckSameCode} from '../../utils/fileHandler.js';

const nextConfigMjsWritePlugin = function() {

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
      },
      FunctionDeclaration: {
        enter(path) {
          // const componentName = path.node.id.name;
          path.traverse({
            JSXElement(innerPath) {
              innerPath;
              //TODO
            },
          });

        },
      },
      VariableDeclarator: {
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
      },
      Program: {
        enter(path) {
          const createNextIntlPluginDeclaration = template.statement.ast`import createNextIntlPlugin from 'next-intl/plugin';`;
          const withNextIntlDeclaration = template.statement.ast`const withNextIntl = createNextIntlPlugin();`;

          // 检查是否已经存在需要插入的语句
          const hasCreateNextIntlPluginDeclaration = path.node.body.some(node =>
            t.isImportDeclaration(node) &&
            node.source.value === 'next-intl/plugin' &&
            node.specifiers.some(specifier =>
              t.isImportDefaultSpecifier(specifier) &&
              specifier.local.name === 'createNextIntlPlugin',
            ),
          );

          const hasWithNextIntlDeclaration = path.node.body.some(node =>
            t.isVariableDeclaration(node) &&
            node.declarations.some(declaration =>
              t.isVariableDeclarator(declaration) &&
              declaration.id.name === 'withNextIntl' &&
              t.isCallExpression(declaration.init) &&
              declaration.init.callee.name === 'createNextIntlPlugin',
            ),
          );

          // 如果不存在，插入语句
          if (!hasCreateNextIntlPluginDeclaration) {
            path.node.body.unshift(createNextIntlPluginDeclaration);
          }
          if (!hasWithNextIntlDeclaration) {
            path.node.body.unshift(withNextIntlDeclaration);
          }
        },
      },
      ExportDefaultDeclaration(path) {
        // 检查是否是 `export default nextConfig;`
        if (t.isIdentifier(path.node.declaration, { name: 'nextConfig' })) {
          // 构建新的表达式：withNextIntl(nextConfig)
          const newExpression = t.callExpression(
            t.identifier('withNextIntl'),
            [t.identifier('nextConfig')]
          );

          // 替换原来的声明为：export default withNextIntl(nextConfig);
          path.replaceWith(
            t.exportDefaultDeclaration(newExpression)
          );
        } else {
          //FIXME 没有找到默认的nextConfig导出，此时需要决定是额外处理？还是抛出异常告诉用户导出该内容：'export default nextConfig;'

        }
      },
    },
    post(state) {
      state;
      //结束时的处理

    },
  };
};

export default function replace(source, target) {
  const output = parseJs(nextConfigMjsWritePlugin, source);
  const outputCode = output.code;

  if (fileExistCheckSameCode(source, outputCode)) {
    return;
  }

// 将新的代码写入新文件
  fs.writeFileSync(target, outputCode);
  console.log('Written to new file: ', 'next.config.mjs');
}
