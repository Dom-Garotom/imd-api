const express = require("express");
const router = require("./routes/routes.js");
const expressLayouts = require('express-ejs-layouts')

const server = express();
server.use(express.json());
server.use(router);
server.use(expressLayouts)

server.set('view engine', 'ejs')
server.set('layout', 'layouts/layout')



server.listen(3333);