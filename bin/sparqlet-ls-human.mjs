#!/usr/bin/env node
import program from 'commander';
import syncRequest from 'sync-request';

program
  .option('-j, --json', 'show config in JSON')
  .option('-b, --branch <branch>', 'branch', 'develop')
  .option('-d, --debug', 'show URI and quit')
  .option('--js', 'use jsdelivr instead of raw.githubusercontent')
  .parse(process.argv);

const opts = program.opts();

let uri = `https://raw.githubusercontent.com/togodx/togodx-config-human/${opts.branch}/config/`;
if (opts.js) {
  uri = `https://cdn.jsdelivr.net/gh/dbcls/togosite@${opts.branch}/config/togosite-human/`;
}
uri += 'attributes.dx-server.json';

if (opts.debug) {
  console.log(uri);
} else {
  const json = syncRequest('GET', uri).getBody('utf8');
  if (opts.json) {
    process.stdout.write(json);
  } else {
    printAttributes(json);
  }
}

function printAttributes(json) {
  const obj = JSON.parse(json);
  obj.categories.forEach((category) => {
    console.log();
    console.log(`== ${category.label} ==`);
    category.attributes.forEach((attrId) => {
      const attr = obj.attributes[attrId];
      console.log(`${attr.dataset}\t${attrId}`);
    });
  });
}
