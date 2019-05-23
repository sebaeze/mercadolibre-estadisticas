/*
*   Busqueda de informacion de mercadolibre
*/
const path                 = require('path') ;
const MercadolibreGeneric  = require( path.join(__dirname,'./mercadolibreGeneric') ).class ;
//
class MercadolibreProductos extends  MercadolibreGeneric {
    constructor( argConfigML ){
        super(argConfigML) ;
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
    iniciarSincronizacionSellerId(argSellerId){
        return new Promise(function(respDatos,respRej){
            try{
                //
                this.productosSegunSellerOffset(argSellerId,0,50)
                    .then(function(datosOffset0){
                        try {
                            if ( datosOffset0.results.length==datosOffset0.paging.total ){
                                return datosOffset0.results ;
                            } else {
                                return this.buscarProductosPendientes(argSellerId,datosOffset0.results,datosOffset0.paging.limit,datosOffset0.paging.total) ;
                            }
                        } catch(errOffset0){
                            //console.dir(datosOffset0) ;
                            console.dir(errOffset0) ;
                        }
                    }.bind(this))
                    .then(function(datosOffset1){
                        console.log('....(2) then: ll: '+datosOffset1.length+';') ;
                        return this.parseArray2objeto(datosOffset1,argSellerId) ;
                    }.bind(this))
                    .then(function(productosMl){
                        console.log('....(3) then: ll: '+Object.keys(productosMl).length+';') ;
                        return this.getItemDetalles(productosMl) ;
                    }.bind(this))
                    .then(function(datosParsed){
                        console.log('....(4) then: ll: '+Object.keys(datosParsed).length+';') ;
                        return this.dbases.productos.add( Object.values(datosParsed) ) ;
                    }.bind(this))
                    .then(function(datosAdded){
                        console.log('....(6) then: ll: '+datosAdded.length+';') ;
                        respDatos( datosAdded ) ;
                    }.bind(this))
                    .catch(errPRod => {
                        console.log('...estoy en .catch superior de iniciarSincronizacionSellerId ') ;
                        console.dir(errPRod) ;
                        respRej(errPRod) ;
                    })
                //
            } catch(errSinc){
                console.dir(errSinc) ;
                respRej(errSinc) ;
            }
        }.bind(this)) ;
    }
    //
    parseProductosVendedor(argArrayResult,argSellerId){
        let tempObj2actualizar = {
            _id: argSellerId,
            vendedorId: argSellerId,
            cantidadProductos: 0,
            disponibles: 0,
            vendidos: 0,
            categoriasTitulo:{}
        } ;
        try {
            tempObj2actualizar.cantidadProductos = argArrayResult.length ;
            for(let posRes=0;posRes<argArrayResult.length;posRes++){
                let objProd                          = argArrayResult[posRes] ;
                let categoriaSegunTitulo             = String(objProd.title).toUpperCase().split(' ') ;
                categoriaSegunTitulo                 = categoriaSegunTitulo[0] ;
                tempObj2actualizar.disponibles      += objProd.available_quantity ;
                tempObj2actualizar.vendidos         += objProd.sold_quantity ;
                if ( !tempObj2actualizar.categoriasTitulo[categoriaSegunTitulo] ){
                    tempObj2actualizar.categoriasTitulo[categoriaSegunTitulo] = {
                        cantidad: 0,
                        nombre: categoriaSegunTitulo
                    }
                }
                tempObj2actualizar.categoriasTitulo[categoriaSegunTitulo].cantidad++ ;
            }
            //
        } catch(errArray2Obj){
            throw errArray2Obj ;
        }
        return tempObj2actualizar ;
    }
    //
    parseArray2objeto(argArrayResult,argSellerId){
        let tempObj2actualizar = {} ;
        try {
            //
            if ( typeof argArrayResult=="string" ){
                argArrayResult = JSON.parse(argArrayResult);
                if ( argArrayResult.results && argArrayResult.results.length>0 ){
                    argArrayResult = argArrayResult.results ;
                }
            }
            //
            for(let posRes=0;posRes<argArrayResult.length;posRes++){
                let objProd = argArrayResult[posRes] ;
                objProd.categoriaSegunTitulo     = String(objProd.title).toUpperCase().split(' ') ;
                objProd.categoriaSegunTitulo     = objProd.categoriaSegunTitulo[0] ;
                objProd._id                      = objProd.id  ;
                objProd.sellerId                 = argSellerId ;
                tempObj2actualizar[ objProd.id ] = objProd ;
            }
            //
        } catch(errArray2Obj){
            throw errArray2Obj ;
        }
        return tempObj2actualizar ;
    }
    //
    buscarProductosPendientes(argSellerId,argDatosOffset0,argLimit,argTotal){
        return new Promise(function(respDatos,respRej){
            try{
                //
                let offsetFaltan = argTotal/argLimit ;
                offsetFaltan     = Math.ceil( parseInt(offsetFaltan) ) ;
                //
                let arrayDatos     = argDatosOffset0 ;
                let arrayPromises  = [] ;
                let offSetPosicion = argDatosOffset0.length ? argDatosOffset0.length : 0 ;
                for(let posProm=1;posProm<=offsetFaltan;posProm++){
                    offSetPosicion++ ;
                    if ( offSetPosicion>argTotal ){
                        let faltantes   = offSetPosicion - argTotal ;
                        offSetPosicion -= faltantes ;
                    }
                    arrayPromises.push( this.productosSegunSellerOffset(argSellerId,offSetPosicion,argLimit) ) ;
                    offSetPosicion += argLimit ;
                }
                //
                Promise.all( arrayPromises )
                        .then(function(respPromises){
                            for( let posArr=0;posArr<respPromises.length;posArr++){
                                arrayDatos = arrayDatos.concat( respPromises[posArr].results ) ;
                            }
                            respDatos(arrayDatos) ;
                        }.bind(this))
                        .catch(errorAll => {
                            console.log('....algo fallo en las promisesss ')  ;
                            console.dir(errorAll) ;
                            respRej(errorAll) ;
                        }) ;
                //
            } catch(errSinc){
                console.dir(errSinc) ;
                respRej(errSinc) ;
            }
        }.bind(this)) ;
    }
    //
    productosSegunSellerOffset(argSellerId,argOffset=0,argLimit=50){
        return new Promise(function(respDatos,respRej){
            try{
                let tempId = (typeof argSellerId=="object") ? argSellerId.id : argSellerId ;
                /*  El siguiente API solo funciona cuando el token corresponde al sellerid en busqueda
                //   /users/{Cust_id}/items/search?access_token=$ACCESS_TOKEN
                //this.meliObj.get( 'users/'+tempId+'/items/search' , {},
                */
                this.meliObj.get( 'sites/MLA/search' , {seller_id: tempId, offset: argOffset, limit: argLimit},
                    function (err, res) {
                        if ( err ){
                            console.dir(err);
                            respRej( err ) ;
                        } else {
                            if ( !res.status ){ res.status=200; }
                            if ( res.status>=200 && res.status<400 ){
                                respDatos( res ) ;
                            } else {
                                respRej( res ) ;
                            }
                        }
                    }) ;
                //
            } catch(errSinc){
                console.dir(errSinc) ;
                respRej(errSinc) ;
            }
        }.bind(this)) ;
    }
    //
    sincronizarProductos(argMiliSegundos=3600){ // Default de 1 hora
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
    getItemDetalles(argMlProductos){
        return new Promise(function(respDatos,respRej){
            try {
                //
                const detalleItem = (argIds) => {
                    try{
                        let listaIds   = argIds.join(',') ;
                        let mlReq      = {method:'GET',uri: 'https://api.mercadolibre.com/items',contentType: 'application/json',accept: 'application/json'} ;
                        mlReq.uri = mlReq.uri + ((argIds.length==1) ? '/' : '?ids=' ) + listaIds ;
                        return this.requestPromise( mlReq ) ;
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
}
//
module.exports.class    = MercadolibreProductos ;
module.exports.instance = (argConfig) => {
    const mlApi = new MercadolibreProductos(argConfig) ;
    return mlApi ;
}