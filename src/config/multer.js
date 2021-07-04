// a extensao do arquivo (extname) e percorrer um caminho na aplicacao (resolve)
import path from 'path';
// biblioteca do multer
import multer from 'multer';
// para podermos gerar um hash do nome do arquivo
import crypto from 'crypto';

const __dirname = path.resolve(path.dirname(''));
const resolve = path.resolve;


export default {
  // storage vai dizer como o multer vai guardar os arquivos de imagem
  // o diskstorage permite gravar no servidor
  storage: multer.diskStorage({
    // aqui vou dizer em qual destino (caminho) o arquivo vai ser armazenado
    destination: resolve(__dirname, '..', '..', 'uploads'),
    // filename aceita uma funcao que recebe 3 propriedades
    // req é a requisicao que recebemos, o file é os dados do arquivo e cb é uma funcao callback
    filename: (req, file, cb) => {
      // para evitar que duas imagens com o mesmo nome sejam gravadas
      // vamos usar um random de bytes (vai ser gerado 16 bytes aleatorios) do crypto
      // se der erro, retorna uma funcao com o erro ocorrido
      crypto.randomBytes(16, (err, res) => {
        if (err) return cb(err);
        // se nao der erro, deixa null ali onde tem o erro ocorrido
        // transforma os 16 bytes para string (hexadecimal)
        // e faz a concatenacao com o nome original do arquivo
        // mas vamos tirar o nome do arquivo e usar somente a extensao do arquivo
        return cb(null, res.toString('hex') + path.extname(file.originalname));
      });
    },
  }),
};