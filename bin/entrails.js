#!/usr/bin/env node

var fs       = require('fs'),
    entrails = require('entrails'),
    promFs   = require('promised-io/fs');

var USAGE = 'Usage: entrails <file>';

(function(args) {
    var main = function(args) {
        if (args.length < 1) {
            die('too few arguments');
        } else if (args.length > 1) {
            die('too many arguments');
        } else if (args[0] === '-h' || args[0] === '-help' || args[0] === '--help') {
            console.log(USAGE);
        } else {
            transformFile(args[0]);
        }
    };

    var transformFile = function(path) {
        return promFs.exists(path).then(function() {
            die(path + ' does not exist');
        }, function() {
            promFs.readFile(path).then(function(code) {
                console.log(entrails.transform(code));
            }, function(err) {
                die('cannot read ' + path + ': ' + err);
            });
        });
    };

    var die = function(msg) {
        process.stderr.write('Error: ' + msg + '\n');
        process.stderr.write(USAGE + '\n');
        process.exit(1);
    };

    main(args);
})(process.argv.slice(2));
