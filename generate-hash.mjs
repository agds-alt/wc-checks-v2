import bcrypt from 'bcrypt';

const password = '041294@Gfr';
const saltRounds = 10;

const hash = await bcrypt.hash(password, saltRounds);

console.log('\n🔐 Bcrypt Hash Generated:');
console.log('Password:', password);
console.log('Hash:', hash);
console.log('\nCopy hash untuk update SQL schema!\n');
