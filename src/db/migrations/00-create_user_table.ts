import Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('user', (table) => {
		table.bigIncrements('id').primary();
		table.string('email', 512).unique().notNullable();
		table.string('passwordHash', 512).notNullable();
		table.boolean('enabled').notNullable();
		table.timestamp('minJwtIat').notNullable().defaultTo(knex.fn.now());
		table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable('user');
}
