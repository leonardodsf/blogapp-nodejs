//Loading Modules
  const express = require('express');
  const handlebars = require('express-handlebars');
  const bodyParser = require("body-parser");
  const app = express();
  const admin = require("./routes/admin");
  const path = require("path");
  const mongoose = require("mongoose");
  const session = require("express-session") ;
  const flash = require("connect-flash");
  require("./models/Posts");
  const Posts = mongoose.model("posts");
  require("./models/Category");
  const Category = mongoose.model("categories");
  const users = require("./routes/user");
  const passport = require("passport");
  require("./config/auth")(passport);
  const db = require("./config/db");

//Configs

  //Session
    app.use(session({
      secret: "cursodenode",
      resave: true,
      saveUninitialized: true
    }));

    //Passport
    app.use(passport.initialize());
    app.use(passport.session());

  //Flash
    app.use(flash());

  //Middleware
    app.use((req, res, next) => {
      //variavel global
      res.locals.success_msg = req.flash("success_msg");
      res.locals.error_msg = req.flash("error_msg");
      res.locals.error = req.flash("error");
      res.locals.user = req.user || null;
      next();
    });

  //Body Parser
    app.use(bodyParser.urlencoded({extend: true}));
    app.use(bodyParser.json());

  //Handlebars
    app.engine('handlebars', handlebars({defaultLayout: 'main'}));
    app.set('view engine', 'handlebars');

  //Mongoose
    mongoose.Promise = global.Promise;
    mongoose.connect(db.mongoURI, {useNewUrlParser: true}).then(() => {
      console.log("Connected on Mongo");
    }).catch((err) => {
      console.log("Error on Connect: " + err);
    })

  //Public
    app.use(express.static(path.join(__dirname, "public")));   

//Routes
  app.use('/admin', admin);

  app.get('/', (req, res) => {
    Posts.find().populate("category").sort({data:"desc"}).then((posts) => {
      res.render("index", {posts: posts});
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/404");
    });   
  });

  app.get("/postagem/:slug", (req, res) => {
    Posts.findOne({slug: req.params.slug}).then((posts) =>{
      if(posts){
        res.render("postagem/index", {posts: posts});
      } else {
        req.flash("error_msg", "Esta postagem não existe");
        res.redirect("/");
      }
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/");
    })
  });

  app.get("/404", (req, res) => {
    res.send("Error 404");
  });
  
  app.get("/categories", (req, res) => {
    Category.find().then((categories) => {
      res.render("categorias/index", {categories: categories});
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro interno ao listar as categorias")
      res.redirect("/");
    });
  });

  app.get("/categories/:slug", (req, res) => {
    Category.findOne({slug: req.params.slug}).then((category) => {
      if(category){
        Posts.find({category: category._id}).then((posts) => {
          res.render("categorias/posts", {posts: posts, category: category})
        }).catch((err) => {
          req.flash("error_msg", "Houve um erro ao listar os posts");
          res.redirect("/");
        });
      }else{
        req.flash("error_msg", "Esta categoria não existe");
        res.redirect("/");
      }
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria");
      res.redirect("/");
    });
  });

  app.use('/usuarios', users);


//Others
const PORT = process.env.PORT || 8081
app.listen(PORT,() => {
  console.log("Server is Running...");
});