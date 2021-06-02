import * as Yup from 'yup';
import axios from 'axios';

import Utils from '../utils/utils.js';
import Classificacao from '../schemas/Classificacoes.js';
import serviceApi from '../utils/serviceApi.js';

class ClassificacaoController {
  async insert(req, res) {
    const schema = Yup.object().shape({
      stNome: Yup.string().required().max(100),
      stTipo: Yup.string().required().max(100),
      cdClassificacao: Yup.string().required().max(100),
      cdTipo: Yup.string().required().max(100),
    });

    if (!(await schema.isValid(req.body))) {
      const existeErros = await schema
        .validate(req.body)
        .catch((err) => err.errors);

      return res.status(400).json({ error: existeErros });
    }

    const { cdClassificacao } = req.body;

    const classificacao = await Classificacao.findOne({
      cdClassificacao,
    });

    if (classificacao) {
      return res.status(401).json({ error: 'Esta classificação já esta cadastrada!' });
    }

    const classificacaoData = await Classificacao.create(req.body);

    return res.json(classificacaoData);
  }

  async index(req, res) {
    const classificacaoData = await Classificacao.find().select('stNome cdClassificacao');
    const params = new URLSearchParams();

    Object.entries(serviceApi.items).forEach(([key, value]) => {
      params.append(key, value);
    });

    await axios
      .post(`${serviceApi.url}/pegarClassificacoes`, params)
      .then((response) => {
        if (response.data.errosContador >= 1)
          return res.json({ error: response.data.erros[0].message });

        const resultAPI = response.data.classificacoes;

        /* estou retirando do array todos os classificacoes que devem ficar escondidod */
        for (let cont = 0; cont < classificacaoData.length; cont++) {
          const idRemove = classificacaoData[cont].cdClassificacao;

          for (let i = 0; i < resultAPI.length; i++) {
            delete resultAPI[i].cdErp;
            delete resultAPI[i].cdTipoErp;
            delete resultAPI[i].inPrioridade;
            delete resultAPI[i].inTipo;
            delete resultAPI[i].cdClassrel;

            if (resultAPI[i].cdClassificacao == idRemove) {
              resultAPI.splice(i, 1);
            }
          }
        }

        let newTipoArr = [];

        //removendo duplicados
        newTipoArr = Utils.removeDuplicates(resultAPI, "cdTipo");

        const finalArr = [];

        // alimentando os classificacoes pais com os classificacoes filhos
        for (let cont = 0; cont < newTipoArr.length; cont++) {
          const cdTipoPai = newTipoArr[cont].cdTipo;
          let indice = 0;

          finalArr[cont] = {
            cdTipo: cdTipoPai,
            stTipo: newTipoArr[cont].stTipo,
            classificacoes: [],
          };

          for (let i = 0; i < resultAPI.length; i++) {
            if (resultAPI[i].cdTipo == cdTipoPai) {
              const assign = {
                stNome: resultAPI[i].stNome,
                cdClassificacao: resultAPI[i].cdClassificacao,
              };

              finalArr[cont].classificacoes[indice] = { ...assign };

              indice += 1;
            }
          }
        }

        return res.json({ tipos: finalArr, total: finalArr.length });
      })
      .catch((error) => res.status(401).json(error));
  }

  async indexDB(req, res) {
    const classificacaoData = await Classificacao.find().select('stNome cdClassificacao');
    
    return res.json(classificacaoData);
  }

  async search(req, res) {
    const params = new URLSearchParams();

    Object.entries(serviceApi.items).forEach(([key, value]) => {
      params.append(key, value);
    });

    await axios
      .post(`${serviceApi.url}/pegarClassificacoes`, params)
      .then((response) => {
        if (response.data.errosContador >= 1)
          return res.json({ error: response.data.erros[0].message });

        const regex = new RegExp(req.params.nome, 'i');
        const resultAPI = response.data.classificacoes;

        const filteredAPI = response.data.classificacoes.filter((item) =>
          item.stNome.match(regex)
        );

        for (let i = 0; i < filteredAPI.length; i++) {
          delete filteredAPI[i].cdErp;
          delete filteredAPI[i].cdTipoErp;
          delete filteredAPI[i].inPrioridade;
          delete filteredAPI[i].inTipo;
          delete filteredAPI[i].cdClassrel;
        }

        return res.json(filteredAPI);
      })
      .catch((error) => res.status(401).json(error));
  }
}

export default new ClassificacaoController();
