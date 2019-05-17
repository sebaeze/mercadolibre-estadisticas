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
        this.tokenId  = argConfigML.accessToken || "APP_USR-5820076076281938-051417-8e1d70d4e3657eca23ee620caf013915-15103702" ;
        this.refreshTocken = '' ;
        this.requestPromise  = require('request-promise') ;
        this.meliObj    = new melli.Meli( this.appId, this.secret, this.tokenId ); //, [access_token], [refresh_token]);
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