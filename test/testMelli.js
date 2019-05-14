/*
*
*/
const path                = require('path') ;
const utilitario          = require( path.join(__dirname,'../server/lib/utiles') ).Utilitarios() ;
const config              = utilitario.configApp() ;
const mlsincro = require( path.join(__dirname,'../server/batch/mercadolibreSincro') ).mercadolibreDatos(config) ;
//
//console.dir(mlsincro) ;
//mlsincro.user('60873335') ;
//mlsincro.accessToken() ;
//
mlsincro.iniciarSincronizacionSellerId('60873335')
        .then(resDatos => {
            console.log('....datossss...ll: '+resDatos.length+';') ;
        })
        .catch(respRech => {
            console.log('...hay rechazossss') ;
        }) ;

//
/*
mlsincro.cantidadDeVisitas2Seller('60873335','2018-06-01','2019-05-14')
        .then(resDatos => {
            console.log('....datossss...ll: '+resDatos.length+';') ;
            console.dir(resDatos) ;
        })
        .catch(respRech => {
            console.log('...hay rechazossss') ;
        }) ;
        */
//