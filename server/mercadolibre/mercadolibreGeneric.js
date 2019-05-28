/*
*   Busqueda de informacion de mercadolibre
*/
const melli           = require('mercadolibre')    ;
//const requestPromise  = require('request-promise') ;
const path            = require('path')            ;
const db              = require( path.join(__dirname,'../db/dbIndex') ).bases ;
//
class MercadolibreGeneric {
    constructor( argConfigML ){
        if ( !argConfigML ){ argConfigML={}; }
        this.appId    = argConfigML.AppId       || "5820076076281938" ;
        this.secret   = argConfigML.secret      || "NUTGIk5rSkG0GCbRrY1SnY9YAzdr7Sqb" ;
        this.tokenId  = argConfigML.accessToken || "APP_USR-5820076076281938-052315-52ba18c76a43113e114a10ca13e079ce-15103702" ;
        this.refreshToken  = argConfigML.refreshToken ;
        this.refreshTocken = '' ;
        this.requestPromise  = require('request-promise') ;
        this.meliObj    = new melli.Meli( this.appId, this.secret, this.tokenId, this.refreshToken ) ;
        this.dbases     = db(argConfigML.mongoDb) ;
    }
    //
    accessToken(){ // Todavia no funciona esto, nose ni para que es
        return new Promise(function(respData,respRej){
            try {
                //
                this.meliObj.refreshAccessToken(function(err, refresh){
                    console.dir(refresh) ;
                    if ( err ){
                        respRej( err ) ;
                    } else {
                        this.tokenId = refresh ;
                        respData( refresh ) ;
                    }
                }.bind(this)) ;
                //
            } catch(errUser){
                respRej(errUser) ;
            }
        }.bind(this)) ;
    }
    //
}
//
module.exports.class    = MercadolibreGeneric ;
module.exports.instance = (argConfig) => {
    const mlApi = new MercadolibreData(argConfig) ;
    return mlApi ;
}