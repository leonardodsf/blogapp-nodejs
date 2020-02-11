if(process.env.NODE_ENV == "production"){
  module.exports = {mongoURI: "mongodb+srv://dbLeonardoFlores:123456@blogapp-z2z10.mongodb.net/test?retryWrites=true&w=majority"}
} else {
  module.exports = {mongoURI: "mongodb://localhost/blogapp"}
}
