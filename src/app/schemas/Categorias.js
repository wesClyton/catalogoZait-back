import mongoose from 'mongoose';

const mongoosePaginate = require('mongoose-paginate-v2');

const CategoriasSchema = new mongoose.Schema(
  {
    dsCategoria: {
      type: String,
      required: true,
    },
    cdCategoria: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    autoCreate: true,
  }
);

CategoriasSchema.plugin(mongoosePaginate);

export default mongoose.model('Categorias', CategoriasSchema, 'Categorias');
