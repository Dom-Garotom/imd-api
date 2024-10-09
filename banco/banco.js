import { Sequelize, DataTypes } from "sequelize";


// Configura o Sequelize com SQLite
const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "database.sqlite" 
});

export const Produto = sequelize.define("Produto", {
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    descricao: {
        type: DataTypes.TEXT,
    },
    preco: {
        type: DataTypes.FLOAT,
        allowNull: false,
    }
});


await sequelize.sync();
