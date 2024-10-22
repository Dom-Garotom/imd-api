const express = require("express");
const MyMildeware = require("../midleware/midleware.js");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { Produto, Tag  , ProdutoTags} = require("../models");



router.get('/produtos', async (req, res) => {
    const produtos = await Produto.findAll({
        include: {
            model: Tag,
            attributes: ["nome"],
            through: { 
                model: ProdutoTags,
                attributes: [] 
            }
        }
    });


    res.json(produtos);
});

// rota de enviar produto por id

router.get('/produtos/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    const produtos = await Produto.findByPk(id , { 
        include: {
            model: Tag,
            attributes: ["nome"],
            through: { 
                model: ProdutoTags,
                attributes: [] 
            }
        }
    });


    res.json(produtos);
});



//  rota de criar elemento 


router.post('/produtos', MyMildeware , async (req, res) => {
    const { nome, descricao, preco , tags } = req.body;
    const id = Math.floor(Math.random() * 100);

    const novoProduto = await Produto.create({ 
        id : id ,
        nome : nome , 
        descricao : descricao, 
        preco : preco 
    });

    if (tags && tags.length > 0){
        
        const instancias = await Promise.all ( tags.map( tag => Tag.findOrCreate({ 
            where : {nome : tag} , 
            defaults : { nome: tag} 
            }) 
        ));
    
        novoProduto.addTags( instancias.map( ([tags , bool]) => tags) );
    }


    const produto = await Produto.findByPk( novoProduto.id , {
        include: {
            model: Tag,
            attributes: ["nome"],
            through: { 
                model: ProdutoTags,
                attributes: [] 
            }
        }
    });

    
    res.status(201).json({mensage : "produto criado com sucesso" , produto: produto});

});



// rota de atualizar elemneto 

router.put('/produtos/:id', MyMildeware , async (req, res) => {
    const id = parseInt(req.params.id);
    const { nome, descricao, preco } = req.body;

    const produto = await Produto.findByPk(id , {
        include: {
            model: Tag,
            attributes: ["nome"],
            through: { 
                model: ProdutoTags,
                attributes: [] 
            }
        }  
    })
 
    if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado' });
    }

    produto.nome = nome;
    produto.descricao = descricao;
    produto.preco = preco;

    await produto.save();
    res.json(produto);
});



// rota delete

router.delete('/produtos/:id', MyMildeware , async (req, res) => {
    const id = parseInt(req.params.id);
    const produto = await Produto.findByPk(id);


    if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado' });
    }

    await produto.destroy();
    res.status(204).send("Produto deletado"); 
});


// upload de imagem

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, "../public/uploads");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/; 
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error("Apenas imagens são permitidas (jpeg, jpg, png, gif)."));
        }
    }
});


// Rota para upload de imagem

router.post('/produtos/:id/upload', MyMildeware, upload.single('imagem'), async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const produto = await Produto.findByPk(id);

        if (!produto) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
        }

        const imagePath = `/uploads/${req.file.filename}`;

        produto.caminhoImagem = imagePath;
        await produto.save();

        res.json({ message: "Upload de imagem realizado com sucesso", caminhoImagem: imagePath });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao realizar upload de imagem' });
    }
});

router.get('/static', express.static(path.join(__dirname, '../public')));


module.exports = router;