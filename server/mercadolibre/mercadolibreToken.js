/*
*
*/
const requestPromise  = require('request-promise') ;
//
module.exports.buscaToken = (argConfig,argCode) => {
    //
    return new Promise(function(respOk,respRej){
        try {
            //
            let reqMercadolibreToken = {method:'POST',
                                        uri: 'https://api.mercadolibre.com/oauth/token?grant_type=authorization_code'
                                                    +'&client_id='+argConfig.clientID
                                                    +'&client_secret='+argConfig.clientSecret
                                                    +'&code='+argCode
                                                    +'&redirect_uri=http://localhost:8000/auth/mercadolibre/callback',
                                        contentType: 'application/json',accept: 'application/json' } ;
            //
            console.dir(reqMercadolibreToken) ;
            requestPromise( reqMercadolibreToken )
                .then( respOk )
                .catch(mlError => {
                    console.log('....respuesta ERROR__desde mercadolibre tocken') ;
                    console.dir(mlError) ;
                    respRej(mlError) ;
                }) ;
            //
        } catch(errTok){
            respRej(errTok) ;
        }
    }.bind(this)) ;
    //
}