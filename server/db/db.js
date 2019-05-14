/*
*
*/
const MongoClient = require('mongodb').MongoClient ;
//
class Db  {
    //
    constructor(argConfigDb){
        console.dir(argConfigDb) ;
        if ( !argConfigDb.url      ){ argConfigDb.url='mongodb://localhost:27017'; }
        if ( !argConfigDb.database ){ argConfigDb.database='dburl'; }
        this.dbName  = argConfigDb.database || 'mlestadisticas' ;
        this.urlConnect = argConfigDb.url+'/'+this.dbName ;
        console.log('...connectando: '+this.urlConnect+';') ;
        this.cliente    = new MongoClient( this.urlConnect ,{ useNewUrlParser: true }) ;
    }
    //
    conectarBase(argDB){
        return new Promise(function(respClien,respRech){
            try {
                //
                this.cliente.connect(function(err, client) {
                    if ( err ){
                        console.log('....ERROR connect base: '+argDB+';') ;
                        console.dir(err) ;
                        respRech(err) ;
                    } else {
                        const db = client.db( this.dbName );
                        db.cerrar = client.close ;
                        respClien(db) ;
                    }
                }.bind(this)) ;
                //
            } catch(errConn){
                respRech(errConn) ;
            }
        }.bind(this)) ;
    }
    //
}
//
module.exports.classDb    = Db ;
//