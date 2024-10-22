const express = require("express");
const MyMildeware = require("../midleware/midleware.js");
const router = express.Router();

const { Produto, Tag  , ProdutoTags} = require("../models");
const { where, Model } = require("sequelize");



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

module.exports = router;