import mongoose from 'mongoose';

import mongoosePaginate from 'mongoose-paginate-v2';

const ClassificacoesSchema = new mongoose.Schema(
  {
    cdClassificacao: {
      type: String,
      required: true,
      unique: true,
    },
    cdTipo: {
      type: String,
      required: true,
    },
    stNome: {
      type: String,
      required: true,
    },
    stTipo: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true,
    autoCreate: true,
  }
);

ClassificacoesSchema.plugin(mongoosePaginate);

export default mongoose.model(
  'Classificacoes',
  ClassificacoesSchema,
  'Classificacoes'
);
