#!/usr/bin/env node

var fs       = require('fs'),
    entrails = require('entrails'),
    promFs   = require('promised-io/fs');

(function(args) {
    var main = function(args) {
        if (args.length < 1) {
            die('too few arguments');
        } else if (args.length > 1) {
            die('too many arguments');
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
        process.exit(1);
    };

    main(args);
})(process.argv.slice(2));
