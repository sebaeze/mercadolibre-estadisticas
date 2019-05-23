/*
*
*/
const MongoClient = require('mongodb').MongoClient ;
//
class Db  {
    //
    constructor(argConfigDb){
        if ( !argConfigDb.url      ){ argConfigDb.url='mongodb://localhost:27017'; }
        if ( !argConfigDb.database ){ argConfigDb.database='dburl'; }
        this.dbName     = argConfigDb.database || 'mlestadisticas' ;
        this.urlConnect = argConfigDb.url ; //+'/'+this.dbName ;
        this.cliente    = new MongoClient( this.urlConnect ,{ useNewUrlParser: true }) ;
        this.coneccion  ;
    }
    //
    cerrarConeccion(){
        return new Promise(function(respConn,respRej){
            try {
                if ( this.coneccion ){
                    this.coneccion.cerrar(function(errClose){
                        if ( errClose ){
                            console.log('.....ERROR: cerrando coneccion: ') ;
                            console.dir(errClose) ;
                        }
                        respConn() ;
                        this.coneccion = null ;
                    }.bind(this)) ;
                } else {
                    console.log('.....coneccion no existia') ;
                    respConn() ;
                }
            } catch(errClose){
                respRej(errClose) ;
            }
        }.bind(this)) ;
    }
    //
    conectarBase(argDB){
        return new Promise(function(respClien,respRech){
            try {
                //
                console.log('...connectando: '+this.urlConnect+';') ;
                if ( this.coneccion ){
                    console.log('......coneccion ya existia') ;
                    respClien( this.coneccion ) ;
                } else {
                    this.cliente.connect(function(err, client) {
                        if ( err ){
                            console.log('....ERROR connect base: '+argDB+';') ;
                            console.dir(err) ;
                            respRech(err) ;
                        } else {
                            const db       = client.db( this.dbName );
                            db.cerrar      = client.close ;
                            client.cerrar  = client.close ;
                            this.coneccion = db ;
                            respClien(db) ;
                        }
                    }.bind(this)) ;
                }
                //
            } catch(errConn){
                respRech(errConn) ;
            }
        }.bind(this)) ;
    }
    //
    promiseFind(argColl,argFindSelector){
        return new Promise(function(respData,respRej){
            try {
                this.coneccion.collection( argColl ).find(argFindSelector).toArray(function(argErr,argDatos){
                    if ( argErr ){
                        console.dir(argErr) ;
                        console.log('....ERROR: Durante find: ') ;
                        respRej(argErr) ;
                    } else {
                        respData(argDatos) ;
                    }
                }) ;
            } catch( errFind ){
                respRej(errFind) ;
            }
        }.bind(this)) ;
    }
    //
}
//
module.exports.classDb    = Db ;
//