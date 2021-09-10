export namespace Terms {
  export type Type =
    'operation' |
    'variable';

  export interface ComplexTerm {
    type: Type;
  }

  export type Operator = '+' | '-' | '*' | '/' | '%' | '**';

  export type FunctionName = 'floor' | 'ceil' | 'round' | 'sqrt' | 'log' | 'log2' | 'log10' | 'trunc' | 'sign' | 'abs';

  export interface OperationExpression extends ComplexTerm {
    type: 'operation';
    operator: Operator;
    left: Expression;
    right: Expression;
  }

  export interface VariableExpression extends ComplexTerm {
    type: 'variable';
    name: string;
  }
  
  export interface FunctionExpression extends ComplexTerm {
    type: 'function';
    name: FunctionName;
    expression: Expression
  }
  
  export type Expression = OperationExpression | VariableExpression | FunctionExpression | number | string;
}

export function parse(content: string): Terms.Expression;
