'use strict';

var gulpHelp = require('./index.js'),
  gutil = require('gulp-util'),
/* jshint unused: true */
  should = require('should'),
/* jshint unused: false */
  sinon = require('sinon');

/* jshint expr: true */
describe('help', function () {

  var gulp, originalTaskFn;

  beforeEach(function () {
    gulp = null;
    originalTaskFn = null;
  });

  it('should have help task with help text', function () {
    gulp = sinon.stub({task: gutil.noop, tasks: { help: {} }});
    originalTaskFn = gulp.task;
    gulpHelp(gulp);
    should(originalTaskFn.calledTwice).ok;
    should(originalTaskFn.calledWith('default', ['help'])).ok;
    should(gulp.tasks.help.help).eql('Display this help text.');
  });

  it('should have a custom help text if passed', function () {
    gulp = sinon.stub({task: gutil.noop, tasks: { help: {} }});
    gulpHelp(gulp, { description: 'help text.' });
    should(gulp.tasks.help.help).eql('help text.');
  });

  it('should create an alias if passed', function () {
    gulp = sinon.stub({task: gutil.noop, tasks: { help: {} }});
    originalTaskFn = gulp.task;
    gulpHelp(gulp, { aliases: ['h', '?'] });
    should(gulp.tasks.help.help).eql('Display this help text. Aliases: h, ?');
    should(originalTaskFn.calledWith('h', ['help'])).ok;
    should(originalTaskFn.calledWith('?', ['help'])).ok;
  });

  describe('should support old task definitions', function () {

    beforeEach(function () {
      gulp = sinon.stub({task: gutil.noop, tasks: { help: {}, oldStyle: {} }});
      originalTaskFn = gulp.task;
      gulpHelp(gulp);
      should(originalTaskFn.calledTwice).ok;
    });

    it('with no help text and no deps', function () {
      gulp.task('oldStyle', gutil.noop);
      should(originalTaskFn.calledThrice).ok;
      should(originalTaskFn.calledWith('oldStyle', gutil.noop)).ok;
      should(gulp.tasks.oldStyle.help).eql(undefined);
    });

    it('with no help text and deps', function () {
      gulp.task('oldStyle', ['dep'], gutil.noop);
      should(originalTaskFn.calledThrice).ok;
      should(originalTaskFn.calledWith('oldStyle', ['dep'], gutil.noop)).ok;
      should(gulp.tasks.oldStyle.help).eql(undefined);
    });

  });

  describe('should support new task definitions', function () {

    beforeEach(function () {
      gulp = sinon.stub({task: gutil.noop, tasks: { help: {}, newStyle: {} }});
      originalTaskFn = gulp.task;
      gulpHelp(gulp);
      should(originalTaskFn.calledTwice).ok;
    });

    it('with help text and no deps', function () {
      gulp.task('newStyle', 'help text here', gutil.noop);
      should(originalTaskFn.calledThrice).ok;
      should(originalTaskFn.calledWith('newStyle', gutil.noop)).ok;
      should(gulp.tasks.newStyle.help).eql('help text here');
    });

    it('with help text and deps', function () {
      gulp.task('newStyle', 'help text here', ['dep'], gutil.noop);
      should(originalTaskFn.calledThrice).ok;
      should(originalTaskFn.calledWith('newStyle', ['dep'], gutil.noop)).ok;
      should(gulp.tasks.newStyle.help).eql('help text here');
    });

    it('with disabled help text and no deps', function () {
      gulp.task('newStyle', false, gutil.noop);
      should(originalTaskFn.calledThrice).ok;
      should(originalTaskFn.calledWith('newStyle', gutil.noop)).ok;
      should(gulp.tasks.newStyle.help).eql(undefined);
    });

    it('with disabled help text and deps', function () {
      gulp.task('newStyle', false, ['dep'], gutil.noop);
      should(originalTaskFn.calledThrice).ok;
      should(originalTaskFn.calledWith('newStyle', ['dep'], gutil.noop)).ok;
      should(gulp.tasks.newStyle.help).eql(undefined);
    });

    it('with aliases', function () {
      gulp.task('newStyle', 'description.', ['dep'], gutil.noop, { aliases: ['new-style', 'nstyle'] });
      should(originalTaskFn.callCount).eql(5);
      should(originalTaskFn.calledWith('newStyle', ['dep'], gutil.noop)).ok;
      should(originalTaskFn.calledWith('new-style', ['newStyle'], gutil.noop)).ok;
      should(originalTaskFn.calledWith('nstyle', ['newStyle'], gutil.noop)).ok;
      should(gulp.tasks.newStyle.help).eql('description. Aliases: new-style, nstyle');
    });

    it('with aliases no help', function () {
      gulp.task('newStyle', ['dep'], gutil.noop, { aliases: ['new-style', 'nstyle'] });
      should(originalTaskFn.callCount).eql(5);
      should(originalTaskFn.calledWith('newStyle', ['dep'], gutil.noop)).ok;
      should(originalTaskFn.calledWith('new-style', ['newStyle'], gutil.noop)).ok;
      should(originalTaskFn.calledWith('nstyle', ['newStyle'], gutil.noop)).ok;
      should(gulp.tasks.newStyle.help).eql('Aliases: new-style, nstyle');
    });

    it('with aliases no deps', function () {
      gulp.task('newStyle', 'description.', gutil.noop, { aliases: ['new-style', 'nstyle'] });
      should(originalTaskFn.callCount).eql(5);
      should(originalTaskFn.calledWith('newStyle', gutil.noop)).ok;
      should(originalTaskFn.calledWith('new-style', ['newStyle'], gutil.noop)).ok;
      should(originalTaskFn.calledWith('nstyle', ['newStyle'], gutil.noop)).ok;
      should(gulp.tasks.newStyle.help).eql('description. Aliases: new-style, nstyle');
    });

    it('with aliases, disabled help and no deps', function () {
      gulp.task('newStyle', false, gutil.noop, { aliases: ['new-style', 'nstyle'] });
      should(originalTaskFn.callCount).eql(5);
      should(originalTaskFn.calledWith('newStyle', gutil.noop)).ok;
      should(originalTaskFn.calledWith('new-style', ['newStyle'], gutil.noop)).ok;
      should(originalTaskFn.calledWith('nstyle', ['newStyle'], gutil.noop)).ok;
      should(gulp.tasks.newStyle.help).eql(undefined);
    });

    it('with aliases no help no deps', function () {
      gulp.task('newStyle', gutil.noop, { aliases: ['new-style', 'nstyle'] });
      should(originalTaskFn.callCount).eql(5);
      should(originalTaskFn.calledWith('newStyle', gutil.noop)).ok;
      should(originalTaskFn.calledWith('new-style', ['newStyle'], gutil.noop)).ok;
      should(originalTaskFn.calledWith('nstyle', ['newStyle'], gutil.noop)).ok;
      should(gulp.tasks.newStyle.help).eql('Aliases: new-style, nstyle');
    });
  });

  describe('should throw error on error cases', function () {

    function shouldThrowGulpPluginError(func) {
      (function () {
        func();
      }).should.throw(/^Unexpected arg types/);
    }

    beforeEach(function () {
      gulp = sinon.stub({task: gutil.noop, tasks: { help: {}, aTask: {} }});
      originalTaskFn = gulp.task;
      gulpHelp(gulp);
      should(originalTaskFn.calledTwice).ok;
    });

    it('with no args given', function () {
      shouldThrowGulpPluginError(function() {
        gulp.task();
      });
    });

    it('with null as second arg', function () {
      shouldThrowGulpPluginError(function() {
        gulp.task('aTask', null);
      });
    });

    it('with null deps', function () {
      shouldThrowGulpPluginError(function() {
        gulp.task('aTask', null, null, gutil.noop);
      });
    });

    it('with null fn', function () {
      shouldThrowGulpPluginError(function() {
        gulp.task('aTask', ['dep'], null);
      });
    });

    it('with help text but null fn', function () {
      shouldThrowGulpPluginError(function() {
        gulp.task('aTask', 'help text', null);
      });
    });

  });

});