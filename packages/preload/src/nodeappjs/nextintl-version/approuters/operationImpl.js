import nextConfigJsReplacer from './parse/nextConfigJsReplacer';
import nextConfigMjsReplacer from './parse/nextConfigMjsReplacer';
import fs from 'fs';
import path from 'path';
import t from '@babel/types';
import {createDirectories} from '../utils/fileHandler';
import {execCommandSync} from '../utils/commandExecutor';
import {GENERATED_PAGE_IDENTITY} from './consts';
import {simulateCLICommand} from './simulateCLITrucker';
import {parseJsx, parseTs} from '../handlers/babelHandler';

export function updateNextConfig(sourceCodeDir) {
  const nextConfigJsPath = path.join(sourceCodeDir, 'next.config.js');
  if (fs.existsSync(nextConfigJsPath)) {
    nextConfigJsReplacer(nextConfigJsPath, nextConfigJsPath);
    console.info('next.config.js updated.');
    return;
  }

  const nextConfigMjsPath = path.join(sourceCodeDir, 'next.config.mjs');
  if (fs.existsSync(nextConfigMjsPath)) {
    nextConfigMjsReplacer(nextConfigMjsPath, nextConfigMjsPath);
    console.info('next.config.mjs updated.');
    return;
  }

  throw new Error(`next.config.js or next.config.mjs does not exist, projectRootDir: ${sourceCodeDir}`);
}

export function moveAppDirPagesToLocaleDir(projectRootDir, haveSrc, needExcludeFiles, innerNeedExcludeFiles = [
  'api', 'lib',
  'layout.tsx', 'layout.jsx', 'layout.js',
  'globals.css', 'global.css',
  'robots.ts', 'robots.js',
  'sitemap.ts', 'sitemap.js',
  'favicon.ico',
  'error.ts', 'error.tsx', 'error.js', 'error.jsx']) {
  const srcDir = haveSrc ? path.join(projectRootDir, 'src') : projectRootDir;

//移动app目录下的内容到[locale]目录下，排除指定文件
  console.log('Start move pages...');
  const appDir = path.join(srcDir, 'app');
//创建[locale]目录
  const localeDir = path.join(appDir, '[locale]');
  createDirectories(localeDir);

  //获取app目录下的所有文件
  fs.readdirSync(appDir).forEach(file => {
    const innerNeedExcludes = !innerNeedExcludeFiles.includes(file.toLocaleLowerCase());
    const needExcludes = !needExcludeFiles.includes(file.toLocaleLowerCase());
    const notLocaleDir = file !== '[locale]';
    if (innerNeedExcludes && needExcludes && notLocaleDir) {
      const sourceFile = path.join('app', file);
      const distFile = path.join('app', '[locale]', file);

      //不是auto-18n创建的页面及api时，才进行移动
      const sFile = path.join(srcDir, sourceFile);
      if (!pageIsGenerateByAutoI18n(sFile) && !pageMaybeIsApiFile(sFile)) {

        // 检查目标文件夹是否存在，不存在或distFile文件夹为空时，开始操作
        if (!fs.existsSync(path.join(srcDir, distFile))) {
          //command的方式移动，在没有安装trucker的情况下，会报错
          // const cmd = `trucker -m ${sourceFile} ${distFile}`;
          // console.log(`moved file：${sourceFile} ${distFile}`);
          // execCommandSync(srcDir, cmd);

          //此处使用模拟命令行调用，直接调用js文件的方式移动
          simulateCLICommand(srcDir, sourceFile, distFile);
          console.log(`Moved file: ${sourceFile} ${distFile}`);
        } else {
          console.log(`Destination file/folder exists, skipping: ${distFile}`);
        }


      }
    }
  });
  console.log('Pages moved done.');
}

function pageIsGenerateByAutoI18n(absoluteFilePath) {
  //读取文件内容，如果确定是库创建的，则返回true
  const stats = fs.statSync(absoluteFilePath);
  if (stats.isFile()) {
    const fileContent = fs.readFileSync(absoluteFilePath, 'utf8');
    return fileContent.includes(GENERATED_PAGE_IDENTITY);
  } else if (stats.isDirectory()) {
    return false;
  }
}

// function pageIsGenerateByAutoI18nByContent(pageContent) {
//   if (pageContent) {
//     return pageContent.includes(GENERATED_PAGE_IDENTITY);
//   }
//   return false;
// }

function pageMaybeIsApiFile(absoluteFilePath) {
  if (absoluteFilePath.endsWith('route.ts') || absoluteFilePath.endsWith('route.js')) {
    return true;
  }

  let result = false;
  if (absoluteFilePath.endsWith('.ts')) {
    //ts格式的文件，使用parseTs处理
    parseTs(mayBeIsApiFilePlugin(function(r) {
      result = r;
    }), absoluteFilePath);
  } else if (absoluteFilePath.endsWith('.js')) {
    //js格式的文件，可能是jsx，所以用parseJsx处理
    parseJsx(mayBeIsApiFilePlugin(function(r) {
      result = r;
    }), absoluteFilePath);
  } else if (absoluteFilePath.endsWith('.tsx')) {
    //注意：tsx通常不会是提供api的文件，此处不处理对应的格式
    //忽略
  }

  return result;
}

const mayBeIsApiFilePlugin = function(resultCallback) {
  function isLikelyHttpResponseMethod(node) {
    return (
      t.isMemberExpression(node) &&
      t.isCallExpression(node) &&
      node.callee.property &&
      /^(send|json|status|end)$/.test(node.callee.property.name)
    );
  }

  // function isLikelyErrorHandler(node) {
  //   return (
  //     t.isTryStatement(node) &&
  //     node.handler &&
  //     node.handler.param &&
  //     node.handler.body.body.some(statement => isLikelyHttpResponseMethod(statement.expression))
  //   );
  // }

  function analyzeFunctionBody(path) {
    path;
    // let hasAsyncAwait = false;
    // let hasResponseMethodCall = false;
    // let hasErrorHandler = false;
    //
    // path.traverse({
    //     // AwaitExpression() {
    //     //     hasAsyncAwait = true;
    //     // },
    //     CallExpression(callPath) {
    //         if (isLikelyHttpResponseMethod(callPath.node)) {
    //             hasResponseMethodCall = true;
    //         }
    //     },
    //     TryStatement(tryPath) {
    //         if (isLikelyErrorHandler(tryPath.node)) {
    //             hasErrorHandler = true;
    //         }
    //     },
    // });
    //
    // // return hasAsyncAwait && hasResponseMethodCall && hasErrorHandler;
    // return hasResponseMethodCall && hasErrorHandler;
    return true;
  }

  return {
    visitor: {
      FunctionDeclaration(path) {
        const declaration = path.node;
        if (declaration && t.isFunctionDeclaration(declaration)) {
          //const funcName = declaration.id.name;
          const isAsync = declaration.async;
          const hasReqParam = declaration.params.some(
            param => t.isIdentifier(param) && /req|request|res|response/i.test(param.name),
          );
          const isLikelyApiEndpoint = isAsync && hasReqParam && analyzeFunctionBody(path);

          if (isLikelyApiEndpoint) {
            // console.log(`Possible API endpoint detected: ${funcName} in file ${path.hub.file.opts.filename}`);
            resultCallback(true);
          }
        }
      },
    },
  };
};


export async function installNextIntlIfNeeded(projectRootDir) {
  let success = true;
  const packageJsonPath = `${projectRootDir}/package.json`;
  // 读取package.json文件
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};

    // 检查next-intl是否已安装
    if (!dependencies['next-intl'] && !devDependencies['next-intl']) {
      console.log('Install next-intl...');
      try {
        execCommandSync(projectRootDir, 'npm install next-intl');
        console.log('Install next-intl done.');
      } catch (e) {
        console.error('Install next-intl failed.');
        success = false;
      }
    } else {
      console.log('The next-intl is already installed.');
    }
  } else {
    console.error('The package.json not found.');
  }
  return success;
}

// function installGlobalTrucker(projectRootDir) {
//   let success = true;
//   try {
//     console.log('Installing \'trucker\' globally...');
//     execCommandSync(projectRootDir, 'npm install -g trucker');
//     console.log('\'trucker\' installation done.');
//   } catch (e) {
//     console.error('install trucker failed.');
//     success = false;
//   }
//   return success;
// }
//
// function installGlobalTruckerIfNeeded(projectRootDir) {
//   console.log('Checking if \'trucker\' is already installed globally...');
//
//   // 检查trucker是否已经全局安装
//   const listOutput = execCommandSync(projectRootDir, 'npm list -g trucker');
//
//   if (!listOutput.includes('trucker@')) {
//     console.log('Installing \'trucker\' globally...');
//     execCommandSync(projectRootDir, 'npm install -g trucker');
//     console.log('\'trucker\' installation done.');
//   } else {
//     console.log('\'trucker\' is already installed globally.');
//   }
// }
