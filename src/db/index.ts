import { knex } from 'knex';
import config from '../config';

// eslint-disable-next-line
const knexFile = require('../../knexfile.js');

const knexInstance = knex(knexFile[config.environment]);

export default knexInstance;
