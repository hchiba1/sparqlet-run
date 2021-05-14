#!/usr/bin/env node
const program = require('commander');
const syncRequest = require('sync-request');

program
  .option('-q, --quit', 'show URI and quit')
  .option('-r, --run', 'run')
  .option('-d, --debug', 'debug')
  .arguments('<ARG>')
  .parse(process.argv);

const opts = program.opts();

let sparqlet_name = 'homologene_category';
if (program.args.length >= 1) {
  sparqlet_name = program.args[0];
  sparqlet_name = sparqlet_name.replace(/\.md$/, '');
}

let uri = 'https://integbio.jp/togosite/sparqlist/-api/sparqlets/' + sparqlet_name;
if (opts.run) {
  uri = 'https://integbio.jp/togosite/sparqlist/api/' + sparqlet_name;
}
if (opts.quit) {
  console.log(uri);
  process.exit(0);
}

const json = syncRequest('GET', uri).getBody('utf8');

if (opts.run) {
  console.log(json);
  process.exit(0);
}

if (opts.debug) {
  console.log(json);
  process.exit(0);
}

process.stdout.write(JSON.parse(json).data.attributes.src);
