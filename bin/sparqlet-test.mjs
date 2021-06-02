#!/usr/bin/env node

import fs from 'fs';
import program from 'commander';
import { spawnSync } from 'child_process';
import csvWriter from 'csv-write-stream';
import ls from 'ls';
import path from 'path';

const readFile = (path) => fs.readFileSync(path, 'utf8').toString();

program
  .option('-n, --iteration <ITERATION_NUM>', 'number of iteration of measurement', 1)
  .option('-d, --delimiter <DELIMITER>', 'delimiter of output', '\t')
  .option('-e, --endpoint <ENDPOINT>', 'url of target endpoint')
  .option('-s, --skip_comparison', 'skip comparison with expected result')
  .option('--sec', 'output in "sec" (default: in "ms")')
  .option('--output_error', 'output to stderr')
  .option('-a, --average', 'calculate average')
  .option('-v, --verbose', 'output progress to stderr')
  .arguments('[json_or_queries...]')
  .parse(process.argv);

if (program.args.length < 1) {
  program.help();
}

const opts = program.opts();

let benchmarks = [];
for (let arg of program.args) {
  if (arg.endsWith('.json')) {
    benchmarks = benchmarks.concat(JSON.parse(readFile(arg)));
    process.chdir(path.dirname(arg));
  } else {
    benchmarks.push({ query: arg });
  }
}

let header = ['name', 'time'];
if (opts.average) {
  header.push('average');
}
if (!opts.skip_comparison) {
  header.push('valid');
}

let writer = csvWriter({ separator: opts.delimiter, newline: '\n', headers: header, sendHeaders: true });
writer.pipe(process.stdout);

for (let benchmark of benchmarks) {
  const queries = ls(benchmark.query);
  if (queries.length === 0) {
    console.error(`Warning: Query "${benchmark.query}" is specified but no matched files are found.`);
  }
  for (let file of queries) {
    let expected = null;
    const defaultExpectedName = file.full.replace(/\.[^/.]+$/, '') + '.txt';
    if (!opts.skip_comparison) {
      if (!benchmark.expected && fs.existsSync(defaultExpectedName)) {
        expected = readFile(defaultExpectedName);
      } else if (benchmark.expected) {
        let files = ls(benchmark.expected);
        const basename = path.basename(defaultExpectedName);
        if (files.length == 1) {
          expected = readFile(files[0].full);
        } else {
          const matched = files.find((file) => file.file === basename);
          if (matched) {
            expected = readFile(matched.full);
          }
        }
      }
    }
    measureQuery(file.full, expected);
  }
}
writer.end();

function measureQuery(queryPath, expected) {
  let row = { name: queryPath };
  let times = [];
  let validations = [];
  if (opts.verbose) console.error(queryPath);
  for (let i = 0; i < opts.iteration; i++) {
    let column = (i + 1).toString();
    if (opts.verbose) console.error(`query: ${column}`);
    let args = [queryPath];
    if (opts.endpoint) {
      args = args.concat(['--endpoint', opts.endpoint]);
    }
    let result = spawnSync('sparqlet-run', args, { maxBuffer: Infinity });
    if (result.status) {
      // error
      console.error(result.stderr.toString());
      times.push('null');
      validations.push('null');
    } else {
      let matched = result.stderr.toString().match(/(\d+) ms/);
      if (matched) {
        let time = matched[1];
        if (opts.sec) {
          time = time / 1000;
        }
        times.push(time);
        if (!expected) {
          validations.push('null');
        } else if (expected === result.stdout.toString()) {
          validations.push('true');
        } else {
          validations.push('false');
          if (opts.output_error) {
            console.error(result.stdout.toString());
          }
        }
      } else {
        times.push('null');
        validations.push('null');
      }
      if (opts.verbose) console.error(`time: ${times[times.length - 1]}, valid: ${validations[validations.length - 1]}`);
    }
  }
  row['time'] = times.join(',');
  if (!opts.skip_comparison) {
    row['valid'] = validations.join(',');
  }
  if (opts.average) {
    let validTimes = times.filter((time) => time !== 'null');
    const average = validTimes.map((t) => parseInt(t)).reduce((a, b) => a + b, 0) / validTimes.length;
    row['average'] = average.toString();
  }
  writer.write(row);
}
