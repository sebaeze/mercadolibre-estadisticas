/*
*   2019-05
*/
const path                = require('path') ;
const utilitario          = require( path.join(__dirname,'./lib/utiles') ).Utilitarios() ;
const config              = utilitario.configApp() ;
const restAPIs            = require('./api/apiIndex')     ;
const eventos             = require('./lib/emisorEventos') ;
//
restAPIs.iniciarApi( config ) ;
/*
*   Definicion de Eventos
*/
eventos.on('sincronizar-usuario', function(argUsr){
    //
    console.log('\n *** ESTOY EN ON.SINCRONIZAR') ;
    let objConfigMl          = config         ;
    objConfigMl.accessToken  = argUsr.accessToken  ;
    objConfigMl.refreshToken = argUsr.refreshToken ;
    //
    const batchSincronizacion = require('./batch/batchIndex')
                                .batchSincronizacion( objConfigMl )
                                .iniciarSincronizacion( argUsr ) ;
    //const fnIntervalo         = batchSincronizacion.iniciarSincronizacion( argUsr ) ;
    //
   console.log('.....termi evento') ;
    //
}.bind(this))  ;
//