import path from 'path';
import * as Yup from 'yup';
import fs from 'fs';

import FotoCapa from '../schemas/FotoCapa.js';

const __dirname = path.resolve(path.dirname(''));

class FotosCapaController {
  async update(req, res) {
    const schema = Yup.object().shape({
      tipo: Yup.string(),
      imagem: Yup.string(),
    });

    // aqui verifico se o schema anterior é valido, passando os dados do req.body
    if (!(await schema.isValid(req.body))) {
      const existeErros = await schema
        .validate(req.body)
        .catch((err) => err.errors);

      return res.status(400).json({ error: existeErros });
    }

    const fotoCapa = await FotoCapa.findById(
      req.params.id
    );

    const { id, imagem } = fotoCapa;
    const foto_antiga = imagem;

    if (!id) {
      return res.status(400).json({ error: 'Esta capa não está cadastrada' });
    }

    // fs.unlink(`${__dirname}/public/uploads/${foto_antiga}`, (err => {
    //   if (err) console.log(err);
    // }));

    const { filename: capa_imagem } = req.file;
    req.body.imagem = capa_imagem;

    const fotoCapaData = await FotoCapa.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    return res.json(fotoCapaData);
  }

  async index(req, res) {
    const fotoCapa = await FotoCapa.find();

    return res.json(fotoCapa);
  }
}

export default new FotosCapaController();
