import axios from 'axios';
import serviceApi from '../utils/serviceApi.js';

class TamanhosController {

  async index(req, res) {
    const params = new URLSearchParams();

    Object.entries(serviceApi.items).forEach(([key, value]) => {
      params.append(key, value);
    });

    await axios
      .post(`${serviceApi.url}/pegarTamanhos`, params)
      .then((response) => {
        if (response.data.errosContador >= 1)
          return res.json({ error: response.data.erros[0].message });

        const resultAPI = response.data.tamanhos;

        for (let i = 0; i < resultAPI.length; i++) {
          delete resultAPI[i].cdErp;
          delete resultAPI[i].cdOrdem;
        }

        return res.json({ tamanhos: resultAPI, total: resultAPI.length });
      })
      .catch((error) => res.status(401).json(error));
  }
}

export default new TamanhosController();
