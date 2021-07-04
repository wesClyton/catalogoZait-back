import axios from 'axios';
import serviceApi from '../utils/serviceApi.js';

class CoresController {

  async index(req, res) {
    const params = new URLSearchParams();

    Object.entries(serviceApi.items).forEach(([key, value]) => {
      params.append(key, value);
    });

    await axios
      .post(`${serviceApi.url}/pegarCores`, params)
      .then((response) => {
        if (response.data.errosContador >= 1)
          return res.json({ error: response.data.erros[0].message });

        const resultAPI = response.data.cores;

        for (let i = 0; i < resultAPI.length; i++) {
          delete resultAPI[i].cdErp;
          delete resultAPI[i].cdCorErp;
          delete resultAPI[i].vlCor;
          delete resultAPI[i].vlCor1;
        }

        return res.json({ cores: resultAPI, total: resultAPI.length });
      })
      .catch((error) => res.status(400).json(error));
  }
}

export default new CoresController();
