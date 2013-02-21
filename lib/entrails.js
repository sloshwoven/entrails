var esprima    = require('esprima'),
    estraverse = require('estraverse');

(function(exports) {
    /**
     * The main function that transforms JS code by attaching local variables to return values.
     */
    var transform = function(code) {
        var ast      = parse(code),
            funcNum  = 0,  // function number - increases with depth to avoid name clashes
            charI    = 0,  // character index into the original code
            snippets = []; // snippets of output code that we'll concat at the end

        estraverse.traverse(ast, {
            enter: function(node, parentNode) {
                if (isFunctionBlockNode(node, parentNode)) {
                    funcNum++;
                    var endI = node.range[0] + 1; // +1 to include the brace itself

                    snippets.push(
                        code.slice(charI, endI) +
                        'var _entrails_' + funcNum + ' = {};'
                    );

                    charI = endI;
                } else if (node.type === estraverse.Syntax.ReturnStatement) {
                    var retExpr = code.slice(node.argument.range[0], node.argument.range[1]),
                        retName = '_entrails_ret_' + funcNum;

                    // TODO: if the return value is a primitive, then the _entrails property can't be set on it
                    // (it won't throw an error - it'll do nothing). Maybe we should wrap it before setting _entrails?
                    snippets.push(
                        code.slice(charI, node.range[0]) +
                        'var ' + retName + ' = ' + retExpr + ';\n' +
                        'if (' + retName + '._entrails !== undefined) {\n' +
                        '    _entrails_' + funcNum + '._entrails = ' + retName + '._entrails;\n' +
                        '}\n' +
                        retName + '._entrails = _entrails_' + funcNum + ';\n' +
                        'return ' + retName + ';'
                    );

                    charI = node.range[1]; // skip the original return statement
                }
            },
            leave: function(node, parentNode) {
                if (isFunctionBlockNode(node, parentNode)) {
                    funcNum--;
                } else if (funcNum > 0 && node.type === estraverse.Syntax.VariableDeclarator) {
                    var endI = node.range[1] + 1; // TODO: this +1 is for a semicolon that may not actually be there
                    snippets.push(code.slice(charI, endI));
                    charI = endI;

                    var varName = node.id.name;
                    snippets.push('_entrails_' + funcNum + '.' + varName + ' = ' + varName + ';');
                }
            }
        });

        // get any leftover whitespace/comments
        if (code.length > charI) {
            snippets.push(code.slice(charI));
        }

        return snippets.join('');
    };

    /**
     * Parse code with esprima and return the AST.
     */
    var parse = function(code) {
        return esprima.parse(code, {range: true});
    };

    /**
     * Determine if an AST node is a function block node.
     */
    var isFunctionBlockNode = function(node, parentNode) {
        return (
            node.type === estraverse.Syntax.BlockStatement &&
            parentNode &&
            isFunctionNode(parentNode)
        );
    };

    /**
     * Determine if an AST node is a function node.
     */
    var isFunctionNode = function(node) {
        return (
            node.type === estraverse.Syntax.FunctionDeclaration ||
            node.type === estraverse.Syntax.FunctionExpression
        );
    };

    exports.transform = transform;
})(exports || (entrails = {}));
