const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Category")
const Category = mongoose.model("categories");
require("../models/Posts");
const Posts = mongoose.model("posts");
const { eAdmin } = require("../helpers/eAdmin");

router.get("/", eAdmin, (req, res) => {
  res.render("admin/index")
});

router.get("/posts", eAdmin, (req, res) => {
  res.send("Página de posts");
});

router.get("/category", eAdmin, (req, res) => {
  Category.find().sort({date: 'desc'}).then((categories)=> {
    res.render("admin/category", {categories: categories})
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao listar as categorias");
    res.redirect("/admin");
  });
});

router.get("/category/add", eAdmin, (req, res) => {
  res.render("admin/addcategory")
});

router.post("/category/new", eAdmin, (req, res) => {
  
  const errors = [];

  if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
    errors.push({text: "Nome inválido"});
  }

  if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
    errors.push({text: "Slug Inválido"});
  }

  if(req.body.nome.length < 3){
    errors.push({text: "Nome da categoria muito pequeno"});
  }

  if(req.body.slug.length < 3){
    errors.push({text: "Slug da categoria muito pequeno"});
  }

  if(errors.length > 0){
    res.render("admin/addcategory", {errors: errors});
  } else {

    const newCategory = {

      nome: req.body.nome,
      slug: req.body.slug

    }

    new Category(newCategory).save().then(() => {
      req.flash("success_msg", "Categoria criada com sucesso!")
      res.redirect("/admin/category");
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro ao salvar a Categoria, tente novamente!" )
      res.redirect("/admin");
    });

  }
});

router.get("/categories/edit/:id", eAdmin, (req, res) => {
  Category.findOne({_id:req.params.id}).then((category) => {
    res.render("admin/editcategories", {category: category});
  }).catch((err) => {
     req.flash("error_msg", "Essa categoria não existe!" )
     res.redirect("/admin/category");
  });
});

router.post("/categories/edit", eAdmin, (req, res) => {
  Category.findOne({_id:req.body.id}).then((category) => {

    const errors = []


    if(!req.body.nome || typeof req.body.nome === undefined || req.body.nome === null || req.body.nome.length < 3) {
        errors.push({text: 'Nome Inválido ou muito curto! Nome precisa conter no mínimo 3 caracteres'})
    } 


    if(!req.body.slug || typeof req.body.slug === undefined || req.body.slug === null || req.body.slug.length < 3) {
        errors.push({text: 'Slug Inválido ou muito curto! Slug precisa conter no mínimo 5 caracteres'})
    } 


    if(errors.length > 0) {
        req.flash('error_msg', errors[0].text)
        res.redirect(`edit/${req.body.id}`)
    } else {
       category.nome = req.body.nome
       category.slug = req.body.slug

      category.save().then(() => {
        req.flash("success_msg", "Categoria editada com sucesso!");
        res.redirect("/admin/category");
      }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao salvar a edição da categoria");
        res.redirect("/admin/category");
      });
    }
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao editar a categoria")
    res.redirect("/admin/category");
  });
});

router.post("/categories/delete", eAdmin, (req, res) => {
  Category.remove({_id: req.body.id}).then(() => {
    req.flash("success_msg", "Categoria excluída com sucesso");
    res.redirect("/admin/category");
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao excluir categoria");
    res.redirect("/admin/category");
  });
});

router.get("/postagens", eAdmin, (req, res) => {
  Posts.find().populate("category").sort({data:"desc"}).then((posts) => {
    res.render("admin/postagens", {posts: posts});
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao listar as postagens");
    res.redirect("/admin");
  }); 
});

router.get("/posts/add", eAdmin, (req, res) => {
  Category.find().then((categories) => {
    res.render("admin/addposts", {categories: categories});
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao carregar o formulário");
    res.redirect("/admin");
  })
});

router.post("/posts/new", eAdmin, (req, res) => {
  const errors = [];

  if(!req.body.titulo || typeof req.body.titulo === undefined || req.body.titulo === null || req.body.titulo < 3) {
    errors.push({text: 'Título Inválido ou muito curto! Título precisa conter no mínimo 3 caracteres'})
  } 

  if(!req.body.descricao || typeof req.body.descricao === undefined || req.body.descricao === null || req.body.descricao.length < 3) {
    errors.push({text: 'Descrição Inválido ou muito curto! Descrição precisa conter no mínimo 3 caracteres'})
  } 

  if(!req.body.conteudo || typeof req.body.conteudo === undefined || req.body.conteudo === null || req.body.conteudo.length < 3) {
    errors.push({text: 'Conteúdo Inválido ou muito curto! Conteúdo precisa conter no mínimo 3 caracteres'})
  } 

  if(req.body.category == "0"){
    errors.push({text: "Você não tem nenhuma categoria registrada, para continuar registre uma!"})
  }

  if(errors.length > 0){

    res.render("admin/addposts", {errors: errors});

  } else {
      const newPosts = {
        titulo: req.body.titulo,
        descricao: req.body.descricao,
        conteudo: req.body.conteudo,
        category: req.body.category,
        slug: req.body.slug
      }

      new Posts(newPosts).save().then(() => {
        req.flash("success_msg", "Postagem criada com sucesso!");
        res.redirect("/admin/postagens");
      }).catch((err) => {
        req.flash("error_msg", "Houve um erro durante a criação da Postagem!" + err)
        res.redirect("/admin/postagens");
      });

    }

});

router.get("/posts/edit/:id", eAdmin, (req, res) => {

  Posts.findOne({_id: req.params.id}).then((posts) => {
    Category.find().then((categories) => {
      res.render("admin/editposts", {categories: categories, posts: posts})

    }).catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as categorias");
      res.redirect("/admin/postagens");
    });

  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao carregar o formulário de edição")
    res.redirect("/admin/postagens");
  });
 
});

router.post("/postagem/edit", eAdmin, (req, res) => {
 
      Posts.findOne({_id: req.body.id}).then((posts) => {
        posts.titulo = req.body.titulo
        posts.slug = req.body.slug
        posts.descricao = req.body.descricao
        posts.conteudo = req.body.conteudo
        posts.category = req.body.category

        posts.save().then(() => {
          req.flash("success_msg", "Postagem editada com sucesso!");
          res.redirect("/admin/postagens");
        }).catch((err) => {
          req.flash("error_msg", "Erro interno");
          res.redirect("/admin/postagens");
        });  
  
    }).catch((err) => {
      console.log(err);
      req.flash("error_msg", "Houve um erro ao salvar a edição");
      res.redirect("/admin/postagens");
    });
  
});


 router.get("/posts/delete/:id", eAdmin, (req, res) => {
   Posts.remove({_id: req.params.id}).then(() =>{
     req.flash("success_msg", "Postagem excluída com sucesso");
     res.redirect("/admin/postagens");
   }).catch((err) => {
     req.flash("error_msg", "Houve um erro ao excluir postagem");
     res.redirect("/admin/postagens");
   });
 });



module.exports = router;