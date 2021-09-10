Addition
  = head:Multiplication tail:(_ ("+" / "-") _ Multiplication)* {
      return tail.reduce((result, element) => {
        return {
            type: 'operation',
          	operator: element[1],
            left: result,
            right: element[3],
        };
      }, head);
    }

Multiplication
  = head:Exponent tail:(_ ("*" / "/" / "%") _ Exponent)* {
      return tail.reduce((result, element) => {
        return {
            type: 'operation',
          	operator: element[1],
            left: result,
            right: element[3],
        };
      }, head);
    }
    
Exponent
  = head:Function tail:(_ ("**") _ Function)* {
      return tail.reduce((result, element) => {
        return {
            type: 'operation', 
          	operator: element[1],
            left: result,
            right: element[3],
        };
      }, head);
    }
    
Function
 = name: ([a-zA-Z_]+) _ expression: Factor {
   return {
     type: 'function', 
     name: name.join(''),
     expression,
 }; 
} / Factor
  
Factor
  = "(" _ expr:Addition _ ")" { 
    return expr; 
  }
  / Decimal
  / Integer
  / Variable
  / Stat

Integer "integer"
  = _ [0-9]+ {
    return parseInt(text(), 10);
  }
  
Decimal "decimal"
  = _ [0-9]* '.' [0-9]+ { 
  	return Number(text());
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
  
Variable 'variable'
  = '$' firstChar: [a-zA-Z_] rest: [0-9a-zA-Z_]* {
    return {
      type: 'variable',
      name: firstChar + rest.join(''),
    }
  }

_ "whitespace"
  = [ \t\n\r]*