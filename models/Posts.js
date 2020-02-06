const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Posts =  new Schema({
  titulo: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  descricao: {
    type: String,
    required: true
  },
  conteudo: {
    type: String,
    required: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "categories",
  },
  data: {
    type: Date,
    default: Date.now()
  }
});

mongoose.model("posts", Posts);