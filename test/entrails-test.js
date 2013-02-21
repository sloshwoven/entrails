var vows     = require('vows'),
    assert   = require('assert'),
    entrails = require('../lib/entrails');

vows.describe('Entrails').addBatch({
    'The transform function': {
        topic: entrails,

        'must leave simple input unchanged': function(entrails) {
            var input = '// simple assignments\n' +
                        'var x = 2;\n' +
                        'var y = (x + 1) * 2;\n' +
                        'var z = "foo";';

            assert.equal(input, entrails.transform(input));
        },

        'must correctly transform a simple function': function(entrails) {
            var input = '// a simple function\n' +
                        'function triple(x) {\n' +
                        '    return x * 3;\n' +
                        '}';

            var expected = '// a simple function\n' +
                           'function triple(x) {var _entrails_1 = {};\n' +
                           '    var _entrails_ret_1 = x * 3;\n' +
                           'if (_entrails_ret_1._entrails !== undefined) {\n' +
                           '    _entrails_1._entrails = _entrails_ret_1._entrails;\n' +
                           '}\n' +
                           '_entrails_ret_1._entrails = _entrails_1;\n' +
                           'return _entrails_ret_1;\n' +
                           '}';

            assert.equal(expected, entrails.transform(input));
        }
    }
}).run();
