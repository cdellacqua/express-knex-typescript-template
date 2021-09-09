const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');
const randomBytes = promisify(crypto.randomBytes);

(async () => {
	const envPath = path.join(__dirname, '..', '.env');
	const envContent = (await fs.promises.readFile(envPath)).toString();
	await fs.promises.writeFile(envPath, envContent.replace(/SECRET=[^\r\n]+/, `SECRET="${(await randomBytes(36)).toString('hex')}"`));
	console.info('generated random SECRET');
})();
