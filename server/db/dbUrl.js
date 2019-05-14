/*
*
*/
const Db          = require('./db').classDb        ;
//
class DbUrl extends Db {
    //
    constructor(argConfigDb){ super(argConfigDb) ; }
    //
    addUrl(argObjUrl){
        return new Promise(function(respData,respRej){
            try {
                //
                this.conectarBase( this.dbName )
                    .then(function(argDb){
                        return argDb ;
                    }.bind(this))
                    .then(function(argDbConn){
                        argDbConn.collection('url').insertOne( argObjUrl, {w: 'majority', wtimeout: 10000, serializeFunctions: true } ,
                        function(err, r) {
                            if ( err ){
                                console.log('codigo: '+err.code+';') ;
                                respRej(err) ;
                            } else {
                                respData( r ) ;
                            }
                            argDbConn.cerrar() ;
                        });
                      //
                    }.bind(this))
                    .catch(respRej) ;
                //
            } catch(errAddUrl){
                respRej(errAddUrl) ;
            }
        }.bind(this))
    }
    //
}
//
module.exports.classDb       = DbUrl ;
module.exports.dbUrlInstance = (argConfiguracion) => {
    const objMongoDbMl = new DbUrl(argConfiguracion) ;
    return objMongoDbMl ;
}
//