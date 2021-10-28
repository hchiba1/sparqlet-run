#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import program from 'commander';
import syncRequest from 'sync-request';
import SPARQLet from '../lib/sparqlet.mjs';

program
  .option('-A, --aggregate', 'show SPARQLets for aggregate')
  .option('-M, --metastanza', 'show SPARQLets for metastanza')
  .option('-t, --title', 'title')
  .option('-s, --show-ep', 'show target endpoint')
  .option('-j, --json', 'show config in JSON')
  .option('-v, --verbose', 'verbose')
  .option('-b, --branch <branch>', 'branch', 'develop')
  .option('-d, --debug', 'show URI and quit')
  .option('--js', 'use jsdelivr instead of raw.githubusercontent')
  .parse(process.argv);

const opts = program.opts();

let uri = `https://raw.githubusercontent.com/togodx/togodx-config-human/${opts.branch}/config/`;
if (opts.js) {
  uri = `https://cdn.jsdelivr.net/gh/dbcls/togosite@${opts.branch}/config/togosite-human/`;
}
if (opts.aggregate) {
  uri += 'aggregate.json';
} else if (opts.metastanza) {
  uri += 'templates.json';
} else {
  uri += 'properties.server.json';
}

if (opts.debug) {
  console.log(uri);
} else {
  const json = syncRequest('GET', uri).getBody('utf8');
  if (opts.json) {
    process.stdout.write(json);
  } else {
    if (opts.aggregate) {
      printAggregateSparqlets(json);
    } else if (opts.metastanza) {
      printMetastanza(json);
    } else {
      printList(json);
    }
  }
}

function printAggregateSparqlets(json) {
  const obj = JSON.parse(json);
  Object.entries(obj).forEach(([key, val]) => {
    const url = val.url;
    const name = url.replace('https://integbio.jp/togosite/sparqlist/api/', '');
    console.log(name);
  });  
}

function printMetastanza(json) {
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

  function extractUrl(html) {
    const lines = html.split('\n');
    lines.forEach((line) => {
      if (/(http|https):\/\//.test(line)) {
        console.log(line.trim().replace(/^.*\/api\//, '').replace('?', ' ?'));
      }
    });
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
        // outputTitle(`${sparqlet_name}.md`, prop.label);
      } else if (opts.showEp) {
        outputEndpoint(`${sparqlet_name}.md`);
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

async function outputTitle(markdownFile, label) {
  const name = path.basename(markdownFile).replace(/\.md$/, '');
  const pathPrefix = path.dirname(markdownFile) + '/';
  const stat = await fs.lstat(markdownFile);
  const markdown = await fs.readFile(markdownFile, 'utf8');

  let sparqlet = SPARQLet.load(name, markdown, pathPrefix, stat.mtime)
  console.log(`${label}\t${name}\t${sparqlet.title}`);
}

async function outputEndpoint(markdownFile) {
  const name = path.basename(markdownFile).replace(/\.md$/, '');
  const pathPrefix = path.dirname(markdownFile) + '/';
  const stat = await fs.lstat(markdownFile);
  const markdown = await fs.readFile(markdownFile, 'utf8');

  let sparqlet = SPARQLet.load(name, markdown, pathPrefix, stat.mtime)
  sparqlet.procedures.forEach((elem) => {
    if (elem.type === 'sparql') {
      console.log(elem.endpoint + '\t' + sparqlet.name);
    } else if (elem.type === 'javascript') {
      const matched = elem.data.match(new RegExp('https://\\S+/sparqlist\\S+api/\\w+', 'g'));
      if (matched) {
        matched.forEach((url) => {
          console.log(url + '\t' + sparqlet.name);
        });
      }
    }
  });
}
