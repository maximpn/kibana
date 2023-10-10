/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

require('../../../../../src/setup_node_env');
const { clear } = require('@kbn/openapi-generator');
const { resolve } = require('path');

const SECURITY_SOLUTION_ROOT = resolve(__dirname, '../..');

clear({ rootDir: SECURITY_SOLUTION_ROOT });
