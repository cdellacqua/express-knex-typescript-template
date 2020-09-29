import { config } from '@cdellacqua/knex-transact';
import knex from '../db';

config.knexInstance = knex;
