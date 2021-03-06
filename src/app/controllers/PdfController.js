import ejs from 'ejs';
import path from 'path';
import axios from 'axios';
import _Arr from 'lodash';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { urlencoded } from 'express';
import puppeteer from 'puppeteer';

import serviceApi from '../utils/serviceApi.js';
import FotosEspeciais from '../schemas/FotosEspeciais.js';
import FotoCapa from '../schemas/FotoCapa.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class PdfController {

  async gerate(req, res) {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // console.log(encodeURIComponent(req.query.cdsProdutos));

    await page.goto('http://localhost:3000/createPdf/' + encodeURIComponent(req.query.cdsProdutos), {
      waitUntil: 'networkidle0'
    });

    const pdf = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
      width: '7.5in',
      height: '13.5in'
    });

    await browser.close();

    res.contentType("application/pdf");

    return res.send(pdf);

  }

  async create(req, res) {

    //Pegando Informações gerais do produtos e Fotos
    const paramsProdutosFotos = new URLSearchParams();

    Object.entries(serviceApi.items).forEach(([key, value]) => {
      paramsProdutosFotos.append(key, value);
    });

    paramsProdutosFotos.append('cd', req.params.cdsProdutos)
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
      .catch((error) => res.status(400).json(error));

    //Pegando informações dos tamanhos dos produtos e quantidade em estoque
    const paramsTamanhosSaldo = new URLSearchParams();

    Object.entries(serviceApi.items).forEach(([key, value]) => {
      paramsTamanhosSaldo.append(key, value);
    });

    paramsTamanhosSaldo.append('cd', req.params.cdsProdutos);
    paramsTamanhosSaldo.append('cdsaldo', 3);

    let arrTamanhosSaldos = await axios
      .post(`${serviceApi.url}/pegarProdutoSaldoPorCdsProduto`, paramsTamanhosSaldo)
      .then((response) => {
        if (response.data.errosContador >= 1)
          return res.json({ error: response.data.erros[0].message });

        const resultAPI = response.data.produtos;

        return resultAPI;
      })
      .catch((error) => res.status(400).json(error));

    // pegando valores dos produtos
    const paramsValorProduto = new URLSearchParams();

    Object.entries(serviceApi.items).forEach(([key, value]) => {
      paramsValorProduto.append(key, value);
    });

    paramsValorProduto.append('cdsProduto', req.params.cdsProdutos)

    let arrValoresProdutos = await axios
      .post(`${serviceApi.url}/pegarProdutoValorPorCdsProduto`, paramsValorProduto)
      .then((response) => {
        if (response.data.errosContador >= 1)
          return res.json({ error: response.data.erros[0].message });

        const resultAPI = response.data.produtos;

        return resultAPI;
      })
      .catch((error) => res.status(400).json(error));

    //iniciando a construção do novo array
    let newArr = { produtos: [{}] };

    // alimentando novo array com as infos dos produtos
    arrDetalhesProduto.forEach((produto, index) => {

      let codClassificacao;

      arrDetalhesProduto[index].classificacoes.forEach((classificacao, i) => {
        if (classificacao.cdTipo == 4) {
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
        qtdeTotal: 0,
        fotos: []
      };

    });

    //filtrando para pegar apenas tamanhos e ativos
    arrDetalhesProduto.forEach((_, i) => {
      let contPosition = 0;

      arrDetalhesProduto[i].skus.forEach(sku => {
        if (sku.inVisibilidade === 'A') {
          if (sku.dsCor) {
            if (sku.cdErp) {
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

    let arrFotosExcluir;

    await FotosEspeciais.find(function (err, obj) {
      if (obj) arrFotosExcluir = obj;
    });

    //adicionando as fotos ao newArr
    arrDetalhesProduto.forEach((produto, i) => {
      const indexImg = arrDetalhesProduto[i].imgs.length - 1;
      let contadorFotos = 1;

      if(arrDetalhesProduto[i].imgs.length > 0 ) {

        arrDetalhesProduto[i].imgs[indexImg].fotos.forEach((foto, iFoto) => {

          if (contadorFotos <= 4) { // pegar apenas 4 fotos
            newArr.produtos[i].fotos[iFoto] = {
              vlOrdem: foto.vlOrdem,
              url: foto.img['loja-prod-g']
            }

            contadorFotos++;
          }
        });
      } else {
        newArr.produtos[i].fotos[0] = {
          vlOrdem: 0,
          url: 'http://localhost:3000/img/sem-foto.png'
        }
      }

    });

    // removendo fotos especiais do newArr
    newArr.produtos.forEach((arr, i) => {
      arrFotosExcluir.forEach((fotoEx, index) => {
        if (fotoEx.referencia == arr.cdErp) {
          const vlOrdem = Number(fotoEx.categoria);
          _Arr.remove(newArr.produtos[i].fotos, { vlOrdem: vlOrdem });
        }
      });
    });

    //adicionando os saldos ao newArr
    let qtdeTotal = 0;
    newArr.produtos.forEach((produto, i) => {
      arrTamanhosSaldos.forEach((tamSal, its) => {
        if (tamSal.cdProduto === produto.cdProduto) {
          newArr.produtos[i].tamanhos.forEach((tamanho, it) => {
            arrTamanhosSaldos[its].skus.forEach((tamSalSkus, c) => {
              if (tamanho.cdSku == tamSalSkus.cdSku) {
                qtdeTotal = qtdeTotal + tamSalSkus.saldos[0].qtDisponivel;
                newArr.produtos[i].tamanhos[it].saldos = tamSalSkus.saldos[0].qtDisponivel;
              }
            });
          });

          newArr.produtos[i].qtdeTotal = qtdeTotal;
          qtdeTotal = 0;
        }
      });
    });

    //adicionando os valores ao newArr
    newArr.produtos.forEach((produto, i) => {

      arrValoresProdutos.forEach((tamVal, its) => {

        if (tamVal.cdProduto === produto.cdProduto) {

          newArr.produtos[i].tamanhos.forEach((tamanho, it) => {

            arrValoresProdutos[its].skus.forEach((tamValSkus, c) => {

              if (tamanho.cdSku == tamValSkus.cdSku) {
                let indexValor = tamValSkus.valores.length - 1;
                newArr.produtos[i].tamanhos[it].valores = tamValSkus.valores[indexValor].vlSku;
              }
            });
          });
        }
      });
    });

    //remover produtos sem quantidade disponível
    let index = newArr.produtos.length;
    console.log(index);
    while (index--) {
      if(newArr.produtos[index].qtdeTotal <= 0) {
        console.log(index);
        newArr.produtos.splice(index, 1);
      }
    }

    // newArr.produtos.forEach((produto, i) => {
    //   if(produto.qtdeTotal <= 0) {
    //     console.log(i);
    //     newArr.produtos.splice(i, 1);
    //   }
    // });

    const fotoCapa = await FotoCapa.find();

    let capas = { capas: [{ capa: fotoCapa[0].url_imagem, contraCapa: fotoCapa[1].url_imagem }] };

    const filePath = path.join(__dirname, "..", "templates", "catalogo.ejs");

    ejs.renderFile(filePath, Object.assign(newArr, capas), (err, html) => {
      if (err) {
        return res.send('Erro na leitura do arquivo')
      }

      // enviar para o navegador
      return res.send(html)
    })

  }
}

export default new PdfController();
