'use strict';

var gutil           = require('gulp-util'),
    _               = require('lodash'),
    attachHelp      = require('./lib/attach-help.js'),
    calculateMargin = require('./lib/calculate-margin.js'),
    DEFAULT_OPTIONS = {
        aliases: [],
        description: 'Display this help text.',
        afterPrintCallback: gutil.noop
    };

module.exports = function (gulp, options) {
    var originalTaskFn = gulp.task;

    options = _.defaults({}, options, DEFAULT_OPTIONS);

    /**
     * gulp.task(name[, help, deps, fn, taskOptions])
     *
     * Adds `help` and `taskOptions` to the typical gulp task definition:
     * https://github.com/gulpjs/gulp/blob/master/docs/API.md#gulptaskname-deps-fn
     * @param {string} name
     * @param {string | boolean} [help]
     * @param {Array} [deps]
     * @param {function} [fn]
     * @param {object} [taskOptions]
     */
    gulp.task = function (name, help, taskOptions, fn) {

        // if `gulp.task('onlyname')' was supplied, just return the existing task itself
        if (arguments.length === 1 && typeof name === 'string') {return originalTaskFn.call(gulp, name);}

        var task;

        /* jshint noempty: false */

        var args = Array.prototype.slice.call(arguments);

        fn = args.pop();

        if (typeof args[0] === 'string') {
            name = args.shift()
            if (typeof args[0] === 'string') {
                help = args.shift();
            }
        }

        if (typeof args[0] === 'object') {
            taskOptions = args.shift();
        }

        if (args.length !== 0 || !fn || !(name || fn.name)) {
            throw new gutil.PluginError('gulp-help',
                'Unexpected arg types. Should be in the form: `gulp.task([name, help, taskOptions, ] fn)` but received: \n ' + Array.prototype.slice.call(arguments));
        }

        if (name) {
            originalTaskFn.call(gulp, name, fn)
        } else {
            originalTaskFn.call(gulp, fn)
        }

        task = originalTaskFn.call(gulp, name);

        taskOptions = _.extend({
            aliases: []
        }, taskOptions);

        taskOptions.aliases.forEach(function (alias) {
            originalTaskFn.task(alias, fn);
        });

        attachHelp(task, help, taskOptions);

        return gulp;
    };

    gulp.task('help', options.description, options, function () {

        var tasksWrapped = gulp.registry().tasks();

        var tasksWithMetadata = {};
        Object.keys(tasksWrapped).sort().forEach(function (key) {tasksWithMetadata[key] = gulp.task(key)});

        var marginData = calculateMargin(tasksWithMetadata);
        var margin = marginData.margin;

        // set options buffer if the tasks array has options
        var optionsBuffer = marginData.hasOptions ? '  --' : '';

        console.log('');
        console.log(gutil.colors.underline('Usage'));
        console.log('  gulp [task]');
        console.log('');
        console.log(gutil.colors.underline('Available tasks'));

        _.each(tasksWithMetadata, function (task, name) {

            if (task.help || process.argv.indexOf('--all') !== -1) {

                var help = task.help || {message: '', options: {}};
                var helpText = help.message || '';
                var args = [' ', gutil.colors.cyan(name)];

                args.push(new Array(margin - name.length + 1 + optionsBuffer.length).join(" "));
                args.push(helpText);

                var options = Object.keys(help.options).sort();
                options.forEach(function (option) {
                    var optText = help.options[option];
                    args.push('\n ' + optionsBuffer + gutil.colors.cyan(option) + ' ');

                    args.push(new Array(margin - option.length + 1).join(" "));
                    args.push(optText);
                });

                console.log.apply(console, args);
            }
        });
        console.log('');
        if (options.afterPrintCallback) {
            options.afterPrintCallback(tasksWithMetadata);
        }
    });

    gulp.task('default', gulp.task('help'));

    return gulp;
};
