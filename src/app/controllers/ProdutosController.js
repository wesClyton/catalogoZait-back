import axios from 'axios';
import serviceApi from '../utils/serviceApi';
import FotosEspeciais from '../schemas/FotosEspeciais';
import _Arr from 'lodash';

class ProdutosController {

  async indexCodigos(req, res) {
    const params = new URLSearchParams();

    Object.entries(serviceApi.items).forEach(([key, value]) => {
      params.append(key, value);
    });

    params.append('cdsCategoria', req.body.cdsCategoria);
    params.append('inStatus', 'A');
    params.append('classificacoes', req.body.classificacoes);
    params.append('cores', req.body.cores);
    params.append('tamanhos', req.body.tamanhos);
    params.append('precoMinimo', req.body.precoMinimo);
    params.append('precoMaximo', req.body.precoMaximo);
    params.append('cdValor', '3');

    await axios
      .post(`${serviceApi.url}/pegarCdsProduto`, params)
      .then((response) => {
        if (response.data.errosContador >= 1)
          return res.json({ error: response.data.erros[0].message });

        const resultAPI = response.data.produtos;

        return res.json({ produtos: resultAPI, total: resultAPI.length });
      })
      .catch((error) => res.status(401).json(error));
  }

  async indexReferencias(req, res) {
    const params = new URLSearchParams();

    Object.entries(serviceApi.items).forEach(([key, value]) => {
      params.append(key, value);
    });

    if(req.body.cdsProdutos) params.append('cd', req.body.cdsProdutos);

    params.append('cdErp', req.body.referencias);
    
    await axios
      .post(`${serviceApi.url}/pegarProdutosPorCds`, params)
      .then((response) => {
        if (response.data.errosContador >= 1)
          return res.json({ error: response.data.erros[0].message });

        const resultAPI = response.data.produtos;

        for (let i = 0; i < resultAPI.length; i++) {
          delete resultAPI[i].cdSku;
          delete resultAPI[i].cdOrdem;
          delete resultAPI[i].inTipo;
          delete resultAPI[i].inFracionado;
          delete resultAPI[i].stReferencia;
          delete resultAPI[i].inStatus;
          delete resultAPI[i].inMarketing;
          delete resultAPI[i].inBrinde;
          delete resultAPI[i].inArquivado;
          delete resultAPI[i].inLoteItem;
          delete resultAPI[i].vlProdutoMarketing;
          delete resultAPI[i].stDescricao;
          delete resultAPI[i].qtMinItemVenda;
          delete resultAPI[i].storage_cdseqgrupo;
          delete resultAPI[i].vlPeso;
          delete resultAPI[i].vlAltura;
          delete resultAPI[i].vlLargura;
          delete resultAPI[i].vlComprimento;
          delete resultAPI[i].dtAlteracao;
        }
        
        return res.json({ produtos: resultAPI, total: resultAPI.length });
      })
      .catch((error) => res.status(401).json(error));
  }

  async details(req, res) {

    //Pegando Informações gerais do produtos e Fotos
    const paramsProdutosFotos = new URLSearchParams();

    Object.entries(serviceApi.items).forEach(([key, value]) => {
      paramsProdutosFotos.append(key, value);
    });

    paramsProdutosFotos.append('cd', req.body.cdsProdutos)
    paramsProdutosFotos.append('img', '1');
    paramsProdutosFotos.append('imgs', 'loja-prod-g');
    paramsProdutosFotos.append('sku', '1');
    paramsProdutosFotos.append('niveis', '1');
    paramsProdutosFotos.append('classificacao', '1');
    
    let arrDetalhesProduto = await axios
      .post(`${serviceApi.url}/pegarProdutosPorCds`, paramsProdutosFotos)
      .then((response) => {
        if (response.data.errosContador >= 1)
          return res.json({ error: response.data.erros[0].message });

         const resultAPI = response.data.produtos;

        return resultAPI;
      })
      .catch((error) => res.status(401).json(error));

    //Pegando informações dos tamanhos dos produtos e quantidade em estoque
    const paramsTamanhosSaldo = new URLSearchParams();

    Object.entries(serviceApi.items).forEach(([key, value]) => {
      paramsTamanhosSaldo.append(key, value);
    });

    paramsTamanhosSaldo.append('cd', req.body.cdsProdutos)

    let arrTamanhosSaldos = await axios
      .post(`${serviceApi.url}/pegarProdutoSaldoPorCdsProduto`, paramsTamanhosSaldo)
      .then((response) => {
        if (response.data.errosContador >= 1)
          return res.json({ error: response.data.erros[0].message });

        const resultAPI = response.data.produtos;

        return resultAPI;
      })
      .catch((error) => res.status(401).json(error));

    
    // pegando valores dos produtos
    const paramsValorProduto = new URLSearchParams();

    Object.entries(serviceApi.items).forEach(([key, value]) => {
      paramsValorProduto.append(key, value);
    });

    paramsValorProduto.append('cdsProduto', req.body.cdsProdutos)

    let arrValoresProdutos = await axios
      .post(`${serviceApi.url}/pegarProdutoValorPorCdsProduto`, paramsValorProduto)
      .then((response) => {
        if (response.data.errosContador >= 1)
          return res.json({ error: response.data.erros[0].message });

        const resultAPI = response.data.produtos;

        return resultAPI;
      })
      .catch((error) => res.status(401).json(error));
   
    //iniciando a construção do novo array
    let newArr = {produtos:[{}]};
    
    // alimentando novo array com as infos dos produtos
    arrDetalhesProduto.forEach((produto, index) => {

      let codClassificacao;

      arrDetalhesProduto[index].classificacoes.forEach((classificacao, i) => {
        if(classificacao.cdTipo == 4) {
          codClassificacao = classificacao.cdClassificacao;
        }
      });

      newArr.produtos[index] = { 
        cdProduto: produto.cdProduto,
        cdErp: produto.cdErp,
        cdSku: produto.cdSku,
        stNome: produto.stNome,
        codClassificacao: codClassificacao,
        tamanhos: [],
        fotos: []
      };
      
    });

    //filtrando para pegar apenas tamanhos e ativos 
    arrDetalhesProduto.forEach((_, i) => {
      let contPosition = 0;

      arrDetalhesProduto[i].skus.forEach(sku => {
        if (sku.inVisibilidade === 'A') {
          if(sku.dsCor) {
            if(sku.cdErp) {
              newArr.produtos[i].tamanhos[contPosition] = {
                cdSku: sku.cdSku,
                cdErp: sku.cdErp,
                cdTamanho: sku.cdTamanho,
                cdTamanhoErp: sku.cdTamanhoErp,
                stTamanho: sku.stTamanho,
                dsCor: sku.dsCor,
                saldos: '',
                valores: ''
              }

              contPosition++;
            }
           }
        }
      });
    });
    
    return res.json(newArr);

    let arrFotosExcluir;

    await FotosEspeciais.find(function(err,obj) { 
      if(obj) arrFotosExcluir = obj;
    });

    //adicionando as fotos ao newArr
    arrDetalhesProduto.forEach((produto, i) => {
      const indexImg = arrDetalhesProduto[i].imgs.length - 1;
      let contadorFotos = 1;

      arrDetalhesProduto[i].imgs[indexImg].fotos.forEach((foto, iFoto) => {

        if(contadorFotos <= 4) { // pegar apenas 4 fotos
          newArr.produtos[i].fotos[iFoto] = {
            vlOrdem: foto.vlOrdem,
            url: foto.img['loja-prod-g']
          }
        
          contadorFotos++;
        }
      });

    });

    // removendo fotos especiais do newArr
    newArr.produtos.forEach((arr, i) => {
      arrFotosExcluir.forEach((fotoEx, index) => {
        if(fotoEx.referencia == arr.cdErp) {
          const vlOrdem = Number(fotoEx.categoria);
          _Arr.remove(newArr.produtos[i].fotos, { vlOrdem: vlOrdem });
        }
      });
    });



    //adicionando os saldos ao newArr
    newArr.produtos.forEach((produto, i) => {
      arrTamanhosSaldos.forEach((tamSal, its) => {
        if(tamSal.cdProduto === produto.cdProduto) {
          newArr.produtos[i].tamanhos.forEach((tamanho, it) => {     
            arrTamanhosSaldos[its].skus.forEach((tamSalSkus, c) => {
              if(tamanho.cdSku == tamSalSkus.cdSku) {
                newArr.produtos[i].tamanhos[it].saldos = tamSalSkus.saldos[0].qtDisponivel;
              }
            });
          });
        }
      });
    });

    //adicionando os valores ao newArr
    newArr.produtos.forEach((produto, i) => {

      arrValoresProdutos.forEach((tamVal, its) => {

        if(tamVal.cdProduto === produto.cdProduto) {

          newArr.produtos[i].tamanhos.forEach((tamanho, it) => {
            
            arrValoresProdutos[its].skus.forEach((tamValSkus, c) => {

              if(tamanho.cdSku == tamValSkus.cdSku) {
                let indexValor = tamValSkus.valores.length - 1;
                newArr.produtos[i].tamanhos[it].valores = tamValSkus.valores[indexValor].vlSku;
              }
            });
          });
        }
      });  
    });

    return res.json(newArr);
  }


}

export default new ProdutosController(); 
