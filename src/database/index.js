import Mongoose from 'mongoose';

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.mongoConnection = Mongoose.connect(
      'mongodb://catalogozait:Zait2021@mongo_catalogo-zait:27017/catalogo-zait',
      {
        useCreateIndex: true,
        useNewUrlParser: true,
        useFindAndModify: true,
        useUnifiedTopology: true,
      }
    );
  }
}

export default new Database();
