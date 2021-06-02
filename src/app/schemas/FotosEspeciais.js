import mongoose from 'mongoose';

import mongoosePaginate from 'mongoose-paginate-v2';

const FotosEspeciaisSchema = new mongoose.Schema(
  {
    categoria: {
      type: String,
      required: true,
    },
    referencia: {
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

FotosEspeciaisSchema.plugin(mongoosePaginate);

export default mongoose.model(
  'FotosEspeciais',
  FotosEspeciaisSchema,
  'FotosEspeciais'
);
