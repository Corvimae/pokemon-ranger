Expression 'expression'
  =  _ term:Term? _ {
    return term
  }

Term 'term'
  = BinaryOrExpression

Literal
  = IntegerLiteral
  / StringLiteral

Factor
  = "(" _ term: Term _ ")" { return term; }
  / StatExpression
  / VariableExpression
  
Variable 'variable'
  = '$' firstChar: [a-zA-Z_] rest: [0-9a-zA-Z_]* {
    return firstChar + rest.join('');
  }

Stat 'stat'
  = 'hp'
  / 'health'
  / 'atk'
  / 'attack'
  / 'defense'
  / 'def'
  / 'spattack'
  / 'spatk'
  / 'spa'
  / 'specialattack'
  / 'spdefense'
  / 'spdef'
  / 'spd'
  / 'specialdefense'
  / 'speed'
  / 'spe'
  / 'startingLevel'
  / 'caughtLevel'
  
Operator 'operator'
  = '=='
  / '!='
  / '<'
  / '<='
  / '>'
  / '>='
  
VariableExpression 'variableExpression'
  = _ variable: Variable _ operator: Operator _ expression: Literal {
    return {
      type: 'variableExpression',
      variable,
      operator,
      expression
    };
  } / BooleanVariableExpression

BooleanVariableExpression
  = TrueVariableExpression
  / FalseVariableExpression
  
TrueVariableExpression 'trueVariableExpression'
  = variable: Variable {
    return {
      type: 'variableExpression',
      variable,
      operator: '==',
      expression: true,
    };
  }

FalseVariableExpression 'falseVariableExpression'
  = '!' _ variable: Variable {
    return {
      type: 'variableExpression',
      variable,
      operator: '==',
      expression: false,
    };
  }
  
StatExpression 'statExpression'
  = _ stat: Stat _ '=' _ expression: Range {
    return {
      type: 'statExpression',
      stat,
      expression,
    };
  }

BinaryOrExpression
  = head: BinaryAndExpression
    tail:(_ '||' _ BinaryOrExpression)* {
      return tail.reduce((result, element) => ({
        type: "logicalExpression",
        operator: '||',
        left: result,
        right: element[3]
      }), head);
    }

BinaryAndExpression
  = head: Factor
    tail:(_ '&&' _ BinaryAndExpression)* {
      return tail.reduce((result, element) => ({
        type: "logicalExpression",
        operator: '&&',
        left: result,
        right: element[3]
      }), head);
    }

IntegerLiteral 'integer'
  = _ [0-9]+ {
    return parseInt(text(), 10);
  }
  
LineTerminator
  = [\n\r\u2028\u2029]
  
StringLiteral "string"
  = "'" chars:SingleStringCharacter* "'" {
      return chars.join('');
    }
    
SingleStringCharacter
  = !("'" / "\\" / LineTerminator) . { return text(); }
  
Range
  = IVRange
  / RangeSegment

IVRange = DeliminatedIVRange / InverseIVRange

InverseIVRange
  = '~' _ range: DeliminatedIVRange {
    return {
	  ...range,
      inverse: true
	};
  }

DeliminatedIVRange
	= PositiveIVRange
	/ '(' _ range: PositiveIVRange _ ')' { return range; }

PositiveIVRange 'ivRange'
  = _ negative: IVRangeSegment _ '/' _ neutral: IVRangeSegment _ '/' _ positive: IVRangeSegment _ {
    return {
      type: 'ivRange',
      negative,
      neutral,
      positive,
      inverse: false,
    };
  }

IVRangeSegment = RangeSegment / '#' / 'x' / 'X'

RangeSegment
 = BoundedRange
 / UnboundedRange
 / IntegerLiteral

UnboundedRange
  = value: IntegerLiteral _ operator: ('-' / '+') {
    return {
      type: 'unboundedRange',
      value,
      operator,
    };
  }

BoundedRange
  = from: IntegerLiteral _ ('–' / '-' / '—') _ to: IntegerLiteral {
  	if (to < from) throw new Error('BoundedRange: upper limit must be greater than or equal to lower limit');

	return {
      type: 'boundedRange',
      from,
      to,
    };
  }

_ "whitespace"
  = [ \t\n\r]*
