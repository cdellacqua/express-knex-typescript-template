# express-knex-typescript-template

This template can be used to quickly scaffold a project based on express, knex and typescript.
It provides a JWT-based authorization mechanism out-of-the-box and a PostgreSQL docker container to easily setup a development database.

## Setup

Running the following command will clone this template into `my-awesome-project`, install all its dependencies and setup the application
```
npx degit cdellacqua/express-knex-typescript-template my-awesome-project
cd my-awesome-project
npm i
npm run setup
```

This app reads its environment variables from a .env file, a .env.example is provided.
The `npm run setup` command will copy the content of the .env.example and replace the SECRET variable with a cryptographically-safe random string.
Moreover, the setup script will also rename the package name in both package.json and package-lock.json

_Note: never add the .env file to git or any other version control system. It's meant to be a local file with custom configurations relative to the machine where the app runs_

## npm run ...

This template provides a set of useful scripts that can be called using the `npm run <script>` syntax.
These scripts are:
- test: tests the application using [mocha](https://www.npmjs.com/package/mocha) and [chai](https://www.npmjs.com/package/chai)
- test:prepare: prepares the application for the test, for example, by reinitializing the local development database
- build: runs the typescript compiler to build your application
- start: starts a node process that will execute this package
- dev: starts nodemon in watch mode, this way you can edit your source ts files without having to rebuild and restart the application manually
- lint: runs eslint
- lint:fix: runs eslint with the --fix flag
- migrate: builds the project and run all the migrations under src/db/migrations
- seed: builds the project and run all the seeds under src/db/seeds
- migrate-seed: migrates and seeds, without building twice
- setup: runs the setup.js script described below

## Project structure

At the top level directory you can find the following files and folders:

- postgres: contains Dockerfile that describes a postgres docker image, used to setup a development database
- src: contains all the typescript source code
	- db:
		- migrations: contains knex migration scripts
			- 00-create_user_table.ts: creates a basic `user` table containing common columns, you can extend it or, if your application doesn't need users, you can delete this file
		- seeds: contains knex seed files for development and testing purposes
			- 00-setup.ts: includes the application startup code (see below) that enables you to safely call any function/instantiate any class
			- 01-user.ts: contains a simple seed that adds one user to the database
		- index.ts: exports the knex instance configured using the process.env.NODE_ENV variable
		- utils.ts: contains a set of useful functions that can be used to easily create common I/O mechanism with the database
	- helpers:
		- lambdas.ts: contains a set of simple lambdas
		- validator.ts: exports a middleware that can be used along with express-validator to automatically reject requests that do not pass all the validation steps
	- http:
		- error.ts: a custom Error class that is used to immediately stop a request and return a status code and a message to the client
	- log:
		- logger.ts: configure and exports a logger based on the [winston](https://www.npmjs.com/package/winston) library
	- routes: contains all the exposed end points of the application, you can choose the structure that better fits your needs. This template provides a simple structure based on multiple express routers that are registered hierarchically, following the directory structure
		- api: contains all routes that go under /api
			- authenticated: contains all the routes only authorized users can access with a valid JWT
				- _middleware.ts: contains a basic authorization middleware that should fit most use-cases, you can customize it if you need to
				- goodbye.ts: example authorized route
				- index.ts: registers the routes of this directory and exports the express router object
				- user.ts: contains a route that can be used by the client to renew its JWT if the one it has is near its expiration
			- hello.ts: contains a simple example route
			- index.ts: registers the routes of this directory and exports the express router object
			- user.ts: contains an authentication route for the client
		- ssr: contains all routes that respond to the client with pre-rendered HTML content
			- hello.ts: contains an example of server-side rendering
			- index.ts: registers the routes of this directory and exports the express router object
		- index.ts: registers the routes of this directory and exports the express router object
	- services: contains all the services of your application. What "service" means to you depends on how much abstraction you want to put in your code, in this template a service is intended as a class containing methods that are needed to communicate with the database or, more in general, that manages the appliation logic
		- user.ts: service that manages basic user logic
	- startup: contains scripts that needs to be executed during the application initialization
		- index.ts: calls all the scripts in this directory
		- transact.ts: setups the knex-transact library
		- tsyringe.ts: registers classes in tsyringe that will be injected when calling container.resolve
	- types: contains custom data types
		- common.ts: contains simple custom data types
	- app.ts: contains the express app initialization code, including the registrations of routers and middlewares
	- config.ts: wraps environment variables in a typed object
	- index.ts: startup the express application and exports the HTTP server for external usage (for example: testing)
- tests: contains the tests scripts, based on mocha and chai
	- hello.test.ts: tests the example routes
	- user.test.ts: tests the user management routes
- views: contains all the `pug` files used to server-side render HTML pages
	- common: contains shared `pug` markup
		- layout.pug: a basic `pug` page with placeholders for head and main content
	- world.pug: example page that extends layout.pug and contains a paragraph
- www: contains static files that will be served to the client. By default these files are served under `/`, without any prefix. In development mode, these files are served by express, but once in production they should be served by a reverse-proxy like nginx to maximize performance
	- main.css: a simple example css file referenced by layout.pug
- .env: contains your environment variables
- .env.example: template for .env
- .eslintignore: contains a list of patterns/files that eslint should ignore
- .eslintrc.js: contains the eslint configuration
- .gitignore: what should and shouldn't be committed to git
- docker-compose.yml: describes the docker project (which by default consists only of the postgres container)
- setup.js: script that creates a .env file copying the content of .env.example and replaces the "SECRET" variable with a random string. It also renames the package (in package.json and package-lock.json) to reflect the name of the root directory of the project
- knexfile.js: contains the database connection settings for different environment (production, development and test)
- nodemon.json: contains the configuration of nodemon
- package-lock.json: contains the descriptions of all the installed packages
- package.json: describes this project, its dependencies and provides a set of useful scripts
- README.md: this file
- tsconfig.json: contains the configuration for the typescript compiler


## What's next

If you look for the word `TODO` in this project you'll find some places where your intervention could be needed to better fit the needs of your new project. Feel free to
modify anything you want!