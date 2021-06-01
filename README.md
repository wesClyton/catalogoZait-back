# catalogoZait-back

## Softwares/Dependencias Externas
- MongoDB (Windows: https://drive.google.com/drive/folders/17GyJ638BBF6nV_dI_9ociqwVDJPjWSqz) (Osx: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/)
- Robo3T
- Yarn


## Instalar dependencias
$ yarn add


## Rodar a aplicação
$ yarn app


## Alimentar base de dados com os seeders
$ npm install -g mong-seeding-cli
$ seed -u 'mongodb://127.0.0.1:27017/catalogo-zait' --drop-database ./src/database/seeders 
