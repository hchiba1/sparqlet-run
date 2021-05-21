#!/usr/bin/env node
import program from 'commander';
import syncRequest from 'sync-request';

program
  .option('-l, --list', 'list names only')
  .option('-t, --title', 'title')
  .option('-d, --debug', 'debug')
  .option('-v, --verbose', 'verbose')
  .option('-q, --quit', 'show URI and quit')
  .option('--js', 'use jsDelivr')
  .arguments('<ARG>')
  .parse(process.argv);

const opts = program.opts();

let base_uri = 'https://raw.githubusercontent.com/dbcls/togosite/';
if (opts.jsDelivr) {
  base_uri = 'https://cdn.jsdelivr.net/gh/dbcls/togosite@';
}
let version = 'develop';
const uri = `${base_uri}${version}/config/togosite-human/properties.json`;

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

function printList(json) {
  JSON.parse(json).forEach((subj) => {
    if (! opts.list) {
      console.log('[[' + subj.subject + ']]');
    }
    subj.properties.forEach((prop) => {
      const sparqlet_name = prop.data.replace(/.*\//, '');
      if (opts.title) {
        const title = getTitle(sparqlet_name);
        console.log(`${prop.label}\t${sparqlet_name}\t${title}`);
      } else if (opts.list) {
        console.log(sparqlet_name);
      } else {
        console.log(`${prop.label}\t${sparqlet_name}`);
      }
    });
    if (! opts.list) {
      console.log();
    }
  });
}

function getTitle(sparqlet_name) {
  const uri = 'https://integbio.jp/togosite/sparqlist/-api/sparqlets/' + sparqlet_name;

  const json = syncRequest('GET', uri).getBody('utf8');

  return JSON.parse(json).data.attributes.title;
}
