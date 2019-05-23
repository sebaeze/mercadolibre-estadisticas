/*
*
*/
//
const dbUrl         = require('./dbUrl').classDb ;
const dbProductos   = require('./dbProductos').classDb ;
const dbUsuarios    = require('./dbUsuarios').classDb ;
//
module.exports.bases = (argConfig) => {
    return {
        url: new dbUrl(argConfig),
        productos: new dbProductos(argConfig),
        usuarios: new dbUsuarios(argConfig)
    }
} ;
//
