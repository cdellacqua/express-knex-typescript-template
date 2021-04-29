import pg from 'pg';
import BigNumber from 'bignumber.js';

pg.types.setTypeParser(pg.types.builtins.NUMERIC, (decimal: string): BigNumber => new BigNumber(decimal));
