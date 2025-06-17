import parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import t from '@babel/types';

export function areCodeBlocksEqual(code1, code2) {
  // 解析代码为 AST，指定 sourceType 为 "module"
  const ast1 = parser.parse(code1, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],  // 支持 JSX 和 TypeScript
  });
  const ast2 = parser.parse(code2, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],  // 支持 JSX 和 TypeScript
  });

  // 规范化 AST
  normalizeAST(ast1);
  normalizeAST(ast2);

  // 生成规范化后的代码
  const {code: normalizedCode1} = generate.default(ast1);
  const {code: normalizedCode2} = generate.default(ast2);

  // 比较规范化后的代码
  return normalizedCode1 === normalizedCode2;
}

function normalizeAST(ast) {
  traverse.default(ast, {
    enter(path) {
      // 移除注释
      if (path.node.leadingComments) {
        path.node.leadingComments = null;
      }
      if (path.node.trailingComments) {
        path.node.trailingComments = null;
      }

      // 规范化变量名
      if (path.isIdentifier() && !path.isReferenced()) {
        path.node.name = 'x';
      }

      // 移除位置信息
      delete path.node.start;
      delete path.node.end;
      delete path.node.loc;

      // 移除括号
      if (t.isExpressionStatement(path.node) && t.isParenthesizedExpression(path.node.expression)) {
        path.node.expression = path.node.expression.expression;
      }
    }
  });
}
