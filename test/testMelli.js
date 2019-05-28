/*
*
*/
const path                = require('path') ;
const utilitario          = require( path.join(__dirname,'../server/lib/utiles') ).Utilitarios() ;
const config              = utilitario.configApp() ;
const ml                  = require( path.join(__dirname,'../server/mercadolibre/mercadolibreIndex') )
                                    .mercadolibre({...config,accessToken:'APP_USR-5820076076281938-052807-7dd93128fd9e1a9af28826b326ea8637-15103702'}) ;
//
//console.dir(mlsincro) ;
//mlsincro.user('60873335') ;
//mlsincro.accessToken() ;
//
/*
mlsincro.accessToken()
        .then(resDatos => {
            console.log('....datossss...ll: '+resDatos.length+';') ;
        })
        .catch(respRech => {
            console.log('...hay rechazossss') ;
        }) ;
*/
ml.productos.iniciarSincronizacionSellerId('60873335')
        .then(resDatos => {
            console.log('....datossss...ll: '+resDatos.length+';') ;
        })
        .catch(respRech => {
            console.log('...hay rechazossss') ;
            console.dir(respRech) ;
        }) ;
//
/*
ml.usuarios.sincronizarUsuario( [{id:'60873335'},{id:'15103702'}] )
    .then(respData => {
        console.log('....respuesta__ok: ');
    })
    .catch(respErr => {
        console.log('......error: ');
        console.dir(respErr) ;
    }) ;
/*
ml.usuarios.sincronizarUsuario( ['60873335','15103702'] )
    .then(respData => {
        console.log('....respuesta__ok: ');
        console.dir(respData) ;
    })
    .catch(respErr => {
        console.log('......error: ');
        console.dir(respErr) ;
    })
    */
//
/*
ml.productos.iniciarSincronizacionSellerId('60873335')
        .then(resDatos => {
            console.log('....datossss...ll: '+resDatos.length+';') ;
        })
        .catch(respRech => {
            console.log('...hay rechazossss') ;
            console.dir(respRech) ;
        }) ;
//
*/
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