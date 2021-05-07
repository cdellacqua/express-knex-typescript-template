/* eslint-disable import/first */
// eslint-disable-next-line
const knexfile = require('../../knexfile.js');

import { knex } from 'knex';
import config from '../config';


const knexInstance = knex(knexfile[config.environment]);

export default knexInstance;
