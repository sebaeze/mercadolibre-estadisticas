/*
*
*/
//
const requestPromise    = require('request-promise') ;
const path              = require('path')            ;
const fs                = require('fs')              ;
const mkdirp            = require('mkdirp') ;
const classMelli        = require( path.join(__dirname,'../mercadolibre/mercadolibreIndex') ).mercadolibre ;
const db                = require( path.join(__dirname,'../db/dbIndex') ).bases ;
//
class BatchSincronizacion {
    constructor( argConfig ){
        this.flagSincronizando  = false ;
        this.configuracionApp   = argConfig ;
        this.tiempoIntervalo    = ( argConfig.batch.intervalo || 3600 ) * 1000 ;
        this.mercadolibre       = classMelli(argConfig) ;
        this.dbases             = db(argConfig.mongoDb) ;
        // Estos campos deben asignarse apenas se ejecute login
        this.mlSellerId         = '' ;
        this.sellerId           = '' ;
        console.log('...Batch sincronizacion:: Intervalo de tiempo: '+this.tiempoIntervalo+' segundos') ;
    }
    //
    iniciarSincronizacion(argSellerId){
        let intervaloSincro = {} ;
        try {
            //
            //argSellerId = {id:'60873335'} ; // BORRAR JYM
            //argSellerId = {id:'33300941'} ; // BORRAR  NADIA-ANDREO
            //
            let intervaloSincro ;
            this.mercadolibre.usuarios.sincronizarUsuario( argSellerId )
                .then(function(respOkSincroUsr){
                    return this.dbases.usuarios.getClientes( {id:'33300941'}, {soloId:true} ) ;
                }.bind(this))
                .then(function(arrayClientes){
                    let arrayPromCli = arrayClientes.map(function(elemCli){
                        return this.mercadolibre.usuarios.sincronizarUsuario( {_id: elemCli,id: elemCli}, {ventas:false} ) ;
                    }.bind(this)) ;
                    return Promise.all( arrayPromCli ) ;
                }.bind(this))
                .then(function(respOkUsr){
                    return this.mercadolibre.productos.iniciarSincronizacionSellerId( argSellerId ) ;
                }.bind(this))
                .then(function(respOkUsr){
                    return setInterval(function(){
                        this.mercadolibre.productos.iniciarSincronizacionSellerId( argSellerId )
                            .then(respOk   => {console.log(new Date().toISOString()+'....sincronizacion ok') ;})
                            .catch(respMal => {
                                console.log(new Date().toISOString()+'....ERROR durante sincronizacion') ;
                                clearInterval(intervaloSincro) ;
                            }) ;
                    }.bind(this), this.tiempoIntervalo ) ;
                }.bind(this))
                .then(function(argIntervalo){
                    intervaloSincro = argIntervalo ;
                    return intervaloSincro ;
                }.bind(this))
                .catch(respErr => { console.dir(respErr) ; throw respErr ; }) ;
            //
        } catch(errSincro){
            console.log('....ERROR: iniciarSincronizacion...') ;
            throw errSincro ;
        }
        return intervaloSincro ;
    }
    //
    sincronizarProductos(){ // Default de 1 hora
        return new Promise(function(respDatos,respRej){
            try{
                this.actualizaProductosMl() ;
                let tiempoIntervarlo = argMiliSegundos * 1000 ;
                let intervaloSincro  = setInterval(function(){
                    console.log(new Date().toISOString()+'..sincronizarProductos::') ;
                    this.actualizaProductosMl() ;
                }.bind(this), tiempoIntervarlo ) ;
                respDatos(intervaloSincro) ;
                //
            } catch(errSinc){
                console.dir(errSinc) ;
                respRej(errSinc) ;
            }
        }.bind(this)) ;
    }
    //
    actualizaProductosMl(){
        return new Promise(function(respDatos,respRej){
            try{
                //
                console.log(new Date().toISOString()+'....actualizaProductosMl..') ;
                let arrayProductos = mercadolibreData.user('60873335') ;
                //
            } catch(errProd){
                respRej(errProd) ;
            }
        }.bind(this)) ;
    }
    //
    buscarProductosPorCategoria(argSellerId,argQuery,argObj2actualizar,argFileName,argFlagValidaTitulo=false){
        return new Promise(function(respDatos,respRej){
            try{
                let mlReq      = {method:'GET',uri: '',contentType: 'application/json',accept: 'application/json' } ;
                let tempUrl    = 'https://api.mercadolibre.com/sites/MLA/search?seller_id='+argSellerId+'&q='+argQuery+'&offset=';
                let cantOffset = 0 ;
                //
                mlReq.uri      = tempUrl+'0' ;
                console.dir(mlReq) ;
                //
                const parseArray2objeto = (argArrayResult) => {
                    if ( typeof argArrayResult=="string" ){ argArrayResult = JSON.parse(argArrayResult); }
                    if ( argArrayResult.results && argArrayResult.results.length>0 ){
                        argArrayResult.results  = argArrayResult.results.sort(function(a, b) {return b.sold_quantity - a.sold_quantity} );
                    }
                    //
                    let tempObj2actualizar = {} ;
                    for(let posRes=0;posRes<argArrayResult.results.length;posRes++){
                        let objProd = argArrayResult.results[posRes] ;
                        if ( argFlagValidaTitulo==true ){
                            let categoriaTitulo = String(objProd.title).toUpperCase().split(' ') ;
                            if ( categoriaTitulo[0]==argQuery.toUpperCase() ){
                                tempObj2actualizar[ objProd.id ] = objProd ;
                            } else {
                                console.log('...esto no corresponde a categoria: '+argQuery+' title: '+objProd.title+';') ;
                            }
                        } else {
                            tempObj2actualizar[ objProd.id ] = objProd ;
                        }
                    }
                    return tempObj2actualizar ;
                }
                //
                requestPromise( mlReq )
                    .then(function(prodOffset0){
                        return parseArray2objeto(prodOffset0) ;
                    }.bind(this))
                    .then(function(productosMl){
                        return this.getItemDetalles(productosMl) ;
                    }.bind(this))
                    .then(function(datosParsed){
                        if ( typeof argObj2actualizar=="object" ){
                            argObj2actualizar = datosParsed ;
                        } else {
                            argObj2actualizar( datosParsed ) ;
                        }
                        return datosParsed ;
                    }.bind(this))
                    .then(function(argObjParsed){
                        //
                        mkdirp( this.pathJson , function(err) {
                            if ( err ){
                                console.log('\n ERROR: MKDIR /json') ;
                                console.dir(err) ;
                                respRej(err);
                            }
                            fs.writeFile( this.pathJson+'/'+argFileName , JSON.stringify(argObjParsed), function(errWrite){
                                if ( errWrite) {
                                    console.log('ERROR: fs.writeFile de jSON de: '+argQuery+';') ;
                                    console.dir(errWrite) ;
                                    respRej(errWrite) ;
                                } else {
                                    respDatos(argObjParsed) ;
                                }
                            }) ;
                        }.bind(this) );
                        //
                    }.bind(this))
                    .catch(respRej) ;
                //
            } catch(errBuscProd){
                respRej(errBuscProd) ;
            }
        }.bind(this)) ;
    }
    //
    getItemDetalles(argMlProductos){
        return new Promise(function(respDatos,respRej){
            try {
                //
                const detalleItem = (argIds) => {
                    try{
                        let listaIds   = argIds.join(',') ;
                        let mlReq      = {method:'GET',uri: 'https://api.mercadolibre.com/items',contentType: 'application/json',accept: 'application/json'} ;
                        mlReq.uri = mlReq.uri + ((argIds.length==1) ? '/' : '?ids=' ) + listaIds ;
                        return requestPromise( mlReq ) ;
                    } catch(errDet){ throw errDet; }
                }
                //
                let tempArrayIds         = Object.keys(argMlProductos) ;
                let arrayPromisesDetalle = [] ;
                let arrayIds10           = [] ;
                for(let insArr=0;insArr<tempArrayIds.length;insArr++){
                    if ( arrayIds10.length>18 ){
                        arrayPromisesDetalle.push( detalleItem(arrayIds10)  ) ;
                        arrayIds10 = [] ;
                    }
                    arrayIds10.push( tempArrayIds[insArr] ) ;
                }
                if ( arrayIds10.length>0 ){ arrayPromisesDetalle.push( detalleItem(arrayIds10)  ) ; }
                //
                Promise.all( arrayPromisesDetalle )
                        .then(function(respPromises){
                            let tempArrayParsed = respPromises.map(function(arrayItems){return JSON.parse(arrayItems) ;}) ;
                            return tempArrayParsed ;
                        }.bind(this))
                        .then(function(arrayDeArray){
                            let tempArrayProductos = [] ;
                            for(let indArrArr=0;indArrArr<arrayDeArray.length;indArrArr++){
                                let tempArr = arrayDeArray[indArrArr] ;
                                if ( Array.isArray(tempArr) ){
                                    tempArr.forEach(elemAr => {
                                        tempArrayProductos.push( elemAr ) ;
                                    }) ;
                                } else {
                                    tempArrayProductos.push( tempArr ) ;
                                }
                            }
                            return tempArrayProductos ;
                        }.bind(this))
                        .then(function(arrayProductos){
                            for(let posArr=0;posArr<arrayProductos.length;posArr++){
                                let objProd = arrayProductos[posArr].body || arrayProductos[posArr] ;
                                argMlProductos[objProd.id] = objProd ;
                            }
                            respDatos(argMlProductos) ;
                        }.bind(this))
                        .catch(errorAll => {
                            console.log('....algo fallo en las promisesss ')  ;
                            respRej(errorAll) ;
                        }) ;
                //
            } catch(errGetItems){
                respRej(errGetItems) ;
            }
        }.bind(this)) ;
    }
    //
    listaProductosMercadolibre(){
        return new Promise(function(respDatos,respRej){
            try{
                //
                respDatos({
                    sindoh: this.listaSindoh,
                    impresoras: this.listaImpresoras,
                    fotocopiadoras: this.listaFotocopiadoras,
                    insumos:this.listaInsumos,
                    otros:this.listaOtros,
                    alquileres: this.listaAlquiler
                }) ;
                //
            } catch(errProd){
                respRej(errProd) ;
            }
        }.bind(this)) ;
    }
    //
}
//
module.exports.batchSincronizacion = (argConfig) => {
    const mlApi = new BatchSincronizacion(argConfig) ;
    return mlApi ;
}
//