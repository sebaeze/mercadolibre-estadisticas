/*
*
*/
const path                = require('path') ;
const utilitario          = require( path.join(__dirname,'../server/lib/utiles') ).Utilitarios() ;
const config              = utilitario.configApp() ;
const ml                  = require( path.join(__dirname,'../server/mercadolibre/mercadolibreIndex') )
                                    .mercadolibre({...config,accessToken:'APP_USR-5820076076281938-051517-382326aa5b4a2c1f91b22bdef7d6ac77-15103702'}) ;
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
ml.usuarios.sincronizarUsuario( [{id:'60873335'},{id:'15103702'}] )
    .then(respData => {
        console.log('....respuesta__ok: ');
        /*
        respData.forEach(element => {
            console.log('......id: '+element.id+' det: '+JSON.stringify(element.visitas)+';');
            //console.dir(element.visitas) ;
        });
        */
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