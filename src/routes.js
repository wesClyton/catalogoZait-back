import { Router } from 'express'
import multer from 'multer';
import multerConfig from './config/multer'; 
import AuthMiddleware from './app/middlewares/auth';
import AdminMiddleware from './app/middlewares/admin';

import SessionController from './app/controllers/SessionController';
import TesteAuthController from './app/controllers/TesteAuthController';
import AdminController from './app/controllers/AdminController';
import CategoriaController from './app/controllers/CategoriaController';
import ClassificacaoController from './app/controllers/ClassificacaoController';
import CoresController from './app/controllers/CoresController';
import TamanhosController from './app/controllers/TamanhosController';
import FotosEspeciaisController from './app/controllers/FotosEspeciaisController';
import FotosCapaController from './app/controllers/FotosCapaController';
import ProdutosController from './app/controllers/ProdutosController';
import PdfController from './app/controllers/PdfController';

const routes = new Router();
const upload = multer(multerConfig);

routes.get('/', (req, res) => res.json({ message: 'OK!' }));

routes.post('/sessionAdmin', SessionController.sessionAdmin);
routes.post('/sessionUser', SessionController.sessionUser);

routes.get('/createPdf/:cdsProdutos', PdfController.create);
routes.get('/geratePdf', PdfController.gerate);
routes.get('/produtosDetalhes', ProdutosController.details);

// a partir daqui todas as rotas devem estar autenticadas com token
routes.use(AuthMiddleware);

routes.get('/testAuth', TesteAuthController);
routes.get('/testAuthAdmin', AdminMiddleware, TesteAuthController);

routes.post('/admin', AdminMiddleware, AdminController.insert);
routes.get('/admin', AdminMiddleware, AdminController.index);
routes.get('/admin/:id', AdminMiddleware, AdminController.details);
routes.put('/admin', AdminMiddleware, AdminController.update);

routes.post('/categoria', CategoriaController.insert);
routes.get('/categoria', CategoriaController.index);
routes.get('/categoria/db', CategoriaController.indexDB);
routes.get('/categoria/:nome', CategoriaController.search);

routes.post('/classificacao', ClassificacaoController.insert);
routes.get('/classificacao', ClassificacaoController.index);
routes.get('/classificacao/db', ClassificacaoController.indexDB);
routes.get('/classificacao/:nome', ClassificacaoController.search);

routes.post('/fotosEspeciais', AdminMiddleware, FotosEspeciaisController.insert);
routes.get('/fotosEspeciais', FotosEspeciaisController.index);
routes.get('/fotosEspeciais/db', FotosEspeciaisController.indexDB);
routes.get('/fotosEspeciais/:referencia', FotosEspeciaisController.details);

routes.put('/capas/:id', upload.single('imagem'), FotosCapaController.update);
routes.get('/capas', FotosCapaController.index);

routes.get('/cores', CoresController.index);

routes.get('/tamanhos', TamanhosController.index);

routes.get('/produtosCodigos', ProdutosController.indexCodigos);
routes.get('/produtosReferencias', ProdutosController.indexReferencias);


export default routes;
