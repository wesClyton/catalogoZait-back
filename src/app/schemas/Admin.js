import mongoose from 'mongoose';

const mongoosePaginate = require('mongoose-paginate-v2');

const AdminSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      maxlenght: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
    autoCreate: true,
  }
);

AdminSchema.plugin(mongoosePaginate);

export default mongoose.model('Admin', AdminSchema, 'Admin');
