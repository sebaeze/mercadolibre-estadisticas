/*
*
*/
const Db          = require('./db').classDb        ;
//
class dbUsuarios extends Db {
    //
    constructor(argConfigDb){
        super(argConfigDb) ;
        this.collectionNombre = 'vendedores' ;
    }
    //
    add(argObjUser){
        return new Promise(function(respData,respRej){
            try {
                //
                if ( !Array.isArray(argObjUser) ){ argObjUser=new Array(argObjUser);  } ;
                if ( Array.isArray(argObjUser) && argObjUser.length==0 ){ return([]); } ;
                let flagUsrSinID = false ;
                for( let posUsr=0;posUsr<argObjUser.length;posUsr++){
                    if ( argObjUser[posUsr].id ){
                        argObjUser[posUsr]._id = argObjUser[posUsr].id ;
                    } else {
                        flagUsrSinID = true ;
                    }
                }
                // Solo controla primer usuario si existieran varios
                if ( flagUsrSinID==true ){
                    respRej( {error: 'No existe campo _id en objeto',elemento:argObjUser} ) ;
                } else {
                    let selector       = {_id: {$in:[]} } ;
                    selector._id.$in   = argObjUser.map(elemUsr => {
                        return elemUsr._id || elemUsr.id ;
                    }) ;
                //
                this.conectarBase( this.dbName )
                    .then(function(argDb){
                        let arrayPromises = [] ;
                        argObjUser.forEach(elemUser => {
                            let promiseUpdateInsert = this.coneccion.collection( this.collectionNombre )
                                                                    .updateOne({_id:elemUser.id}, {$set: {...elemUser}}, {upsert: true} ) ;
                            arrayPromises.push( promiseUpdateInsert ) ;
                        }) ;
                        if ( arrayPromises.length>0 ){
                            return Promise.all( arrayPromises ) ;
                        } else {
                            return [] ;
                        }
                    }.bind(this))
                    .then(function(argArrayUsrInserted){
                        respData( argObjUser ) ;
                    }.bind(this))
                    .catch(respRej) ;
                }
                //
            } catch(errAddUrl){
                respRej(errAddUrl) ;
            }
        }.bind(this))
    }
    //
    getClientes(argSellerId,argOpciones={soloId:true} ){
        return new Promise(function(respData,respRej){
            try {
                //
                let tempIdSeller = (typeof argSellerId=='object') ? argSellerId.id||argSellerId._id : argSellerId ;
                console.log('getClientes::tempIdSeller: '+tempIdSeller+';') ;
                //
                this.conectarBase( this.dbName )
                    .then(function(argDb){
                        let selector = {_id: parseInt(tempIdSeller)} ;
                        console.dir(selector) ;
                        return this.coneccion.collection( this.collectionNombre )
                                            .findOne( selector, {projection:{_id:0, ventasRealizadas:1 }} ) ;
                    }.bind(this))
                    .then(function(arrayVentasRealizadas){
                        //this.coneccion.cerrar() ;
                        /*
                        this.cerrarConeccion()
                            .catch((argErr)=>{
                                console.log('....getClientes:: error cerrando coneccion: '+argErr) ;
                            }) ;
                            */
                        if ( argOpciones.soloId==true ){
                            return this.parsearClientesVentas(arrayVentasRealizadas.ventasRealizadas) ;
                        } else {
                            return arrayVentasRealizadas.ventasRealizadas ;
                        }
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
    getVisitas(argSellerId){
        return new Promise(function(respData,respRej){
            try {
                //
                let tempIdSeller = (typeof argSellerId=='object') ? argSellerId.id||argSellerId._id : argSellerId||false ;
                this.conectarBase( this.dbName )
                    .then(function(argDb){
                        let selector = {} ;
                        if ( tempIdSeller ){
                            selector = {_id: parseInt(tempIdSeller)} ;
                        }
                        return this.coneccion.collection( this.collectionNombre )
                                            .find( selector, {projection:{_id:0, nickname:1, country_id:1, visitas:1 }} )
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
    parsearClientesVentas(argArrayVentas){
        let objClientes = {} ;
        try {
            for(let posVenta=0;posVenta<argArrayVentas.length;posVenta++){
                let objVenta = argArrayVentas[posVenta] ;
                if ( !objClientes[objVenta.buyer.id] ){
                    objClientes[objVenta.buyer.id] = objVenta.buyer ;
                }
            }
        } catch(errParsearCli){
            throw errParsearCli ;
        }
        return Object.keys(objClientes) ;
    }
    //
    update(argArrayUsuarios){
        return new Promise(function(respData,respRej){
            try {
                if ( !Array.isArray(argArrayUsuarios) ){ respRej( {error:'dbUsuarios::update:: Argumento debe ser array.'} ); }
            } catch(errUpd){
                respRej(errUpd) ;
            }
        }.bind(this)) ;
    }
    //
}
//
module.exports.classDb       = dbUsuarios ;
module.exports.dbUrlInstance = (argConfiguracion) => {
    const objMongoDbMl = new dbUsuarios(argConfiguracion) ;
    return objMongoDbMl ;
}
//