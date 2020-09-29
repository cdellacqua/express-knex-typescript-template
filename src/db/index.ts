import Knex from 'knex';
import config from '../config';

// eslint-disable-next-line
const knexfile = require('../../knexfile.js');

const knex = Knex(knexfile[config.environment]);

export default knex;
