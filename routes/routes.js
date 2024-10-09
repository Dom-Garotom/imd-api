import express from "express";
import MyMildeware from "../midleware/midleware.js";
const router = express.Router();
import { Produto } from "../banco/banco.js";



router.get('/produtos', async (req, res) => {
    await Produto.findAll();
    res.json(Produto);
});



//  rota de criar elemento 


router.post('/produtos', MyMildeware ,async (req, res) => {
    const { nome, descricao, preco } = req.body;
    const id = Math.floor(Math.random() * 100);

    const novoProduto = await Produto.create({ 
        id : id ,
        nome : nome , 
        descricao : descricao, 
        preco : preco 
    });

    res.status(201).json(novoProduto);

});



// rota de atualizar elemneto 

router.put('/produtos/:id', MyMildeware , async (req, res) => {
    const id = parseInt(req.params.id);
    const { nome, descricao, preco } = req.body;

    const produto = await Produto.findByPk(id)
 
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







export {router};