/*
*
*/
const router            = require('express').Router()   ;
const path              = require('path') ;
const classMelli        = require( path.join(__dirname,'../../mercadolibre/mercadolibreIndex') ).mercadolibre ;
//
module.exports.routerUsuarios = (argDBases,argConfig) => {
    //
    const mercadolibre  = classMelli(argConfig) ;
    //
    router.post('/usuarios/sincronizar', function(req, res) {
        //
        res.set('access-Control-Allow-Origin', '*');
        res.set('access-Control-Allow-Methods', '*');
        res.setHeader("Access-Control-Allow-Credentials", true);
        console.log('.....voy a sincronizar usuario: '+req.body.id+';') ;
        //
        mercadolibre.usuarios.sincronizarUsuario( req.body, {ventas:false} )
            .then(function(respOkSincroUsr){
                res.status(200) ;
                res.json(respOkSincroUsr) ;
            }.bind(this))
            .catch(function(respOkSincroUsr){
                res.status(500) ;
                res.json( {error: respOkSincroUsr} ) ;
            }.bind(this)) ;
        //
    });
    //
    router.get('/visitasOLD', function(req, res) {
        //
        res.set('access-Control-Allow-Origin', '*');
        res.set('access-Control-Allow-Methods', '*');
        res.setHeader("Access-Control-Allow-Credentials", true);
        //
        argDBases.usuarios.getVisitas( req.query||{} )
            .then(arrayClientes => {
                res.status(200) ;
                res.json(arrayClientes) ;
            })
            .catch(respError => {
                res.status(500) ;
                res.json( {error: respError} ) ;
            }) ;
        //
    });
    router.get('/visitas', function(req, res) {
        //
        res.set('access-Control-Allow-Origin', '*');
        res.set('access-Control-Allow-Methods', '*');
        res.setHeader("Access-Control-Allow-Credentials", true);
        //
        argDBases.productos.getVisitasProductos( req.query||{} )
            .then(arrayClientes => {
                res.status(200) ;
                res.json(arrayClientes) ;
            })
            .catch(respError => {
                res.status(500) ;
                res.json( {error: respError} ) ;
            }) ;
        //
    });
    //
    return router ;
} ;
//