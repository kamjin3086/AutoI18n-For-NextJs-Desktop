import fs from 'fs-extra';
import path from 'path';
import parser from '@babel/parser';
import traverse from '@babel/traverse';
import t from '@babel/types';
import generator from '@babel/generator';

async function readFiles(dir, allFiles = []) {
    const files = await fs.readdir(dir);
    await Promise.all(files.map(async file => {
        const filePath = path.join(dir, file);
        if (await fs.stat(filePath).then(stat => stat.isDirectory())) {
            return readFiles(filePath, allFiles);
        } else if (/\.(js|tsx)$/.test(filePath)) { // 限定文件类型
            allFiles.push(filePath);
        }
    }));
    return allFiles;
}

async function replaceKeysInFile(filePath, modifyJsonMetadata) {
    const code = await fs.readFile(filePath, 'utf-8');
    const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],  // 支持 JSX 和 TypeScript
    });

    let possibleComponentNames = new Set(); // 存储所有可能的组件名称

    traverse.default(ast, {
        // 捕获所有形式的函数声明作为可能的组件
        FunctionDeclaration(path) {
            if (path.parent.type === 'Program' || path.parent.type === 'ExportNamedDeclaration' || path.parent.type === 'ExportDefaultDeclaration') {
                possibleComponentNames.add(path.node.id.name);
            }
        },
        VariableDeclaration(path) {
            // 捕获变量声明中的箭头函数和函数表达式
            path.node.declarations.forEach(declaration => {
                if (declaration.init && (declaration.init.type === 'ArrowFunctionExpression' || declaration.init.type === 'FunctionExpression')) {
                    if (declaration.id.type === 'Identifier') {
                        possibleComponentNames.add(declaration.id.name);
                    }
                }
            });
        },
        ClassDeclaration(path) {
            if (path.parent.type === 'Program' || path.parent.type === 'ExportNamedDeclaration' || path.parent.type === 'ExportDefaultDeclaration') {
                possibleComponentNames.add(path.node.id.name);
            }
        },
        CallExpression(path) {
            // 当调用 t 函数时，检查是否在我们捕获的组件中
            if (
                path.node.callee.name === 't' &&
                path.node.arguments.length > 0 &&
                t.isStringLiteral(path.node.arguments[0])
            ) {
                const keyName = path.node.arguments[0].value;
                modifyJsonMetadata.modifiedMetadataList.forEach(metadata => {
                    if (possibleComponentNames.has(metadata.parentJsonKey) && metadata.originalJsonKey === keyName) {
                        path.node.arguments[0].value = metadata.modifiedJsonKey;
                    }
                });
            }
        },
    });

    // 生成新的代码
    const output = generator.default(ast, {}, code);
    await fs.writeFile(filePath, output.code);
}

async function updateLocaleKeys(sourceDir, modifyJsonMetadata) {
    const files = await readFiles(sourceDir);
    for (let file of files) {
        await replaceKeysInFile(file, modifyJsonMetadata);
    }
}

/**
 * 替换键名或者替换json内容
 *
 * @param sourceCodePath
 * @param modifyJsonMetadata
 * @param sourceLangFilePath
 * @param sourceLangJson
 * @returns {Promise<*>}
 */
 export async function replaceLocaleLabelOrContent(sourceCodePath, modifyJsonMetadata, sourceLangFilePath, sourceLangJson) {
    //修改代码中的jsonKey
    if (modifyJsonMetadata.modifiedMetadataList && modifyJsonMetadata.modifiedMetadataList.length > 0) {
        updateLocaleKeys(sourceCodePath, modifyJsonMetadata)
            .then(() => console.log('All keys updated.'))
            .catch(err => console.error('Error updating keys:', err));
    }

    //替换json值内容
    let newSourceLangJson = sourceLangJson;
    if (modifyJsonMetadata.modifiedJsonData && Object.keys(modifyJsonMetadata.modifiedJsonData).length > 0) {
        //将JSON写入结果
        fs.writeFileSync(sourceLangFilePath, JSON.stringify(modifyJsonMetadata.modifiedJsonData, null, 4));
        newSourceLangJson = modifyJsonMetadata.modifiedJsonData;
    }
    return newSourceLangJson;
}

