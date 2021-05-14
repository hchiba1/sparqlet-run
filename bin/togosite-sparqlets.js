#!/usr/bin/env node
const program = require('commander');
const syncRequest = require('sync-request');

program
  .option('-q, --quit', 'show URI and quit')
  .option('-d, --debug', 'debug')
  .option('-v, --verbose', 'verbose')
  .arguments('<ARG>')
  .parse(process.argv);

const opts = program.opts();

const uri = 'https://raw.githubusercontent.com/dbcls/togosite/develop/config/togosite-human/properties.json';

if (uri) {
  if (opts.quit) {
    console.log(uri);
  } else {
    const json = syncRequest('GET', uri).getBody('utf8');
    if (opts.debug) {
      console.log(json);
    } else {
      printList(json);
    }
  }
}

function printList(json) {
  JSON.parse(json).forEach((subj) => {
    if (opts.verbose) {
      console.log('[[' + subj.subject + ']]');
    }
    subj.properties.forEach((prop) => {
      const sparqlet_name = prop.data.replace(/.*\//, '');
      if (opts.verbose) {
        console.log(`${prop.label}\t${sparqlet_name}`);
      } else {
        console.log(sparqlet_name);
      }
    });
    if (opts.verbose) {
      console.log();
    }
  });
}
