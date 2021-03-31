#!/usr/bin/env node
// import { promises as fs } from 'fs';
import fs from 'fs/promises';
import path from 'path';
import program from 'commander';
import columnify from 'columnify';
import csvParse from 'csv-parse/lib/sync.js';

import SPARQLet from '../lib/sparqlet.mjs';
import SPARQLetParser from '../lib/parser.mjs';

program
  .option('-e, --endpoint <ENDPOINT>', 'change target endpoint')
  .option('-n, --iteration <NUM>', 'number of iterations for test')
  .option('-t, --trace', 'output traces')
  .option('--tsv', 'output in tsv')
  .option('-c, --column', 'align columns of tsv')
  .option('-s, --show', 'show internal SPARQLet object')
  .arguments('<sparlqet.md> [param=val]')
  .parse(process.argv);

if (program.args.length < 1) {
  program.help();
}
const opts = program.opts();

try {
  const markdownFile = program.args[0];
  const name = path.basename(markdownFile).replace(/\.md$/, '');
  const pathPrefix = path.dirname(markdownFile) + '/';
  const stat = await fs.lstat(markdownFile);
  const markdown = await fs.readFile(markdownFile, 'utf8');
  let sparqlet = SPARQLet.load(name, markdown, pathPrefix, stat.mtime)
  let params = {};
  if (program.args.length > 1) {
    const paramArr = program.args.slice(1);
    paramArr.forEach((p) => {
      let [k, v] = p.split(/=(.+)/);
      if (v) {
        params[k] = v;
      }
    });
  }
  sparqlet.procedures.forEach((elem) => {
    if (elem.type === 'sparql') {
      if (opts.endpoint) {
        elem.endpoint = opts.endpoint;
      }
    }
  });
  if (opts.show) {
    console.log(sparqlet);
    process.exit(0);
  }
  if (opts.iteration) {
    for (let i = 0; i < opts.iteration; i++) {
      await measureTime(sparqlet, params, i);
    }
  } else {
    execOnce(sparqlet, params);
  }
} catch (error) {
  console.error(error.toString());
}

async function execOnce(sparqlet, params) {
  const ret = await sparqlet.execute(params);

  if (opts.column) {
    printTsv(jsonToTsv(ret.results), true);
  } else if (opts.tsv) {
    printTsv(jsonToTsv(ret.results));
  } else {
    console.log(ret.results);
  }

  if (opts.trace) {
    console.error(`total ${ret.elapsed} ms`)
    ret.traces.forEach((trace) => {
      if (trace.step.type === 'sparql') {
        console.error(`${trace.step.bindingName}:sparql ${trace.elapsed} ms`, );
      } else if (trace.step.type === 'javascript') {
        console.error(`${trace.step.bindingName}:js ${trace.elapsed} ms`, );
      } else {
        console.error(`${trace.step.bindingName} ${trace.elapsed} ms`, );
      }
    });
  } else {
    console.error(`${ret.elapsed} ms`)
  }
}
  
async function measureTime(sparqlet, params, i) {
  const ret = await sparqlet.execute(params);

  if (i === 0 && opts.trace) {
    let header = [];
    header.push('total');
    ret.traces.forEach((trace) => {
      if (trace.step.type === 'sparql') {
        header.push(`${trace.step.bindingName}:sparql`);
      } else if (trace.step.type === 'javascript') {
        header.push(`${trace.step.bindingName}:js`);
      } else {
        header.push(`${trace.step.bindingName}`);
      }
    });
    console.log(header.join('\t'));
  }
  
  let out = [];
  out.push(`${ret.elapsed} ms`);
  if (opts.trace) {
    ret.traces.forEach((trace) => {
      out.push(`${trace.elapsed} ms`);
    });
  }
  console.log(out.join('\t'));
}

function jsonToTsv(json) {
  if (typeof json[0] == 'object') {
    const keys = Object.keys(json[0]);
    let tsv = keys.join('\t') + '\n';
    tsv += json.map((line) => {
      return keys.map(key => line[key]).join('\t');
    }).join('\n');

    return tsv;
  } else {
    return json.join('\n');
  }
};

function printTsv(tsv, align_column = false) {
  if (align_column) {
    console.log(
      columnify(csvParse(tsv, { columns: true, delimiter: '\t', relax: true }), {
        // relax csvParse to accept "hoge"^^xsd:string
        showHeaders: true,
        headingTransform: (x) => x
      }).replace(/\s+$/gm, '')
    );
  } else {
    console.log(tsv);
  }
};
