import mongoose from 'mongoose';

const mongoosePaginate = require('mongoose-paginate-v2');

const LogsSchema = new mongoose.Schema(
  {
    referencia: {
      type: String,
      required: true,
    },
    atividade: {
      type: String,
      required: true,
    },
    acao: {
      type: String,
    },
  },
  {
    timestamps: true,
    autoCreate: true,
  }
);

LogsSchema.plugin(mongoosePaginate);

export default mongoose.model('Logs', LogsSchema, 'Logs');
