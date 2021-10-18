# express-knex-typescript-template

A template that can be used to quickly scaffold a project based on express, knex and typescript.

Buzzwords ...or... What technologies does this project use:
- Docker: Linux container runtime
- docker-compose: command line tool that manages multi-container projects
- PostgreSQL: SQL Database
- Knex.js: Query Builder library
- Mocha & Chai: Testing framework and assertion library
- Nodemon: Node process manager, used for fast development
- TypeScript: JavaScript + Types = <3
- Pug: HTML/XML/Plain Text Template engine
- ESLint: linting library that enforces code style
- Express.js: HTTP server library that provides a middleware-based architecture
- JWT: Json Web Tokens, used for authorization/authentication purposes
- dotenv: library that imports environment variables from a `.env` file
- Morgan & Winston: Logging middleware and logging library
- bcrypt: cryptographic library used for hashing

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

## Quick start

Inside the project root directory open a shell and run:
- `docker-compose up -d` to start the PostgreSQL container
- `npm run build` to build the typescript source files
- `npm run migrate` to run all the pending migrations
- `npm run seed` to seed the database with test data
- `npm run dev` to start the project in development (watch) mode

When you add a new migration you'll need to rebuild the project before running the `migrate` script.

When you change the seeds (by adding, removing or modifying files) you'll need to reset the database to its initial state **before** running `npm run seed` again. You can achieve this by
recreating the docker containers (e.g. `docker-compose down && docker-compose up -d`) or by rolling back all the existing migrations and redoing them
again (e.g. `npm run migrate:down:all && npm run migrate`)

## npm run ...

This template provides a set of useful scripts that can be called using the `npm run <script>` syntax.
These scripts are:

- `knex`: knex cli wrapper that runs dotenv/config before instantiating knex
- `coverage`: runs tests computing code coverage
- `test`: tests the application using [mocha](https://www.npmjs.com/package/mocha) and [chai](https://www.npmjs.com/package/chai)
- `test:prepare`: prepares the application for the test script (it's invoked automatically by it), for example, by starting and reinitializing the local development database
- `build`: runs the typescript compiler to build the application
- `start`: starts a node process that will execute this package
- `dev`: starts nodemon in watch mode, this way you can edit your source .ts files without having to rebuild and restart the application manually
- `lint`: runs eslint
- `lint:fix`: runs eslint with the --fix flag
- `migrate`: runs all the (compiled) migrations under build/db/migrations
- `migrate:up`: runs the first (compiled) pending migration
- `migrate:down`: reverts the last (compiled) migration
- `migrate:down:all`: rolls back all (compiled) migrations
- `seed`: runs all the (compiled) seeds under build/db/seeds
- `setup`: runs the setup.js script described below
- `gen:secret`: regenerates the SECRET inside the .env file

## docker

This template includes a docker-compose.yml that is used to startup a PostgreSQL container. The following commands can be used to manage the containers:
- `docker-compose up -d`: starts the containers in detached mode, so they won't block your shell
- `docker-compose down`: stops and removes the containers, by default **removing also all the data**. To enable data persistence you just can uncomment some lines in docker-compose.yml as described in the file
- `docker-compose exec postgres psql -U default -d default`: logs your shell into the PostgreSQL CLI client of the container
- `docker-compose build`: rebuilds the containers, useful if you edit the Dockerfile or to the init.sql script

## Project structure

At the top level directory you can find the following files and folders:

- `docker`: contains containers definition and configuration files
	- `postgres`: contains Dockerfile that describes a postgres docker image, used to setup a development database
- `public`: contains static files that will be served to HTTP clients. By default these files are served under `/`, without any prefix. In development mode, these files are served by express, but once in production they should be served by another application (e.g. nginx) to maximize performance
	- `main.css`: a simple example css file referenced by layout.pug (see below)
- `src`: contains all the typescript source code
	- `algebra`: contains some functional-programming related utilities
		- `functions`: contains some functions and function generators that help write less and more expressive code
	- `collection`:
		- `index.ts`: contains a set of utility functions that operate on arrays
	- `crypto`:
		- `index`: contains some basic cryptographically related functionalities
		- `url`: contains functions that enable signed urls and the related express middleware
	- `db`:
		- `migrations`: contains knex migration scripts
			- `00-create_user_table.ts`: creates a basic `user` table containing common columns, you can extend it or, if your application doesn't need users, you can delete this file
		- `seeds`: contains knex seed files for development and testing purposes
			- `00-setup.ts`: includes the application startup code (see below) that enables you to safely call any function/instantiate any class
			- `01-user.ts`: contains a simple seed that adds one user to the database
			- `99-tear-down.ts`: gracefully stops the application after all seeds have run
		- `index.ts`: exports the knex instance configured using the process.env.NODE_ENV variable
		- `utils.ts`: contains a set of useful functions that can be used to easily create common I/O mechanism with the database
	- `email`:
		- `index.ts`: exports functions that render and send emails
	- `http`:
		- `routes`: contains all the exposed end points of the application, you can choose the structure that better fits your needs. This template provides a simple structure based on multiple express routers that are registered hierarchically, mainly following the directory structure
			- `authenticated`: contains all the routes that are accessible by authenticated users only
				- `_middleware.ts`: contains a basic authentication/authorization middleware based on JWTs, you can customize it if you need to
				- `goodbye.ts`: example authorized route
				- `index.ts`: registers the routes of this directory and exports the express router object
				- `user.ts`: contains a route that can be used by the client to renew its JWT if the one it has is near its expiration
			- `index.ts`: registers the routes of this directory and exports the express router object
			- `user.ts`: contains an authentication route
		- `error.ts`: a custom Error class that is used to immediately stop a request and return a status code and a message to the client
		- `express-app.ts`: contains the express app initialization code, including the registrations of routers and middlewares
		- `server.ts`: exports a shutdownable (see below) HTTP server already initialized with the express application
		- `shutdown-server.ts`: adds socket tracking and manages the HTTP shutdown procedure
		- `status.ts`: exports enums for Http status codes
		- `validation.ts`: exports a middleware that can be used with express-validator to automatically reject requests that do not pass all the validation steps
	- `i18n`: contains basic internationalization code
		- `translations`: contains string translations based on locale
			- `en.ts`: contains english string translations
		- `index.ts`: exports a translation function generator (i.e. given a locale, it returns a function that translates a string to that locale) and other minor locale-related functionalities
	- `lifecycle`: contains scripts that needs to be executed during the application initialization and tear down
		- `index.ts`: exports the start and stop functions
	- `log`:
		- `logger.ts`: configure and exports a logger based on the [winston](https://www.npmjs.com/package/winston) library
	- `promise`: contains promise related functionalities
		- `parallel.ts`: exports functionalities which help deal with parallelism
	- `runtime`: contains runtime related functionalities
		- `delay.ts`: exports functions that helps manage delays between tasks
		- `index.ts`: exports common runtime functionalities
	- `services`: contains all the services of your application. What "service" means to you depends on how much abstraction you want to put in your code, in this template a service is intended as a module containing functions that are needed to communicate with the database or, more in general, that manages the application logic
		- `user.ts`: service that manages basic user logic
	- `types`: contains custom data types
		- `common.ts`: contains simple custom data types
	- `config.ts`: wraps environment variables in a typed object
	- `index.ts`: startup the express application and attaches listener to process termination signals to handle graceful shutdown
- `tests`: contains the tests scripts, based on mocha and chai
	- `crypto`: tests cryptographically related functionalities
		- `signed-urls.test.ts`: tests signed urls. These are URLs that contains an hash, the hash can then be verified against the URL itself to identify tampering attempts
	- `user`: contains tests about the user
		- `auth.test.ts`: tests the default authentication mechanism
		- `user-spy.test.ts`: example test that uses chai-spy to alter modules at runtime
		- `user.test.ts`: tests some functions that interacts with the user entity in the db
	- `_hooks.ts`: setup file that prepares the application for testing
	- `hello.test.ts`: tests the example routes
	- `jsconfig.json`: helps the IDE find the typings needed for the testing library
- `views`: contains all the `pug` files used to server-side render HTML pages
	- `emails`: contains the email views
		- `common`: contains shared `pug` markup
			- `layout.pug`: a basic `pug` template that is extended by the other views
			- `style.pug`: contains the style definition that will be inlined by pug directly in the html tags
		- `email-verification.plain.pug`: a plain text version of an example email address verification request
		- `email-verification.pug`: an HTML version of an example email address verification request
	- `pages`: contains the page views
		- `common`: contains shared `pug` markup
			- `layout.pug`: a basic `pug` page with placeholders for head and main content
		- `403.pug`: basic 403 error page you may customize
		- `404.pug`: basic 404 error page you may customize
		- `hello-world.pug`: example page that extends layout.pug and contains a paragraph
- `.editorconfig`: configures basic editor settings like indentation, end of line format and end of file newline
- `.env`: contains your (local) environment variables
- `.env.example`: template for .env
- `.eslintignore`: contains a list of patterns/files that eslint should ignore
- `.eslintrc.js`: contains the eslint configuration
- `.gitignore`: describes what should and shouldn't be committed to git
- `.mocharc.js`: initializes the testing library mocha
- `docker-compose.yml`: describes the docker project (which by default consists of a postgres container)
- `knexfile.js`: contains the database connection settings for different environment (production, development, staging and test)
- `nodemon.json`: specifies some rules for nodemon
- `package-lock.json`: keeps track of the exact version of all the installed dependencies
- `package.json`: describes this project, its dependencies and provides a set of useful scripts
- `README.md`: this file
- `scripts`
	- `setup.js`: script that creates a .env file copying the content of .env.example and replaces the "SECRET" variable with a random string. It also renames the package (in package.json and package-lock.json) to reflect the name of the root directory of the project
	- `gensecret.js`: script that generates a random "SECRET" in the .env file
- `tsconfig.json`: contains the configuration for the typescript compiler


## Deployment tips

When you deploy the application you have to take care of a few things:
- **environment variables**: on your production (or staging) machine you'll need to setup environment variables, these can be set using a local .env file as the one you have on your development machine or by setting environment variables in your system (globally) or in the process manager that spins up the application (e.g. systemd, docker-compose, ...)
- **database migrations**: when you deploy a new version of your application, you might also need to run some database migrations. All you'll have to do before restarting the application is running `npm run migrate` on your target machine


## What's next

If you look for the word `TODO` in this project you'll find some places where your intervention could be needed to better fit the needs of your new project. Feel free to
modify anything you want!
