#!/usr/bin/env node
const program = require('commander');

program
  .arguments('sparqlet')
  .parse(process.argv);

if (program.args.length == 0) {
  program.help();
}
