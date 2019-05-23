/*
*
*/
const router          = require('express').Router()   ;
//
module.exports.routerUsuarios = (argDBases) => {
    //
    router.post('/usuarios/sincronizar', function(req, res) {
        //
        res.set('access-Control-Allow-Origin', '*');
        res.set('access-Control-Allow-Methods', '*');
        res.setHeader("Access-Control-Allow-Credentials", true);
        console.log('.....voy a sincronizar usuario: '+req.query.usuario+';') ;
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
    //
    router.get('/visitas', function(req, res) {
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
    //
    return router ;
} ;
//