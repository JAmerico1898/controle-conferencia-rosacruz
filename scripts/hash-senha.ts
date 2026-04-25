import bcrypt from "bcryptjs";

const senha = process.argv[2];
if (!senha) {
  console.error("uso: npx tsx scripts/hash-senha.ts <senha>");
  process.exit(1);
}
console.log(bcrypt.hashSync(senha, 10));
