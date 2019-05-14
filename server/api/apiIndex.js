/*
*  APIs con Express.js
*/
const iniciarApi = ( argConfig ) => {
    //
    const express    = require('express')     ;
    const app        = express() ;
    const path       = require('path') ;
    const bodyParser = require('body-parser') ;
    /*
    const utilitario = require( path.join(__dirname,'../lib/utiles') ).Utilitarios() ;
    const config     = utilitario.configApp() ;
    */
    //
    app.all('*', function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
          res.header('Access-Control-Allow-Methods', '*');
        res.header("Access-Control-Allow-Credentials", true);
        next() ;
      })
      app.disable('x-powered-by');
      app.disable('etag');
      //
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: true }));
    //
    /*
    *   Rutas
    */
    var routerIndex          = require( path.join(__dirname,'/rutas/routerIndex') )(argConfig) ;
    app.use('/'              , routerIndex           ) ;
    /*
    *
    */
    app.use(function(err, req, res, next) {
        console.log(' \n ******* (B) ERROR ********** ');
        console.dir(err) ;
        let mensajeError = '' ;
        if ( typeof err=='object' ){
            mensajeError = JSON.stringify(err) ;
        } else {
            mensajeError = err ;
        }
        res.redirect('/error?mensaje='+mensajeError) ;
    });
    //
    app.use(function(req, res, next) {
        console.log(' \n *** ERROR - 404 --> url: '+req.originalUrl+' *** \n');
        res.status(404);
        res.send( { error: 'url: '+req.originalUrl+' Not found' } );
    });
    //
    //
    try {
        let puerto = process.env.PORT || argConfig.api.puerto || 9000  ;
        app.listen(puerto,function(){
          console.log('....listen server on http://localhost:'+puerto) ;
        });
      } catch( errApplaunch ){
        console.dir(errApplaunch) ;
      }
      //
}
//
module.exports.iniciarApi = (argConfig) => {
    iniciarApi(argConfig) ;
    return this ;
};