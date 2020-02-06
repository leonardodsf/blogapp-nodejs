const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
  nome: {
    type: String,
  },
  email: {
    type: String,
    required: true
  },
  eAdmin: {
    type: Number,
    default: 0
  },
  senha: {
    type: String,
    required: true
  }
});

mongoose.model("users", User);