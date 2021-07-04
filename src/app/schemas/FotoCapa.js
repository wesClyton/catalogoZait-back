import mongoose from 'mongoose';

import mongoosePaginate from 'mongoose-paginate-v2';

const FotoCapaSchema = new mongoose.Schema(
  {
    imagem: {
      type: String,
      required: true,
    },
    tipo: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    autoCreate: true,
    toObject: {
      getters: true,
      virtuals: true
    },
    toJSON: {
      getters: true,
      virtuals: true
    }
  }
);

FotoCapaSchema.plugin(mongoosePaginate);

// campo virtual de url
FotoCapaSchema.virtual('url_imagem').get(function () {
  return `https://catalogo.178.128.152.242.getmoss.site/uploads/${this.imagem}`;
});

export default mongoose.model(
  'FotoCapa',
  FotoCapaSchema,
  'FotoCapa'
);
