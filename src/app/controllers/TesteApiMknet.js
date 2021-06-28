import axios from 'axios';
import serviceApi from '../utils/serviceApi.js';

class TesteApiMknet {

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
        
        return res.json(resultAPI);
      })
      .catch((error) => res.status(401).json(error));
  }
}

export default new TesteApiMknet();
