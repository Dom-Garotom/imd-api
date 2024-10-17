const schema ={
    type: "object",
    properties: {
      nome: {type: "string"},
      descricao: {type: "string"},
      preco: {type: "number"},
      tags: {
        type:"array",
        items:{
          type:"string"
        }
      }
    },
    required: ["preco" , "nome"],
    additionalProperties: false
}

module.exports = schema;