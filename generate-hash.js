const bcrypt = require('bcrypt');

const password = '041294@Gfr';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  console.log('\n🔐 Bcrypt Hash Generated:');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nCopy hash untuk update SQL schema!\n');
});
