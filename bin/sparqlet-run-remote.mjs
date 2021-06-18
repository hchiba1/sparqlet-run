#!/usr/bin/env node
import program from 'commander';
import syncRequest from 'sync-request';
import SPARQLet from '../lib/sparqlet.mjs';

program
  .option('-q, --quit', 'show URI and quit')
  .option('-d, --debug', 'debug')
  .arguments('<ARG>')
  .parse(process.argv);

const opts = program.opts();

let markdownFile = 'homologene_category.md';

const repository = 'https://raw.githubusercontent.com/biosciencedbc/togosite-sparqlist/main/repository';

const url = `${repository}/${markdownFile}`
if (opts.quit) {
  console.log(url);
  process.exit(0);
}

const markdown = syncRequest('GET', url).getBody('utf8');

try {
  const name = markdownFile.replace(/\.md$/, '');
  let sparqlet = SPARQLet.load(name, markdown, null, null)
  if (opts.debug) {
    console.log(sparqlet);
    process.exit(0);
  }
  
  let params = {};
  const ret = await sparqlet.execute(params);

  console.log(JSON.stringify(ret.results, null, 2));
  console.error(`${ret.elapsed} ms`)
} catch (error) {
  console.error(error.toString());
}
