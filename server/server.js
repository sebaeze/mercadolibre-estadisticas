/*
*   2019-05
*/
const path                = require('path') ;
const utilitario          = require( path.join(__dirname,'./lib/utiles') ).Utilitarios() ;
const config              = utilitario.configApp() ;
const restAPIs            = require('./api/apiIndex')     ;
const batchSincronizacion = require('./batch/batchIndex').batchSincronizacion( config ) ;
//
restAPIs.iniciarApi( config ) ;
//const fnIntervalo = batchSincronizacion.iniciarSincronizacion() ;
//