import ejs  from 'ejs';
import path from 'path';

import ProdutosController from './ProdutosController';
import FotoCapa from '../schemas/FotoCapa';

class PdfController {

  async gerate(req, res) {

    const produtos = await ProdutosController.details(req.body.cdsProdutos);
    const capas = await FotoCapa.find();

    console.log(capas);

    const filePath = path.join(__dirname, "..", "templates", "catalogo.ejs");

    ejs.renderFile(filePath, { produtos }, (err, pdf) => {
      if(err) {
        return res.json('Erro na leitura do arquivo');
      }

      res.contentType("application/pdf") //se quiser ja apresentar a pagina com o pdf adiciona essas 2 linhas
      return res.send(pdf);

      //return res.json({ messaage: 'ok', url: url }); //se quiser apénas salvar o pdf preciso mandar uma resposta, o certo seria enviar o ok e a url
    });
}
}

export default new PdfController();