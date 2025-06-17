import template from '@babel/template';
import {toValidJsonField} from '../../utils/jsonHandler';
import {associateBy, groupBy} from '../../utils/listHandler';
import {parseJsx, parseTsx} from '../../handlers/babelHandler';
import t from '@babel/types';
import fs from 'fs';

// function split() {
//     console.log("=========================================================================");
// }

function deal(jsxElements, sourceJsonFilePath) {
  let allElements = [];
  for (const key in jsxElements) {
    const item = jsxElements[key];
    if (item) {
      allElements.push(item);
    }
  }
  const groupedByComponentNameJsxElements = groupBy(allElements, (item) => item.componentName);

  //Component Group Content Json
  let groupedByNameOnlyContent = new Map();
  for (const key in groupedByComponentNameJsxElements) {
    const values = groupedByComponentNameJsxElements[key].map(attr => {
      if (attr.content) {
        const contentKey = `${attr.tagName}_${attr.nodeloc}_${attr.shortKeyByContent}`;
        return {[contentKey]: attr.content};
      } else {
        return void 0;
      }
    }).filter(Boolean); //移除空值
    //合并对象处理
    const merged = values.reduce((acc, currentObj) => {
      return {...acc, ...currentObj};
    }, {});

    // 检查merged是否为空对象
    if (Object.keys(merged).length > 0) {
      groupedByNameOnlyContent.set(key, merged);
    }
  }

  //去掉数组值为空的元素
  groupedByNameOnlyContent = new Map(Array.from(groupedByNameOnlyContent).filter(([_, value]) => value && value.length !== 0));

  const newJsonContent = Object.fromEntries(groupedByNameOnlyContent);

  // 写入JSON文件
  try {
    writeLangJsonFile(sourceJsonFilePath, newJsonContent);
    console.info('JSON file written finish.');
    console.debug(`JSON file written to new file:${sourceJsonFilePath}.`);
  } catch (err) {
    console.error('Error writing JSON file:', err.stack);
  }

  if (groupedByComponentNameJsxElements.length !== 0) {
    const result = [];
    for (const key in groupedByComponentNameJsxElements) {
      result.push(...groupedByComponentNameJsxElements[key]);
    }
    const keys = [...groupedByNameOnlyContent.keys()];
    return [result, keys];
  } else {
    throw new Error('Result length eq 0!');
  }
}

function modifyAndWriteNewFileByJsx(newFilePath, sourceCode, pursuantJsxElements, needChangeComponents, isEnableStaticRendering, useClient) {
  //解析
  const output = parseJsx(jsxWritePlugin(pursuantJsxElements, false, needChangeComponents, isEnableStaticRendering, useClient), newFilePath);
  // const output = parse(jsxModifyTestPlugin, newFilePath)

  //判断处理完的代码和源代码语法树是否相同，相同则不需要重写（避免不必要的消耗和避免格式化问题）
  const outputCode = output.code;
  if (areCodeBlocksEqual(sourceCode, outputCode)) {
    console.debug(`No code changes. Skip modify file:${newFilePath}.`);
    return;
  }

  // 将新的JSX代码写入新文件
  fs.writeFileSync(newFilePath, outputCode);
  console.debug(`Modified JSX written to new file:${newFilePath}. Replace finished.`);
}

function modifyAndWriteNewFileByTsx(newFilePath, sourceCode, pursuantJsxElements, needChangeComponents, isEnableStaticRendering, useClient) {
  //解析
  const output = parseTsx(jsxWritePlugin(pursuantJsxElements, true, needChangeComponents, isEnableStaticRendering, useClient), newFilePath);
  // const output = parse(jsxModifyTestPlugin, newFilePath)

  //判断处理完的代码和源代码语法树是否相同，相同则不需要重写（避免不必要的消耗和避免格式化问题）
  const outputCode = output.code;
  if (areCodeBlocksEqual(sourceCode, outputCode)) {
    console.debug(`No code changes. Skip modify file:${newFilePath}.`);
    return;
  }

  // 将新的JSX代码写入新文件
  fs.writeFileSync(newFilePath, outputCode);
  console.debug(`Modified JSX written to new file:${newFilePath}. Replace finished.`);
}

/**
 *
 * @param pursuantJsxElements
 * @param needChangeComponents
 * @param isEnableStaticRendering
 * @param isTsx
 * @param useClient 如果为ture，则不能使用unstable_setRequestLocale，参考：https://next-intl-docs.vercel.app/docs/getting-started/app-router
 * @returns {{post(*), visitor: {FunctionDeclaration: {enter(*): void}, ClassDeclaration: {enter(*): void}, Program: {enter(*): void}, VariableDeclarator: {enter(*): void}}}}
 */
const jsxWritePlugin = function(pursuantJsxElements, isTsx, needChangeComponents, isEnableStaticRendering, useClient) {

  const needDefMethodComponents = Array.from(new Set(needChangeComponents));
  console.log(needDefMethodComponents);

  const pursuantJsxElementsByKey = associateBy(pursuantJsxElements, (item) => item.key);

  // function containsTranslationExpression(path) {
  //   let found = false;
  //
  //   path.traverse({
  //     JSXExpressionContainer(innerPath) {
  //       const expression = innerPath.node.expression;
  //       if (t.isCallExpression(expression) && t.isIdentifier(expression.callee, {name: 't'}) && expression.arguments.length === 1 && t.isStringLiteral(expression.arguments[0])) {
  //         found = true;
  //         innerPath.stop(); // 停止进一步遍历
  //       }
  //     },
  //   });
  //
  //   return found;
  // }

  function modifyJsxElement(path, _) {
    const {node} = path;

    // 查找特定的JSX元素并修改它
    const openingElement = node.openingElement;
    const tagName = openingElement.name.name;
    const content = node.children.find(child => child.type === 'JSXText')?.value.trim();
    const nodeloc = `${node.start}-${node.end}`;
    const shortKeyByContent = toValidJsonField(content);
    const tagUniqueKey = `${tagName}_${nodeloc}_${shortKeyByContent}`;

    // console.log(pursuantJsxElementsByKey)
    let element = pursuantJsxElementsByKey[tagUniqueKey];

    if (element != null) {
      //是文本，修改jsxText
      const jsxText = node.children.find(child => child.type === 'JSXText');
      if (jsxText) {
        //替换为next-intl需要引用的标识
        jsxText.value = `{t('${element['key']}')}`;
        return true;
      }
    }
    return false;
  }

  function checkOrAddFuncBodyDecl(path, componentName) {
    // 创建next-intl需要的声明
    const unstable_setRequestLocaleDeclaration = template.statement.ast`unstable_setRequestLocale(locale);`;
    const useTranslationsDeclaration = template.statement.ast`const t = useTranslations('${componentName}');`;

    let modified = false;
    path.traverse({
      JSXElement(innerPath) {
        const result = modifyJsxElement(innerPath, componentName);
        if (result) {
          modified = true;
        }
      }, JSXExpressionContainer(innerPath) {
        //有t函数的调用，表示已经处理过了
        if (t.isCallExpression(innerPath.node.expression) && t.isIdentifier(innerPath.node.expression.callee, {name: 't'})) {
          modified = true;
        }
      },
    });

    let haveTranslated = hasDeclarationInFunctionBody(path, useTranslationsDeclaration) || hasDeclarationInFunctionBody(path, unstable_setRequestLocaleDeclaration);

    //如果是修改过了， 或者检查到有翻译过的标记的，则认为需要处理
    if (modified || haveTranslated) {
      if (isEnableStaticRendering && !useClient) {
        addArgToFunctionDeclaration(path, isTsx);
      }

      // 将新的节点插入到函数体的开始位置
      let declarations = [useTranslationsDeclaration];
      if (isEnableStaticRendering && !useClient) {
        declarations.push(unstable_setRequestLocaleDeclaration);
      }
      insertDeclarationsToFunctionBody(path, declarations);
    }
  }

  function insertImportDeclaration(path, declaration, source, specifierName) {
    const hasImport = path.node.body.some(node => node.type === 'ImportDeclaration' && node.source.value === source && node.specifiers.some(specifier => specifier.imported.name === specifierName));

    if (!hasImport) {
      path.node.body.unshift(declaration);
    }
  }

  return {
    visitor: {
      ClassDeclaration: {
        enter(path) {
          const componentName = path.node.id.name;
          path.traverse({
            JSXElement(innerPath) {
              modifyJsxElement(innerPath, componentName);
            },
          });
        },
      }, FunctionDeclaration: {
        enter(path) {
          const componentName = path.node.id.name;
          checkOrAddFuncBodyDecl(path, componentName);
        },
      }, VariableDeclarator: {
        enter(path) {
          if (t.isArrowFunctionExpression(path.node.init) || t.isFunctionExpression(path.node.init)) {
            const functionPath = path.get('init');
            const componentName = path.node.id.name;
            checkOrAddFuncBodyDecl(functionPath, componentName);
          }
        },
      }, Program: {
        enter(path) {
          const useTranslationsImport = template.statement.ast`import { useTranslations } from 'next-intl';`;
          const unstable_setRequestLocaleImport = template.statement.ast`import { unstable_setRequestLocale } from 'next-intl/server';`;

          insertImportDeclaration(path, useTranslationsImport, 'next-intl', 'useTranslations');
          if (isEnableStaticRendering && !useClient) {
            insertImportDeclaration(path, unstable_setRequestLocaleImport, 'next-intl/server', 'unstable_setRequestLocale');
          }
        },
      },
    }, post(state) {
      //结束时的处理
      state;
    },
  };
};

import {jsxInfoPlugin} from './jsxResolver';
import {createDirectories} from '../../utils/fileHandler';
import path from 'path';
import {
  addArgToFunctionDeclaration, insertDeclarationsToFunctionBody, hasDeclarationInFunctionBody,
} from './parseHelper';
import {writeLangJsonFile} from '../../utils/sourceLangJsonFileUpdater';
import {areCodeBlocksEqual} from '../../handlers/codeCheckHandler';

function doParse(file, newJsxFile, sourceJsonFilePath, isEnableStaticRendering) {
  //处理js和jsx文件
  if (isJsxPage(file)) {
    console.debug('Jsx page parse begin:', file);
    parseJsx(jsxInfoPlugin((jsxElements, useClient) => {
      const sourceCode = fs.readFileSync(file, 'utf8');

      const resultAndKeys = deal(jsxElements, sourceJsonFilePath);

      //拷贝文件
      if (file !== newJsxFile) {
        fs.copyFileSync(file, newJsxFile);
      }

      // console.log(newJsxElements)
      modifyAndWriteNewFileByJsx(newJsxFile, sourceCode, resultAndKeys[0], resultAndKeys[1], isEnableStaticRendering, useClient);
    }), file);
    console.debug('Jsx page parse finished.');
  } else if (isTsxPage(file)) {
    console.debug('Tsx page parse begin:', file);
    parseTsx(jsxInfoPlugin((jsxElements, useClient) => {
      const sourceCode = fs.readFileSync(file, 'utf8');

      const resultAndKeys = deal(jsxElements, sourceJsonFilePath);
      //拷贝文件
      if (file !== newJsxFile) {
        fs.copyFileSync(file, newJsxFile);
      }
      // console.log(newJsxElements)
      modifyAndWriteNewFileByTsx(newJsxFile, sourceCode, resultAndKeys[0], resultAndKeys[1], isEnableStaticRendering, useClient);
    }), file);
    console.debug('Tsx page parse finished.');
  } else {
    console.debug('Ignore file:', file);
  }
}

function isJsxPage(jsxFile) {
  return jsxFile.endsWith('.jsx') || jsxFile.endsWith('.js');
}

function isTsxPage(jsxFile) {
  return jsxFile.endsWith('.tsx');
}

/**
 *
 * @param isEnableStaticRendering
 * @param jsonFileDir json文件目录
 * @param ignorePageFiles 需要忽略的页面文件列表
 * @param allPageRootDir 所有页面文件的根目录
 * @param sourceLang 这个需要用户输入，以确定源文件中是哪个语言
 */
export function replaceAllJsxPages(jsonFileDir, ignorePageFiles, allPageRootDir, sourceLang = 'en', isEnableStaticRendering) {
  createDirectories(jsonFileDir);
  const sourceJsonFilePath = `${jsonFileDir}/${sourceLang}.json`;

  //遍历所有页面文件，并循环应用doParse
  const processDirectory = function(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);

      //忽略文件
      if (ignorePageFiles.includes(itemPath)) {
        continue;
      }

      if (stat.isDirectory()) {
        // 如果是目录，递归处理
        processDirectory(itemPath);
      } else {
        // 调用doParse函数处理文件
        doParse(itemPath, itemPath, sourceJsonFilePath, isEnableStaticRendering);
      }
    }
  };
  processDirectory(allPageRootDir);
}


