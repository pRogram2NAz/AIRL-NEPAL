/**
 * generate-hash.js
 * Run this ONCE to generate a bcrypt hash for your admin password.
 * Then paste the hash into your .env file as ADMIN_PASSWORD_HASH.
 *
 * Usage:
 *   node generate-hash.js yourPasswordHere
 *
 * Example:
 *   node generate-hash.js mySecretPassword123
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('❌ Please provide a password as an argument.');
  console.error('   Usage: node generate-hash.js yourPasswordHere');
  process.exit(1);
}

bcrypt.hash(password, 10).then(hash => {
  console.log('\n✅ Bcrypt hash generated successfully!\n');
  console.log('Add this to your .env file:\n');
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log('\n⚠️  Keep this hash secret. Never commit your .env file.\n');
});
