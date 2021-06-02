import * as Yup from 'yup';
import axios from 'axios';

import Categoria from '../schemas/Categorias.js';
import serviceApi from '../utils/serviceApi.js';

class CategoriaController {
  async insert(req, res) {
    const schema = Yup.object().shape({
      dsCategoria: Yup.string().required().max(100),
      cdCategoria: Yup.string().required().max(100),
    });

    if (!(await schema.isValid(req.body))) {
      const existeErros = await schema
        .validate(req.body)
        .catch((err) => err.errors);

      return res.status(400).json({ error: existeErros });
    }

    const { cdCategoria } = req.body;

    const categoria = await Categoria.findOne({
      cdCategoria,
    });

    if (categoria) {
      return res.status(401).json({ error: 'Este nível já esta cadastrado!' });
    }

    const categoriaData = await Categoria.create(req.body);

    return res.json(categoriaData);
  }

  async index(req, res) {
    const categoriaData = await Categoria.find().select('dsCategoria cdCategoria');
    const params = new URLSearchParams();

    Object.entries(serviceApi.items).forEach(([key, value]) => {
      params.append(key, value);
    });

    await axios
      .post(`${serviceApi.url}/pegarCategorias`, params)
      .then((response) => {
        if (response.data.errosContador >= 1)
          return res.json({ error: response.data.erros[0].message });

        const resultAPI = response.data.extras.categorias;

        /* estou retirando do array todos os categorias que devem ficar escondidod */
        for (let cont = 0; cont < categoriaData.length; cont++) {
          const idRemove = categoriaData[cont].cdCategoria;

          for (let i = 0; i < resultAPI.length; i++) {
            delete resultAPI[i].inTipoListaProduto;

            if (resultAPI[i].cdCategoria == idRemove) {
              resultAPI.splice(i, 1);
            }
          }
        }

        /* Estou selecionando todos os array que não possuem pai */
        let newArr = [];

        for (let i = 0; i < resultAPI.length; i++) {
          if (resultAPI[i].cdCategoriaPai == 0) {
            newArr[i] = {
              dsCategoria: resultAPI[i].dsCategoria,
              categoria: resultAPI[i].cdCategoria,
            };
          }
        }

        newArr = newArr.filter(() => true);

        const finalArr = [];

        // alimentando os categorias pais com os categorias filhos
        for (let cont = 0; cont < newArr.length; cont++) {
          const cdCategoriaPai = newArr[cont].categoria;
          let indice = 0;

          finalArr[cont] = {
            dsCategoria: newArr[cont].dsCategoria,
            cdCategoria: cdCategoriaPai,
            categorias: [],
          };

          for (let i = 0; i < resultAPI.length; i++) {
            if (resultAPI[i].cdCategoriaPai == cdCategoriaPai) {
              const assign = {
                dsCategoria: resultAPI[i].dsCategoria,
                cdCategoria: resultAPI[i].cdCategoria,
              };

              finalArr[cont].categorias[indice] = { ...assign };

              indice += 1;
            }
          }
        }

        return res.json({ categorias: finalArr, total: finalArr.length });
      })
      .catch((error) => res.status(401).json(error));
  }

  async indexDB(req, res) {
    const categoriaData = await Categoria.find().select('dsCategoria cdCategoria');

    return res.json({ categorias: categoriaData, total: categoriaData.length });
  }

  async search(req, res) {
    const params = new URLSearchParams();

    Object.entries(serviceApi.items).forEach(([key, value]) => {
      params.append(key, value);
    });

    await axios
      .post(`${serviceApi.url}/pegarCategorias`, params)
      .then((response) => {
        if (response.data.errosContador >= 1)
          return res.json({ error: response.data.erros[0].message });

        const regex = new RegExp(req.params.nome, 'i');
        const resultAPI = response.data.extras.categorias;
        const filteredAPI = response.data.extras.categorias.filter((item) =>
          item.dsCategoria.match(regex)
        );

        // buscar nome do pai e adicionar no array
        for (let i = 0; i < filteredAPI.length; i++) {
          for (let cont = 0; cont < resultAPI.length; cont++) {
            if (filteredAPI[i].cdCategoriaPai === resultAPI[cont].cdCategoria) {
              filteredAPI[i].dsCategoriaPai = resultAPI[cont].dsCategoria;
            }
          }
        }

        return res.json(filteredAPI);
      })
      .catch((error) => res.status(401).json(error));
  }
}

export default new CategoriaController();
