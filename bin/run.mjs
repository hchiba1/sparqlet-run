#!/usr/bin/env node
import _fs from 'fs';
import path from 'path';
import program from 'commander';

import SPARQLet from '../lib/sparqlet.mjs';

program
  .arguments('<ARG>')
  .parse(process.argv);

