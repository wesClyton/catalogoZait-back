import * as Yup from 'yup';

import FotosEspeciais from '../schemas/FotosEspeciais';
import Utils from '../utils/utils';

class FotosEspeciaisController {
  async insert(req, res) {
    const schema = Yup.object().shape({
      categoria: Yup.string().required().max(100),
      referencia: Yup.string().required().max(100),
    });

    if (!(await schema.isValid(req.body))) {
      const existeErros = await schema
        .validate(req.body)
        .catch((err) => err.errors);

      return res.status(400).json({ error: existeErros });
    }

    const { referencia } = req.body;

    const fotosEspeciais = await FotosEspeciais.findOne({
      referencia,
    });

    if (fotosEspeciais) {
      return res.status(401).json({ error: `Esta referencia já esta cadastrada para as categorias: ${fotosEspeciais.categoria}`});
    }

    const fotosEspeciaisData = await FotosEspeciais.create(req.body);

    return res.json(fotosEspeciaisData);
  }

  async index(req, res) {
    const categoriasFotosData = await FotosEspeciais.find().select('categoria');
    const referenciasFotosData = await FotosEspeciais.find().select('categoria referencia');

    const arrCategorias = Utils.removeDuplicates(categoriasFotosData, "categoria");
    const finalArr = [];

    // alimentando os classificacoes pais com os classificacoes filhos
    for (let cont = 0; cont < arrCategorias.length; cont++) {
      const categoriaPai = arrCategorias[cont].categoria;
      let indice = 0;

      finalArr[cont] = {
        categoria: categoriaPai,
        referencias: [],
      };

      for (let i = 0; i < referenciasFotosData.length; i++) {
        if (referenciasFotosData[i].categoria == categoriaPai) {

          finalArr[cont].referencias.push(referenciasFotosData[i].referencia);

          indice += 1;
        }
      }
    }

    return res.json({ fotosEspeciais: finalArr, total: finalArr.length });

  }

  async indexDB(req, res) {
    const referenciasFotosData = await FotosEspeciais.find().select('categoria referencia');

    return res.json({ fotosEspeciais: referenciasFotosData, total: referenciasFotosData.length });

  }

  async details(req, res) {

    const regex = new RegExp(req.params.referencia, 'i') // i for case insensitive
    const fotosEspeciaisData = await FotosEspeciais.find({referencia: {$regex: regex}})
    
    return res.json(fotosEspeciaisData);

  }
}

export default new FotosEspeciaisController();
