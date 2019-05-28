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
    getVisitasProductos(argSellerId){
        return new Promise(function(respData,respRej){
            try {
                //
                let tempIdSeller = (typeof argSellerId=='object') ? argSellerId.id||argSellerId._id : argSellerId||false ;
                this.conectarBase( this.dbName )
                    .then(function(argDb){
                        let selector = {} ;
                        if ( tempIdSeller ){
                            selector = {seller_id: parseInt(tempIdSeller)} ;
                        }
                        console.dir(selector) ;
                        return this.coneccion.collection( this.collectionNombre )
                                            .find( selector, {projection:{_id:1, title:1, visitas:1, permalink:1 }} )
                                            .sort({totalVisitas:-1})
                                            .limit(10)
                                            .toArray() ;
                    }.bind(this))
                    .then(function(arrayClientes){
                        respData( arrayClientes ) ;
                    }.bind(this))
                    .catch(respRej) ;
                //
            } catch(errGetCli){
                respRej(errGetCli) ;
            }
        }.bind(this)) ;
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