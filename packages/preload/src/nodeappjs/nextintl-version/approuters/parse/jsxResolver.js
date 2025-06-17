import {toValidJsonField} from '../../utils/jsonHandler';

// 自定义Babel插件来遍历JSX
export const jsxInfoPlugin = function(postCallback) {
  const jsxElements = {};
  let useClient = false;

  function isUntranslatable(content) {
    const regex = /^[*,.<|)(&^%$#@!~=_\-——+[\]{}\\/:;"'<>,.?\s]*$/;
    return regex.test(content);
  }

  function parseJsxElement(path, componentName) {
    const openingElement = path.node.openingElement;
    const attributes = openingElement.attributes.map(attr => {
      if (attr && attr.name) {
        const name = attr.name.name;
        let value;
        if (attr.value && attr.value.type === 'StringLiteral') {
          value = attr.value.value;
        } else if (attr.value && attr.value.expression && attr.value.expression.type === 'StringLiteral') {
          value = attr.value.expression.value;
        } else {
          value = 'unsupported value type';
        }
        return {[name]: value};
      }
    });

    const tagName = openingElement.name.name;
    const content = path.node.children.find(child => child.type === 'JSXText')?.value.trim();
    //非空白字符，以及非不可翻译字符，才进行一进步处理
    if (!isUntranslatable(content)) {
      const nodeloc = `${path.node.start}-${path.node.end}`;
      const shortKeyByContent = toValidJsonField(content);
      const tagUniqueKey = `${tagName}_${nodeloc}_${shortKeyByContent}`;
      jsxElements[tagUniqueKey] = {
        key: tagUniqueKey,
        componentName,
        tagName,
        attributes,
        nodeloc: nodeloc,
        shortKeyByContent: shortKeyByContent,
        content: content,
      };
    }
  }

  return {
    visitor: {
      ClassDeclaration: {
        enter(path) {
          const componentName = path.node.id.name;
          path.traverse({
            JSXElement(innerPath) {
              parseJsxElement(innerPath, componentName);
            },
          });
        },
      }, FunctionDeclaration: {
        enter(path) {
          const componentName = path.node.id.name;
          path.traverse({
            JSXElement(innerPath) {
              parseJsxElement(innerPath, componentName);
            },
          });
        },
      }, VariableDeclarator: {
        enter(path) {
          if (path.node.init && path.node.init.type === 'ArrowFunctionExpression') {
            const componentName = path.node.id.name;
            path.traverse({
              JSXElement(innerPath) {
                parseJsxElement(innerPath, componentName);
              },
            });
          }
        },
      }, Directive(path) {
        const {node} = path;
        if (node.value.value === 'use client') {
          useClient = true;
        }
      },
    }, post(state) {
      state;
      postCallback(jsxElements, useClient);
    },
  };
};

