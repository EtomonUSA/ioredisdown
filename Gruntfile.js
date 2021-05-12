const { cp, rm } = require('shelljs');

module.exports = function(grunt) {
  let pkg = grunt.file.readJSON('package.json');
  grunt.initConfig({
    pkg,
    typedoc: {
      build: {
        options: {
          out: './docs',
          name: pkg.name
        },
        src: ['./src/**/*']
      }
    },
    ts: {
      ioredisdown : {
        outDir: "./lib",
        tsconfig: './tsconfig.json'
      },
      options: {
        "rootDir": "./src"
      }
    }
  });

  grunt.registerTask('clean', function () {
    rm('-rf', './docs/* ./lib/*')
  });


  grunt.registerTask('extraDocStuff', function () {
    cp("-r", "./.docs/.*", "./.docs/*", "./docs");
  });

  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-typedoc');
  grunt.registerTask('docs', ['extraDocStuff', 'typedoc']);
  grunt.registerTask('default', [ 'clean', 'ts:ioredisdown', 'docs' ]);

};
