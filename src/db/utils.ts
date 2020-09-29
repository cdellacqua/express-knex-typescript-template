import { transact } from '@cdellacqua/knex-transact';
import { SerializableError } from '@cdellacqua/serializable-error';
/* eslint-disable no-underscore-dangle */
import { Transaction, QueryBuilder } from 'knex';
import knex from '.';

export function insertGetIds<T>(query: QueryBuilder): Promise<T[]> {
	return query.returning<T[]>('id');
}

export async function insertGetId<T>(query: QueryBuilder): Promise<T> {
	const ids = await insertGetIds<T>(query);
	if (ids.length === 0) {
		throw new SerializableError('returned 0 rows');
	}
	return ids[0];
}

export async function selectId<T>(query: QueryBuilder): Promise<T> {
	return (await query.pluck<T[]>('id'))[0];
}

export function createMultiGenerator<TSave, TEntity>(
	createOne: (value: TSave, trx?: Transaction) => Promise<TEntity>,
) {
	return async (saveValues: TSave[], trx?: Transaction): Promise<TEntity[]> => {
		if (saveValues.length > 0) {
			const entries: TEntity[] = [];
			await transact(
				saveValues.map(
					(value) => (_trx) => createOne(value, _trx)
						.then((entry) => entries.push(entry)),
				),
				trx,
			);
			return entries;
		}

		return [];
	};
}

export function createMultiGeneratorWithKey<TKey, TSave, TEntity>(
	createOne: (key: TKey, value: TSave, trx?: Transaction) => Promise<TEntity>,
) {
	return async (saveValues: { key: TKey, data: TSave }[], trx?: Transaction): Promise<TEntity[]> => {
		if (saveValues.length > 0) {
			const entries: TEntity[] = [];
			await transact(
				saveValues.map(
					(value) => async (_trx) => createOne(value.key, value.data, _trx)
						.then((entry) => entries.push(entry)),
				),
				trx,
			);
			return entries;
		}

		return [];
	};
}

export function findOneGenerator<TFilter = Record<string, any> | string | number, TEntity = object>(
	table: string,
	columns: string[],
	rowToEntity: (row: any, trx?: Transaction) => Promise<TEntity>,
) {
	return async (filter: TFilter, trx?: Transaction): Promise<TEntity | undefined> => {
		const query = trx?.queryBuilder() || knex.queryBuilder();
		const row = await query.table(table)
			.where(
				typeof filter === 'object' ? filter : { id: filter },
			)
			.first(columns);
		return row ? rowToEntity(row, trx) : undefined;
	};
}

export function findFirstsGenerator<TFilter = Record<string, any> | string | number, TEntity = object>(
	table: string,
	columns: string[],
	rowToEntity: (row: any, trx?: Transaction) => Promise<TEntity>,
) {
	return async (filters: TFilter[], trx?: Transaction): Promise<TEntity[]> => {
		if (filters.length > 0) {
			const query = trx?.queryBuilder() || knex.queryBuilder();
			const rows: any[] = await filters.reduce<QueryBuilder>((_query, filter) => _query.unionAll(function findSingle() {
				return this.table(table)
					.where(
						typeof filter === 'object' ? filter : { id: filter },
					)
					.limit(1)
					.select(columns);
			}, true), query);
			if (rows.length !== filters.length) {
				throw new SerializableError('unable to find all the rows');
			}
			return Promise.all(rows.map((row: any) => rowToEntity(row, trx)));
		}
		return [];
	};
}

export function findMultiGenerator<TFilter = Record<string, any> | string | number, TEntity = object>(
	table: string,
	columns: string[],
	rowToEntity: (row: any, trx?: Transaction) => Promise<TEntity>,
) {
	return async (filters: TFilter[], trx?: Transaction): Promise<TEntity[]> => {
		if (filters.length > 0) {
			const query = trx?.queryBuilder() || knex.queryBuilder();
			const rows: any[] = await filters.reduce<QueryBuilder>((_query, filter) => _query.unionAll(function findSingle() {
				return this.table(table)
					.where(
						typeof filter === 'object' ? filter : { id: filter },
					)
					.select(columns);
			}, true), query);

			return Promise.all(rows.map((row: any) => rowToEntity(row, trx)));
		}
		return [];
	};
}

export function findGroupedMultiGenerator<TFilter = Record<string, any> | string | number, TEntity = object>(
	table: string,
	columns: string[],
	rowToEntity: (row: any, trx?: Transaction) => Promise<TEntity>,
) {
	return async (filters: TFilter[], orderBy?: {column: string; order: 'asc'|'desc'}[], trx?: Transaction): Promise<TEntity[][]> => {
		if (filters.length > 0) {
			const query = trx?.queryBuilder() || knex.queryBuilder();
			const rows: any[] = await filters.reduce<QueryBuilder>((_query, filter, index) => _query.unionAll(function findSingle() {
				return this.table(table)
					.where(
						typeof filter === 'object' ? filter : { id: filter },
					)
					.select(...columns, knex.raw('? as "_group_"', [index]));
			}, true), query).orderBy(orderBy ?? []);

			const groups = rows.reduce((gs: any[][], row) => {
				const groupIndex = Number(row._group_);
				// eslint-disable-next-line no-param-reassign
				delete row._group_;
				// eslint-disable-next-line no-param-reassign
				gs[groupIndex].push(row);

				return gs;
			}, new Array(filters.length).fill(0).map(() => []));

			return Promise.all(
				groups.map(
					(g) => Promise.all(
						g.map((row) => rowToEntity(row, trx)),
					),
				),
			);
		}
		return [];
	};
}

export function findAllGenerator<TFilter = Record<string, any> | string | number, TEntity = object>(
	table: string,
	columns: string[],
	rowToEntity: (row: any, trx?: Transaction) => Promise<TEntity>,
) {
	return async (filter: TFilter, orderBy?: {column: string; order: 'asc'|'desc'}[], trx?: Transaction): Promise<TEntity[]> => {
		const query = trx?.queryBuilder() || knex.queryBuilder();
		const rows: any[] = await query.table(table)
			.where(
				typeof filter === 'object' ? filter : { id: filter },
			)
			.orderBy(orderBy ?? [])
			.select(columns);

		return Promise.all(rows.map((row: any) => rowToEntity(row, trx)));
	};
}

export function fromQueryGenerator<TEntity = object>(
	columns: string[],
	rowToEntity: (row: any, trx?: Transaction) => Promise<TEntity>,
) {
	return async (query: QueryBuilder, trx?: Transaction): Promise<TEntity[]> => {
		const rows: any[] = await query.select(columns);
		return Promise.all(rows.map((row: any) => rowToEntity(row, trx)));
	};
}
