import t from '@babel/types';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import template from '@babel/template';
import generate from '@babel/generator';

export function addArgToFunctionDeclaration(path, isTsx, arg = 'params', subArg = 'locale') {
  const localeIdentifier = t.identifier(subArg);
  const localeTypeAnnotation = isTsx ? t.tsTypeAnnotation(t.tsStringKeyword()) : null;
  localeIdentifier.typeAnnotation = localeTypeAnnotation;

  const localeProp = t.objectProperty(localeIdentifier, localeIdentifier, false, true);

  let paramsObjectFound = false;

  // Check if there are any parameters in the function
  if (!path.node.params || path.node.params.length === 0) {
    // If there are no parameters, create a new params object with locale and insert it as the first parameter
    const paramsIdentifier = t.identifier(arg);
    const paramsProp = t.objectProperty(paramsIdentifier, t.objectPattern([localeProp]), false, true);

    if (isTsx) {
      paramsProp.typeAnnotation = t.tsTypeAnnotation(t.tsTypeLiteral([
        t.tsPropertySignature(localeIdentifier, localeTypeAnnotation),
      ]));
    }

    path.node.params = [t.objectPattern([paramsProp])];
  } else {
    // Iterate over the function parameters to find or create the `params` object pattern
    for (const param of path.node.params) {
      if (t.isObjectPattern(param)) {
        const paramsProp = param.properties.find(prop =>
          t.isObjectProperty(prop) && t.isIdentifier(prop.key) && prop.key.name === arg);

        if (paramsProp) {
          paramsObjectFound = true;
          let localeFound = false;

          if (t.isObjectPattern(paramsProp.value)) {
            // Check if `locale` already exists in `params` and update it if so
            for (const subProp of paramsProp.value.properties) {
              if (t.isObjectProperty(subProp) && t.isIdentifier(subProp.key) && subProp.key.name === subArg) {
                subProp.value = localeIdentifier;
                if (isTsx) {
                  subProp.value.typeAnnotation = localeTypeAnnotation;
                }
                localeFound = true;
                break;
              }
            }

            if (!localeFound) {
              // Add `locale` to `params` if it doesn't already exist
              paramsProp.value.properties.push(localeProp);
            }

            // Update the type annotation for `params` if necessary
            if (isTsx && !paramsProp.typeAnnotation) {
              paramsProp.typeAnnotation = t.tsTypeAnnotation(t.tsTypeLiteral([
                t.tsPropertySignature(localeIdentifier, localeTypeAnnotation),
              ]));
            }
          }
          break;
        }
      }
    }

    if (!paramsObjectFound) {
      // If `params` object pattern was not found, create a new one and insert it as the first parameter
      const paramsIdentifier = t.identifier(arg);
      const paramsProp = t.objectProperty(paramsIdentifier, t.objectPattern([localeProp]), false, true);

      if (isTsx) {
        paramsProp.typeAnnotation = t.tsTypeAnnotation(t.tsTypeLiteral([
          t.tsPropertySignature(localeIdentifier, localeTypeAnnotation),
        ]));
      }

      // Insert `params` at the beginning of the parameter list
      path.node.params.unshift(t.objectPattern([paramsProp]));
    }
  }
}

export function hasDeclarationInFunctionBody(path, declarationNode) {
  let hasDecl = false;

  // 生成代码字符串
  const declCode = generate.default(declarationNode).code;

  // 解析生成的代码字符串
  const declAst = parser.parse(declCode, {sourceType: 'module'});

  let declNode = null;
  traverse.default(declAst, {
    enter(p) {
      let node = p.node;
      if (t.isVariableDeclaration(node) || t.isExpressionStatement(node) || t.isFunctionDeclaration(node)) {
        declNode = p.node;
        p.stop();
      }
    },
  });

  if (!declNode) {
    throw new Error('Invalid declaration node');
  }

  path.traverse({
    enter(p) {
      if (t.isVariableDeclaration(declNode) && t.isVariableDeclaration(p.node)) {
        if (p.node.declarations.some(d => d.id.name === declNode.declarations[0].id.name)) {
          hasDecl = true;
          p.stop();
        }
      } else if (t.isFunctionDeclaration(declNode) && t.isFunctionDeclaration(p.node)) {
        if (p.node.id.name === declNode.id.name) {
          hasDecl = true;
          p.stop();
        }
      } else if (t.isExpressionStatement(declNode) && t.isExpressionStatement(p.node)) {
        if (t.isCallExpression(declNode.expression) && t.isCallExpression(p.node.expression)) {
          if (p.node.expression.callee.name === declNode.expression.callee.name) {
            hasDecl = true;
            p.stop();
          }
        }
      } else if (t.isCallExpression(declNode) && t.isCallExpression(p.node)) {
        if (p.node.callee.name === declNode.callee.name) {
          hasDecl = true;
          p.stop();
        }
      }
    },
  });

  return hasDecl;
}

export function insertDeclarationsToFunctionBody(path, declarations) {
  const bodyPath = path.get('body') || path.get('init.body');
  if (!bodyPath) {
    throw new Error('Function body not found');
  }

  // 处理箭头函数直接返回表达式的情况
  if (!bodyPath.node || bodyPath.node.type !== 'BlockStatement') {
    const returnStatement = template.statement.ast`return ${bodyPath.node || t.identifier('undefined')}`;
    bodyPath.replaceWith(t.blockStatement([returnStatement]));
  }

  // 检查每个声明是否已经存在
  declarations.forEach(declaration => {
    if (!hasDeclarationInFunctionBody(bodyPath, declaration)) {
      bodyPath.unshiftContainer('body', declaration);
    }
  });
}
