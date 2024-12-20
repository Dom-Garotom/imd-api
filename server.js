const express = require("express");
const router = require("./routes/routes.js");
const expressLayouts = require('express-ejs-layouts')
require('dotenv').config()

const server = express();
server.use(express.json());
server.use(router);
server.use(expressLayouts)
server.use(express.static('public'))

      
server.set('view engine', 'ejs')
server.set('layout', 'layouts/index')



server.listen(3333);