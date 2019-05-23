/*
*
*/
const Db          = require('./db').classDb        ;
//
class DbProductos extends Db {
    //
    constructor(argConfigDb){
        super(argConfigDb) ;
        this.collectionNombre = 'productos' ;
    }
    //
    add(argObjProducto){
        return new Promise(function(respData,respRej){
            try {
                //
                let arraydocs = Array.isArray(argObjProducto) ? argObjProducto : new Array(argObjProducto) ;
                for(let posProd=0;posProd<arraydocs.length;posProd++){
                    arraydocs[posProd]._id = arraydocs[posProd].id ;
                }
                //
                this.conectarBase( this.dbName )
                    .then(function(argDb){
                        return argDb ;
                    }.bind(this))
                    .then(function(argDbConn){
                        console.log('.....agregar productos: '+arraydocs.length+';') ;
                        /*
                        if ( arraydocs.length==0 ){
                            respData( arraydocs ) ;
                        } else {
                            argDbConn.collection('productos').insertMany( arraydocs, {w: 'majority', wtimeout: 10000, serializeFunctions: true } ,
                            function(err, r) {
                                if ( err ){
                                    console.log('codigo: '+err.code+';') ;
                                    respRej(err) ;
                                } else {
                                    respData( arraydocs ) ;
                                }
                                argDbConn.cerrar() ;
                            });
                        }
                        */
                        let arrayPromises = [] ;
                        arraydocs.forEach(elemProducto => {
                            let promiseUpdateInsert = this.coneccion.collection( this.collectionNombre )
                                                                    .updateOne({_id:elemProducto.id}, {$set: {...elemProducto}}, {upsert: true} ) ;
                            arrayPromises.push( promiseUpdateInsert ) ;
                        }) ;
                        if ( arrayPromises.length>0 ){
                            return Promise.all( arrayPromises ) ;
                        } else {
                            return [] ;
                        }
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
module.exports.classDb       = DbProductos ;
module.exports.dbUrlInstance = (argConfiguracion) => {
    const objMongoDbMl = new DbProductos(argConfiguracion) ;
    return objMongoDbMl ;
}
//