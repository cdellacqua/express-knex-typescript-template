const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');
const randomBytes = promisify(crypto.randomBytes);

const projectPath = path.join(__dirname, '..');
const projectName = path.basename(projectPath);

(async () => {
	const envPath = path.join(projectPath, '.env.example');
	const envContent = (await fs.promises.readFile(envPath)).toString();
	await fs.promises.writeFile(path.join(projectPath, '.env'), envContent.replace(/SECRET=[^\r\n]+/, `SECRET="${(await randomBytes(36)).toString('hex')}"`));
	console.info('created .env and generated a random SECRET');
})();

(async () => {
	const packagePath = path.join(projectPath, 'package.json');
	const packageContent = JSON.parse((await fs.promises.readFile(packagePath)).toString());
	packageContent.name = projectName;
	await fs.promises.writeFile(packagePath, JSON.stringify(packageContent, undefined, 2));
	console.info('updated package name in package.json');
})();

(async () => {
	const packageLockPath = path.join(projectPath, 'package-lock.json');
	const packageLockContent = JSON.parse((await fs.promises.readFile(packageLockPath)).toString());
	packageLockContent.name = projectName;
	// lockfileVersion 2 added an empty entry representing the current project
	if (packageLockContent.packages['']) {
		packageLockContent.packages[''].name = projectName;
	}
	await fs.promises.writeFile(packageLockPath, JSON.stringify(packageLockContent, undefined, 2));
	console.info('updated package name in package-lock.json');
})();
