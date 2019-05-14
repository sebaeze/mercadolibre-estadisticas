/*
*
*/
//
const dbUrl         = require('./dbUrl').classDb ;
const dbProductos   = require('./dbProductos').classDb ;
//
module.exports.bases = (argConfig) => {
    return {
        url: new dbUrl(argConfig),
        productos: new dbProductos(argConfig)
    }
} ;
//
