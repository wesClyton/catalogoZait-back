import Mongoose from 'mongoose';

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.mongoConnection = Mongoose.connect(
      'mongodb://localhost:27017/catalogo-zait',
      {
        useCreateIndex: true,
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
      }
    );
  }
}

export default new Database();
