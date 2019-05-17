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
                let arrayIds = Array.isArray(argId) ? argId : new Array(argId) ;
                let tempArrayIds = arrayIds.map(elemId => {
                    return elemId.id ;
                }) ;
                this.meliObj.get('users', {
                    ids: tempArrayIds , access_token: this.tokenId
                }, function (err, res) {
                    console.dir(res) ;
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
    cantidadVisitasSegunPeriodo(argId,argCantDias){
        return new Promise(function(respData,respRej){
            try {
                //
                if ( !Array.isArray(argId) ){ argId=new Array(argId); }
                let arrayPromises = argId.map(function(elemId){
                    if ( !elemId.id ){
                        console.dir(elemId) ;
                    }
                    let mlReq = {method:'GET',uri: '',contentType: 'application/json',accept: 'application/json' } ;
                    mlReq.uri = 'https://api.mercadolibre.com/users/'+elemId.id+'/items_visits/time_window?last='+argCantDias+'&unit=day';
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
    sincronizarUsuario(argIds){
        return new Promise(function(respDatos,respRej){
            try {
                let arrayIds = Array.isArray(argIds) ? argIds : new Array(argIds) ;
                this.user( arrayIds )
                    .then(respArrUsers => {
                        //console.dir(respArrUsers) ;
                        return this.cantidadVisitasSegunPeriodo(respArrUsers,10) ;
                    })
                    .then(respInfoUsr => {
                        return this.dbases.vendedores.add( respInfoUsr ) ;
                    })
                    .then(respUsrDb => {
                        respDatos( respUsrDb ) ;
                    })
                    .catch(respErr => {
                        console.dir(respErr) ;
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