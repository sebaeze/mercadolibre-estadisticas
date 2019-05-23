/*
*
*/
const router          = require('express').Router()   ;
//
module.exports.routerVisitas = (argDBases) => {
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