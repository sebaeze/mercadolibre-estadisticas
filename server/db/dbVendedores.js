/*
*
*/
const Db          = require('./db').classDb        ;
//
class DbVendedores extends Db {
    //
    constructor(argConfigDb){
        super(argConfigDb) ;
        this.collectionNombre = 'vendedores' ;
    }
    //
    add(argObjProducto){
        return new Promise(function(respData,respRej){
            try {
                //
                let arraydocs = Array.isArray(argObjProducto) ? argObjProducto : new Array(argObjProducto) ;
                this.conectarBase( this.dbName )
                    .then(function(argDb){
                        return argDb ;
                    }.bind(this))
                    .then(function(argDbConn){
                        argDbConn.collection( this.collectionNombre ).insertMany( arraydocs, {w: 'majority', wtimeout: 10000, serializeFunctions: true } ,
                        function(err, r) {
                            if ( err ){
                                console.log('codigo: '+err.code+';') ;
                                respRej(err) ;
                            } else {
                                respData( argObjProducto ) ;
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
module.exports.classDb       = DbVendedores ;
module.exports.dbUrlInstance = (argConfiguracion) => {
    const objMongoDbMl = new DbVendedores(argConfiguracion) ;
    return objMongoDbMl ;
}
//