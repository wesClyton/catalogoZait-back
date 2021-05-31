const bcrypt = require('bcryptjs');

//seed -u 'mongodb://localhost:27017/catalogo-zait' --drop-database ./src/database/seeders

module.exports = {
  nome: 'Weslley',
  email: 'wes.hinsch@gmail.com',
  password_hash: bcrypt.hashSync('1234', 8),
  status: true,
};
