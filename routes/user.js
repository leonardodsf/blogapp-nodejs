const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require("../models/User");
const User = mongoose.model("users");
const bcrypt = require("bcryptjs");
const passport = require("passport");

router.get("/registro", (req, res) => {
  res.render("usuarios/registro");
});

router.post("/registro", (req, res) => {
  const errors = [];

  if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
    errors.push({text: "Nome inválido!"});
  }

  if(req.body.nome.length < 3){
    errors.push({text: "Nome muito pequeno, seu nome deve ter no mínimo 3 caracteres!"});
  }

  if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
    errors.push({text: "E-mail inválido!"});
  }

  if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
    errors.push({text: "Senha inválida"});
  }

  if(req.body.senha.length < 6){
    errors.push({text: "Senha muito pequena, sua senha deve ter no mínimo 6 caracteres!"});
  }

  if(req.body.senha != req.body.senha2){
    errors.push({text: "As senhas são diferentes, tente novamente!"});
  }

  if(errors.length > 0){

   res.render("usuarios/registro", {errors: errors});


  } else {
    User.findOne({email: req.body.email}).then((user) => {
      if(user){
        req.flash("error_msg", "Já existe uma conta com este e-mail");
        res.redirect("/usuarios/registro");
      } else {
        const newUser = new User({
          name: req.body.nome,
          email: req.body.email,
          senha: req.body.senha
          // eAdmin: 1
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.senha, salt, (err, hash) => {           
            if(err){
              req.flash("error_msg", "Houve um erro durante o salvamento do usuario");
              res.redirect("/");
            }

            newUser.senha = hash;

            newUser.save().then(() => {
              req.flash("success_msg", "Usuario criado com sucesso!");
              res.redirect("/");
            }).catch((err) => {
              console.log(err);
              req.flash("error_msg", "Houve um erro ao criar o usuario, tente novamente!");
              res.redirect("/usuarios/registro")
            });


          });
        });

      }
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/");
    });
  }
});

router.get("/login", (req, res) => {
  res.render("usuarios/login");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/usuarios/login",
    failureFlash: true
  })(req, res, next)
});

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "Você acabou de sair da conta, volte sempre!");
  res.redirect("/");
});



module.exports = router;