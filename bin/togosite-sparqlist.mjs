#!/usr/bin/env node
import program from 'commander';
import syncRequest from 'sync-request';

program
  .option('-t, --title', 'title')
  .option('-j, --json', 'show config in JSON')
  .option('-v, --verbose', 'verbose')
  .option('-d, --debug', 'show URI and quit')
  .option('--js', 'use jsdelivr instead of raw.githubusercontent')
  .parse(process.argv);

const opts = program.opts();

let base_uri = 'https://raw.githubusercontent.com/dbcls/togosite/';
if (opts.js) {
  base_uri = 'https://cdn.jsdelivr.net/gh/dbcls/togosite@';
}
let version = 'develop';
const uri = `${base_uri}${version}/config/togosite-human/properties.json`;

if (opts.debug) {
  console.log(uri);
} else {
  const json = syncRequest('GET', uri).getBody('utf8');
  if (opts.json) {
    process.stdout.write(json);
  } else {
    printList(json);
  }
}

function printList(json) {
  JSON.parse(json).forEach((subj) => {
    if (opts.verbose) {
      console.log('[[' + subj.subject + ']]');
    }
    subj.properties.forEach((prop) => {
      const sparqlet_name = prop.data.replace(/.*\//, '');
      if (opts.title) {
        const title = getTitle(sparqlet_name);
        console.log(`${prop.label}\t${sparqlet_name}\t${title}`);
      } else if (opts.verbose) {
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

function getTitle(sparqlet_name) {
  const uri = 'https://integbio.jp/togosite/sparqlist/-api/sparqlets/' + sparqlet_name;

  const json = syncRequest('GET', uri).getBody('utf8');

  return JSON.parse(json).data.attributes.title;
}
