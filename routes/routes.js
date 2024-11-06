const express = require("express");
const MyMildeware = require("../midleware/midleware.js");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { Produto, Tag, ProdutoTags } = require("../models");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");

router.get("/token" , (req , res) =>{
  const rand = randomBytes(1).toString("hex")
  const payload = {
    number : rand
  }
  
  const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
  res.json({ accessToken: token })
})






router.get("/api/produtos", async (req, res) => {
  const produtos = await Produto.findAll({
    include: {
      model: Tag,
      attributes: ["nome"],
      through: {
        model: ProdutoTags,
        attributes: [],
      },
    },
  });

  res.json(produtos);
});

router.get("/pages", async (req, res) => {
  const produto = await Produto.findAll({
    include: {
      model: Tag,
      attributes: ["nome"],
      through: {
        model: ProdutoTags,
        attributes: [],
      },
    },
  });

  res.render("pages/index", { produtos: produto, layout: "layouts/layout" });
});

// rota de enviar produto por id

router.get("/api/produtos/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  const produtos = await Produto.findByPk(id, {
    include: {
      model: Tag,
      attributes: ["nome"],
      through: {
        model: ProdutoTags,
        attributes: [],
      },
    },
  });

  res.json(produtos);
});

//  rota de criar elemento

router.post("/api/produtos", MyMildeware, async (req, res) => {
  const { nome, descricao, preco, tags } = req.body;
  const id = Math.floor(Math.random() * 5000);

  const novoProduto = await Produto.create({
    id: id,
    nome: nome,
    descricao: descricao,
    preco: preco,
  });

  if (tags && tags.length > 0) {
    const instancias = await Promise.all(
      tags.map((tag) =>
        Tag.findOrCreate({
          where: { nome: tag },
          defaults: { nome: tag },
        })
      )
    );

    novoProduto.addTags(instancias.map(([tags, bool]) => tags));
  }

  // const produto = await Produto.findByPk(novoProduto.id, {
  //   include: {
  //     model: Tag,
  //     attributes: ["nome"],
  //     through: {
  //       model: ProdutoTags,
  //       attributes: [],
  //     },
  //   },
  // });

  res
    .status(201)
    .json({ mensage: "produto criado com sucesso"});
});

// rota de atualizar elemneto

router.put("/api/produtos/:id", MyMildeware, async (req, res) => {
  const id = parseInt(req.params.id);
  const { nome, descricao, preco } = req.body;

  const produto = await Produto.findByPk(id, {
    include: {
      model: Tag,
      attributes: ["nome"],
      through: {
        model: ProdutoTags,
        attributes: [],
      },
    },
  });

  if (!produto) {
    return res.status(404).json({ error: "Produto não encontrado" });
  }

  produto.nome = nome;
  produto.descricao = descricao;
  produto.preco = preco;

  await produto.save();
  res.json(produto);
});

// rota delete

router.delete("/api/produtos/:id", MyMildeware, async (req, res) => {
  const id = parseInt(req.params.id);
  const produto = await Produto.findByPk(id);

  if (!produto) {
    return res.status(404).json({ error: "Produto não encontrado" });
  }

  await produto.destroy();
  res.status(204).send("Produto deletado");
});

// Rota para upload de imagem

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  const extensoes = /jpg|jpeg/i;
  if (extensoes.test(path.extname(file.originalname))) {
    cb(null, true);
  } else {
    cb("Arquivo não suportado. Apenas pdf são suportados.");
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.post("/:id/upload", upload.single("foto"), async (req, res) => {
  const produto = await Produto.findByPk(req.params.id);
  if (produto) {
    if (req.file) {
      produto.foto = `/static/uploads/${req.file.filename}`;
      await produto.save();
      res.json({ msg: "Upload realizado com sucesso!" });
    } else {
      res.status(400).json({ msg: "Nenhum arquivo foi enviado!" });
    }
  } else {
    res.status(400).json({ msg: "Produto não encontrado!" });
  }
});








module.exports = router;
