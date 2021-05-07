const config = {
	client: 'postgresql',
	connection: {
		host: process.env.DB_HOST,
		database: process.env.DB_NAME,
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
	},
	debug: ['development', 'test'].includes(process.env.NODE_ENV),
	pool: {
		min: 2,
		max: 10,
	},
	migrations: {
		tableName: '_migrations',
		loadExtensions: ['.js'],
		directory: './build/db/migrations',
	},
	seeds: {
		directory: './build/db/seeds',
		loadExtensions: ['.js'],
	},
};

module.exports = {
	development: config,
	test: config,
	staging: config,
	production: config,
};
