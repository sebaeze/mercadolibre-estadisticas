/*
*
*/
//
const dbUrl         = require('./dbUrl').classDb ;
const dbProductos   = require('./dbProductos').classDb ;
const dbVendedores  = require('./dbVendedores').classDb ;
//
module.exports.bases = (argConfig) => {
    return {
        url: new dbUrl(argConfig),
        productos: new dbProductos(argConfig),
        vendedores: new dbVendedores(argConfig)
    }
} ;
//
