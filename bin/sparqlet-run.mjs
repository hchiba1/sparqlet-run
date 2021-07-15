#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import program from 'commander';
import syncRequest from 'sync-request';
import columnify from 'columnify';
import csvParse from 'csv-parse/lib/sync.js';
import SPARQLet from '../lib/sparqlet.mjs';

program
  .option('-e, --endpoint <ENDPOINT>', 'change target endpoint')
  .option('-n, --iteration <NUM>', 'number of iterations for test')
  .option('--trace', 'output traces')
  .option('--tsv', 'output in tsv')
  .option('-c, --column', 'align columns of tsv')
  .option('-d, --debug', 'show internal SPARQLet object')
  .option('-t, --title', 'show title')
  .option('-s, --show-ep', 'show target endpoint')
  .option('-q, --query <IDs>', 'set queryIds')
  .option('--id', 'set mode=idList')
  .option('--obj', 'set mode=objList')
  .option('-p, --params', 'show parameters')
  .option('--ex', 'show parameters example')
  .option('--p1', 'categoryIds=...')
  .option('--p2', 'mode=idList categoryIds=...')
  .option('--p3', 'mode=objectList queryIds=...')
  .option('--p4', 'mode=objectList queryIds=... categoryIds=...')
  .option('--p3multi', 'mode=objectList queryIds=...,...')
  .option('--p4multi', 'mode=objectList queryIds=...,... categoryIds=...')
  .option('--github', 'use markdown on GitHub')
  .option('--url', 'for debugging --github option')
  .option('--md', 'for debugging --github option')
  .arguments('<sparlqet.md> [param=val]')
  .parse(process.argv);

if (program.args.length < 1) {
  program.help();
}
const opts = program.opts();

try {
  const markdownFile = program.args[0];
  const name = path.basename(markdownFile).replace(/\.md$/, '');
  let markdown;
  let pathPrefix = null;
  let mtime = null;
  if (opts.github) {
    const repository = 'biosciencedbc/togosite-sparqlist';
    const branch = 'main';
    const url = `https://raw.githubusercontent.com/${repository}/${branch}/repository/${markdownFile}`
    if (opts.url) {
      console.log(url);
      process.exit(0);
    }
    markdown = syncRequest('GET', url).getBody('utf8');
    if (opts.md) {
      console.log(markdown);
      process.exit(0);
    }
  } else {
    markdown = await fs.readFile(markdownFile, 'utf8');
    pathPrefix = path.dirname(markdownFile) + '/';
    const stat = await fs.lstat(markdownFile);
    mtime = stat.mtime;
  }
  let sparqlet = SPARQLet.load(name, markdown, pathPrefix, mtime)
  let params = {};
  if (program.args.length > 1) {
    const paramArr = program.args.slice(1);
    paramArr.forEach((param) => {
      const matched = param.match(/^(\S+?)=(.*)$/);
      if (matched) {
        let [, p, v] = matched;
        params[p] = v;
      } else if (!('categoryIds' in params)) {
        params['categoryIds'] = param;
      }
    });
  }
  if (opts.query != null) {
    params['queryIds'] = opts.query;
  }
  if (opts.id) {
    params['mode'] = 'idList';
  }
  if (opts.obj) {
    params['mode'] = 'objectList';
  }
  if (opts.endpoint) {
    let endpoint = opts.endpoint;
    if (!/^(http|https):\/\//.test(endpoint)) {
      const dirname = path.dirname(new URL(import.meta.url).pathname);
      const endpointsList = `${dirname}/../etc/endpoints`;
      const endpointsMap = await readEndpoints(endpointsList);
      if (!endpointsMap[endpoint]) {
        console.error(`${endpoint}: no such endpoint`);
        process.exit(1);
      }
      endpoint = endpointsMap[endpoint];
    }
    sparqlet.procedures.forEach((elem) => {
      if (elem.type === 'sparql') {
        elem.endpoint = endpoint;
      }
    });
  }
  opts.title && console.log(sparqlet.title);
  if (opts.showEp) {
    sparqlet.procedures.forEach((elem) => {
      if (elem.type === 'sparql') {
        console.log(elem.endpoint + '\t' + sparqlet.name);
      } else if (elem.type === 'javascript') {
        elem.data.split('\n').forEach((line) => {
          const matched = line.match(/^ +\w.+(https?:\/\/\S+\/sparqlist\S+api\/(\w+))/);
          if (matched) {
            const [, url, name] = matched;
            console.log(url + '\t' + sparqlet.name);
          }
        });
        console.log(urls);
      }
    });
  }
  if (opts.params) {
    console.log(sparqlet.params.map((param) => param.name).join('\t'));
  }
  if (opts.ex) {
    console.log(JSON.stringify(sparqlet.params, null, 2));
  }
  if (opts.p1) {
    sparqlet.params.forEach((param) => {
      if (param.name === 'categoryIds') {
        params['categoryIds'] = extractFirstParam(param);
      }
    });
    if (opts.debug) {
      console.log(JSON.stringify(params, null, 2));
      process.exit(0);
    }
  }
  if (opts.p2) {
    sparqlet.params.forEach((param) => {
      if (param.name === 'categoryIds') {
        params['categoryIds'] = extractFirstParam(param);
      }
    });
    params['mode'] = 'idList';
    if (opts.debug) {
      console.log(JSON.stringify(params, null, 2));
      process.exit(0);
    }
  }
  if (opts.p3) {
    sparqlet.params.forEach((param) => {
      if (param.name === 'queryIds') {
        params['queryIds'] = extractFirstParam(param);
        params['mode'] = 'objectList';
      }
    });
    if (opts.debug) {
      console.log(JSON.stringify(params, null, 2));
      process.exit(0);
    }
  }
  if (opts.p3multi) {
    sparqlet.params.forEach((param) => {
      if (param.name === 'queryIds') {
        params['queryIds'] = extractParams(param);
        params['mode'] = 'objectList';
      }
    });
    if (opts.debug) {
      console.log(JSON.stringify(params, null, 2));
      process.exit(0);
    }
  }
  if (opts.p4) {
    sparqlet.params.forEach((param) => {
      if (param.name === 'queryIds') {
        params['queryIds'] = extractFirstParam(param);
        params['mode'] = 'objectList';
      }
      if (param.name === 'categoryIds') {
        params['categoryIds'] = extractFirstParam(param);
      }
    });
    if (opts.debug) {
      console.log(JSON.stringify(params, null, 2));
      process.exit(0);
    }
  }
  if (opts.p4multi) {
    sparqlet.params.forEach((param) => {
      if (param.name === 'queryIds') {
        params['queryIds'] = extractParams(param);
        params['mode'] = 'objectList';
      }
      if (param.name === 'categoryIds') {
        params['categoryIds'] = extractFirstParam(param);
      }
    });
    if (opts.debug) {
      console.log(JSON.stringify(params, null, 2));
      process.exit(0);
    }
  }
  if (opts.debug) {
    console.log(sparqlet);
  }
  if (opts.debug || opts.showEp || opts.title || opts.params || opts.ex) {
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
    console.log(JSON.stringify(ret.results, null, 2));
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
    let header = ['total'];
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
  
  let out = [`${ret.elapsed} ms`];
  if (opts.trace) {
    ret.traces.forEach((trace) => {
      out.push(`${trace.elapsed} ms`);
    });
  }
  console.log(out.join('\t'));
}

async function readEndpoints(file) {
  const text = await fs.readFile(file, 'utf8');
  let endpointsMap = {};
  text.split('\n').forEach((line) => {
    const fields = line.split(/\s+/);
    if (fields.length > 1 && !/^ *#/.test(line)) {
      endpointsMap[fields[0]] = fields[1];
    }
  });
  return endpointsMap;
}

function extractFirstParam(param) {
  if (param.example) {
    return param.example.split(' ')[0].split(',')[0];
  } else {
    return param.default;
  }
}

function extractParams(param) {
  return param.example.split(' ')[0].split(',').filter(x => x).join(',');
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
