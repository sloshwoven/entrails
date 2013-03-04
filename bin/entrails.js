#!/usr/bin/env node

var fs       = require('fs'),
    entrails = require('entrails');

(function(args) {
    var main = function(args) {
        if (args.length < 2) {
            die('too few arguments');
        } else if (args.length > 2) {
            die('too many arguments');
        } else {
            transformFile(args[1]);
        }
    };

    var transformFile = function(path) {
        fs.exists(path, function(exists) {
            if (exists) {
                fs.readFile(path, function(err, code) {
                    if (err) {
                        throw err;
                    }

                    console.log(entrails.transform(code));
                });
            } else {
                die(path + ' does not exist');
            }
        });
    };

    var die = function(msg) {
        process.stderr.write('Error: ' + msg + '\n');
        process.exit(1);
    };

    main(args);
})(process.argv.slice(1));

