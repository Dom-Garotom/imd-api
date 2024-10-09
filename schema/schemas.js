const schema ={
    type: "object",
    properties: {
      nome: {type: "string"},
      descricao: {type: "string"},
      preco: {type: "number"}
    },
    required: ["preco" , "nome"],
    additionalProperties: false
}

export default schema