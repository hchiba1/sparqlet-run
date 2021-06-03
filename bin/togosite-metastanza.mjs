#!/usr/bin/env node
import program from 'commander';
import syncRequest from 'sync-request';

program
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
const uri = `${base_uri}${version}/config/togosite-human/templates.json`;

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
  const obj = JSON.parse(json);
  const entries = Object.entries(obj.templates);
  entries.forEach(([key, url]) => {
    if (opts.verbose) {
      console.log(`[[${key}]]`);
      extractUrl(syncRequest('GET', url).getBody('utf8'));
      console.log();
    } else {
      extractUrl(syncRequest('GET', url).getBody('utf8'));
    }
  });  
}

function extractUrl(html) {
  const lines = html.split('\n');
  lines.forEach((line) => {
    if (/(http|https):\/\//.test(line)) {
      console.log(line.trim());
    }
  });
}
