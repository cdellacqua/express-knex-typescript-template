const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');
const randomBytes = promisify(crypto.randomBytes);

(async () => {
	const envPath = path.join(__dirname, '.env.example');
	const envContent = (await fs.promises.readFile(envPath)).toString();
	await fs.promises.writeFile(path.join(__dirname, '.env'), envContent.replace(/SECRET=[^\r\n]+/, `SECRET="${(await randomBytes(36)).toString('hex')}"`));
})();

(async () => {
	const packagePath = path.join(__dirname, 'package.json');
	const packageContent = (await fs.promises.readFile(packagePath)).toString();
	await fs.promises.writeFile(packagePath, packageContent.replace(/"name":[^\r\n]+/, `"name": "${path.basename(__dirname)}",`));
})();

(async () => {
	const packageLockPath = path.join(__dirname, 'package-lock.json');
	const packageLockContent = (await fs.promises.readFile(packageLockPath)).toString();
	await fs.promises.writeFile(packageLockPath, packageLockContent.replace(/"name":[^\r\n]+/, `"name": "${path.basename(__dirname)}",`));
})();
