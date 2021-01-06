Expression 'expression'
  =  _ term:Term? _ {
    return term
  }

Term 'term' 
  = BinaryOrExpression
  
Literal
  = IntegerLiteral
  
Factor
  = "(" _ term: Term _ ")" { return term; }
  / StatExpression
  
Stat 'stat'
  = 'hp'
  / 'health'
  / 'atk'
  / 'attack'
  / 'def'
  / 'defense'
  / 'spa'
  / 'spatk'
  / 'spattack'
  / 'specialattack'
  / 'spd'
  / 'spdef'
  / 'spdefense'
  / 'specialdefense'
  / 'spe'
  / 'speed'
  / 'startingLevel'
  / 'caughtLevel'
  
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