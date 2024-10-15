const Ajv = require("ajv");
const ajv = new Ajv()
const schema = require("../schema/schemas.js");

const validate = ajv.compile(schema)


const MyMildeware =  ( req , res , next) => {

    const valid = validate(req.body);

    if (!valid){
        res.set("content-type" , "application/json").status(400).send(validate.errors);
        return;
    }

    next();
}


module.exports = MyMildeware;