/*
*   Busqueda de informacion de mercadolibre
*/
const path                 = require('path') ;
const MercadolibreGeneric  = require( path.join(__dirname,'./mercadolibreGeneric') ).class ;
//
Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}
Date.prototype.lessDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() - days);
    return date ;
}
//
class MercadolibreUsuarios extends  MercadolibreGeneric {
    constructor( argConfigML ){
        super(argConfigML) ;
    }
    //
    user(argId){
        return new Promise(function(respDatos,respRej){
            try {
                let arrayIds     = Array.isArray(argId) ? argId : new Array(argId) ;
                let tempArrayIds = arrayIds.map(elemId => {
                    if ( typeof elemId!="object" ){throw new Error('mercadolibreUsuarios::get:: Argumento debe ser array de objetos'); }
                    return elemId.id ;
                }) ;
                this.meliObj.get('users', {
                    ids: tempArrayIds , access_token: this.tokenId
                }, function (err, res) {
                    //
                    let arrayUsrInfo = res.map(elemUser => {
                        let tempObjUsr = {
                            _id: elemUser.body.id || '',
                            ...elemUser.body
                        }
                        return tempObjUsr ;
                    }) ;
                    //
                    respDatos( arrayUsrInfo ) ;
                    //
                }) ;
                //
            } catch(errUser){
                respRej(errUser) ;
            }
        }.bind(this)) ;
    }
    //
    buscarOrdenes(argUsr){
        return new Promise(function(respDatos,respRej){
            try {
                //
                if ( Array.isArray(argUsr) ){throw new Error('mercadolibreUsuarios::buscarOrdenes:: Argumento no puede ser Array'); }
                this.buscarOrdenesSellerId('recent',argUsr)
                    .then(function(ordenesRecent){
                        return this.buscarOrdenesSellerId('archived',ordenesRecent) ;
                    }.bind(this))
                    .then(function(ordenesAll){
                        console.dir(ordenesAll.ventasRealizadas) ;
                        console.log('....(2) buscarOrdenes:: ') ;
                        respDatos( ordenesAll ) ;
                    }.bind(this))
                    .catch(function(errBuscaORd){
                        console.dir(errBuscaORd) ;
                        respRej(errBuscaORd) ;
                    }) ;
                //
            } catch(errOrden){
                respRej(errOrden) ;
            }
        }.bind(this)) ;
    }//
    buscarOrdenesSellerId(argTipo,argSelledId){
        return new Promise(function(respDatos,respRej){
            try {
                if ( argTipo!='archived' && argTipo!='recent'){throw new Error("ERROR: buscarOrdenesArchivadas:: TipoOperacionInvalida: "+argTipo+';'); }
                //
                //this.meliObj.get('orders/search/archived', {
                this.meliObj.get('orders/search/'+argTipo, {
                    seller: argSelledId.id, access_token: this.tokenId
                }, function (err, res) {
                    if ( err ){
                        respRej( err ) ;
                    } else {
                        if ( !res.status ){ res.status=200; }
                        if ( res.status>=200 && res.status<=400 ){
                            console.log('.....buscarOrdenes:: l: '+res.results.length+';') ;
                            for(let posCompra=0;posCompra<res.results.length;posCompra++){
                                let objCompra = res.results[posCompra] ;
                                console.log('order_request: '+JSON.stringify(objCompra.order_request)+' buyer: '+JSON.stringify(objCompra.buyer)) ;
                            }
                            if ( !argSelledId.ventasRealizadas ){ argSelledId.ventasRealizadas=[]; }
                            if ( res.results.length>0 ){
                                argSelledId.ventasRealizadas = argSelledId.ventasRealizadas.concat(res.results) ;
                            }
                            respDatos( argSelledId ) ;
                        } else {
                            respRej( res ) ;
                        }
                    }
                }) ;
                //
            } catch(errOrden){
                respRej(errOrden) ;
            }
        }.bind(this)) ;
    }
    //
    cantidadVisitasSegunPeriodo(argId,argCantDias){
        return new Promise(function(respData,respRej){
            try {
                //
                if ( !Array.isArray(argId) ){ argId=new Array(argId); }
                //
                let arrayPromises = argId.map(function(elemId){
                    let mlReq = {} ;
                    if ( !elemId._id && !elemId.id ){
                        console.log('.....ERROR::cantidadVisitasSegunPeriodo: Elemento sin _id ni id: obj: '+elemId+';') ;
                        console.dir(elemId) ;
                        throw new Error('.....ERROR::cantidadVisitasSegunPeriodo: Elemento sin _id ni id: obj: '+elemId+';') ;
                    } else {
                        mlReq = {method:'GET',uri: '',contentType: 'application/json',accept: 'application/json' } ;
                        mlReq.uri = 'https://api.mercadolibre.com/users/'+elemId.id+'/items_visits/time_window?last='+argCantDias+'&unit=day';
                    }
                    return this.requestPromise( mlReq ) ;
                }.bind(this)) ;
                //
                Promise.all( arrayPromises )
                        .then(function(respPromises){
                            for( let posArr=0;posArr<respPromises.length;posArr++){
                                let objVisitas = respPromises[posArr] ;
                                if (typeof objVisitas=="string"){objVisitas=JSON.parse(objVisitas); }
                                let posObjUser = argId.findIndex(elemUsr => { return elemUsr.id==objVisitas.user_id; }) ;
                                if ( posObjUser!=-1 ){
                                    argId[posObjUser].visitas = objVisitas.results ;
                                }
                            }
                            respData(argId) ;
                        }.bind(this))
                        .catch(errorAll => {
                            console.log('....algo fallo en las promisesss ')  ;
                            console.dir(errorAll) ;
                            respRej(errorAll) ;
                        }) ;
                //
            } catch(errUser){
                respRej(errUser) ;
            }
        }.bind(this)) ;
    }
    //
    cantidadDeVisitas2Seller(argSellerId,argFechaDesde,argFechaHast){
        return new Promise(function(respData,respRej){
            try {
                //
                let mlReq = {method:'GET',uri: '',contentType: 'application/json',accept: 'application/json' } ;
                mlReq.uri = 'https://api.mercadolibre.com/users/'+argSellerId+'/items_visits?date_from='+argFechaDesde+'&date_to='+argFechaHast;
                //
                this.requestPromise( mlReq )
                    .then(mlVisitas => {
                        respData(mlVisitas) ;
                    })
                    .catch(mlError => {
                        console.dir(mlError) ;
                        respRej( mlError ) ;
                    }) ;
                //
            } catch(errUser){
                respRej(errUser) ;
            }
        }.bind(this)) ;
    }
    //
    sincronizarUsuario(argIds,argOpciones={ventas:true}){
        return new Promise(function(respDatos,respRej){
            try {
                //
                if (Array.isArray(argIds)){ throw new Error('ERROR::sincronizarUsuario:: Argumento no puede ser array'); }
                //
                this.user( argIds )
                    .then(respArrUsers => {
                       return this.cantidadVisitasSegunPeriodo(respArrUsers,300) ;
                    })
                    .then(respArrUsers => {
                        if ( Array.isArray(respArrUsers) ){respArrUsers=respArrUsers[0]; }
                        if ( argOpciones.ventas==true ) {
                            return this.buscarOrdenes(respArrUsers) ;
                        } else {
                            return respArrUsers ;
                        }
                     })
                    .then(respInfoUsrUlt => {
                        return this.dbases.usuarios.add( respInfoUsrUlt ) ;
                    })
                    .then(respUsrDb => {
                        respDatos( respUsrDb ) ;
                    })
                    .catch(respErr => {
                        //console.dir(respErr) ;
                        console.log('.....ERROR en sincroniarUsuario') ;
                        respRej(respErr) ;
                    }) ;
                //
            } catch(errUser){
                respRej(errUser) ;
            }
        }.bind(this)) ;
    }
    //
}
//
module.exports.class    = MercadolibreUsuarios ;
module.exports.instance = (argConfig) => {
    const mlApi = new MercadolibreUsuarios(argConfig) ;
    return mlApi ;
}