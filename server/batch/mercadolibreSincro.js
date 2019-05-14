/*
*   Busqueda de informacion de mercadolibre
*/
const melli           = require('mercadolibre')    ;
const requestPromise  = require('request-promise') ;
const path            = require('path')            ;
const db              = require( path.join(__dirname,'../db/dbIndex') ).bases ;
//
class MercadolibreData {
    constructor( argConfigML ){
        if ( !argConfigML ){ argConfigML={}; }
        this.appId    = argConfigML.AppId       || "5820076076281938" ;
        this.secret   = argConfigML.secret      || "NUTGIk5rSkG0GCbRrY1SnY9YAzdr7Sqb" ;
        this.tokenId  = argConfigML.accessToken || "APP_USR-5820076076281938-051417-8e1d70d4e3657eca23ee620caf013915-15103702" ;
        this.meliObj  = new melli.Meli( this.appId, this.secret, this.tokenId ); //, [access_token], [refresh_token]);
        this.dbases   = db(argConfigML.mongoDb) ;
    }
    //
    accessToken(){
        return new Promise(function(respData,respRej){
            try {
                //
                this.meliObj.refreshAccessToken(function(err, refresh){
                    console.dir(refresh) ;
                    if ( err ){
                        respRej( err ) ;
                    } else {
                        respData( refresh ) ;
                    }
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
                            console.dir(datosOffset0) ;
                            console.dir(errOffset0) ;
                        }
                    }.bind(this))
                    .then(function(datosOffset1){
                        console.log('....(2) then: ll: '+datosOffset1.length+';') ;
                        return this.parseArray2objeto(datosOffset1) ;
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
                        console.log('....(5) then: ll: '+datosAdded.length+';') ;
                        respDatos( datosAdded ) ;
                    }.bind(this))
                    .catch(errPRod => {
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
    cantidadDeVisitas2Seller(argSellerId,argFechaDesde,argFechaHast){
        return new Promise(function(respData,respRej){
            try {
                //
                let mlReq = {method:'GET',uri: '',contentType: 'application/json',accept: 'application/json' } ;
                mlReq.uri = 'https://api.mercadolibre.com/users/'+argSellerId+'/items_visits?date_from='+argFechaDesde+'&date_to='+argFechaHast;
                //
                requestPromise( mlReq )
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
    parseArray2objeto(argArrayResult){
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
                objProd._id                      = objProd.id ;
                tempObj2actualizar[ objProd.id ] = objProd ;
            }
            //
        } catch(errArray2Obj){
            throw errArray2Obj ;
        }
        return tempObj2actualizar ;
    }
    //
    user(argId){
        return new Promise(function(respDatos,respRej){
            try {
                let arrayIds = Array.isArray(argId) ? argId : new Array(argId) ;
                this.meliObj.get('users', {
                    ids: arrayIds, access_token: this.tokenId
                }, function (err, res) {
                    console.log(err, res);
                    console.log('\n\n seller_reputation: ') ;
                    console.dir(res[0].body.seller_reputation) ;
                    //
                    respDatos(res) ;
                }) ;
                //
            } catch(errUser){
                respRej(errUser) ;
            }
        }.bind(this)) ;
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
                this.meliObj.get( 'sites/MLA/search' , {seller_id: argSellerId, offset: argOffset, limit: argLimit},
                function (err, res) {
                    if ( err ){
                        console.dir(err);
                        respRej( err ) ;
                    } else {
                        respDatos( res ) ;
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
    actualizaProductosMl(){
        return new Promise(function(respDatos,respRej){
            try{
                //
                console.log(new Date().toISOString()+'....actualizaProductosMl..') ;
                //
                let arrayPromises = [] ;
                arrayPromises.push( this.buscarProductosPorCategoria(this.mlSellerId,'impresora'    ,
                                    function(argDato){this.listaImpresoras=argDato; }.bind(this) ,
                                    this.pathFileImpresoras, true )) ;
                arrayPromises.push( this.buscarProductosPorCategoria(this.mlSellerId,'sindoh   '    ,
                                    function(argDato){this.listaSindoh=argDato; }.bind(this) ,
                                    this.pathFileSindoh    , false)) ;
                arrayPromises.push( this.buscarProductosPorCategoria(this.mlSellerId,'fotocopiadora',
                                    function(argDato){this.listaFotocopiadoras=argDato; }.bind(this) ,
                                    this.pathFileFotocop   , true )) ;
                arrayPromises.push( this.buscarProductosPorCategoria(this.mlSellerId,'insumo'       ,
                                    function(argDato){this.listaInsumos=argDato; }.bind(this) ,
                                    this.pathFileInsumos   , false)) ;
                arrayPromises.push( this.buscarProductosPorCategoria(this.mlSellerId,'chip+fusible' ,
                                    function(argDato){this.listaOtros=argDato; }.bind(this) ,
                                    this.pathFileOtros     , false)) ;
                arrayPromises.push( this.buscarProductosPorCategoria(this.mlSellerId,'alquiler' ,
                                    function(argDato){this.listaAlquiler=argDato; }.bind(this) ,
                                    this.pathFileAlquiler  , false)) ;
                //
                Promise.all( arrayPromises )
                        .then(function(respPromises){
                            respDatos(respPromises) ;
                        }.bind(this))
                        .catch(errorAll => {
                            console.log('....algo fallo en las promisesss ')  ;
                            console.dir(errorAll) ;
                            respRej(errorAll) ;
                        }) ;
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
module.exports.mercadolibreDatos = (argConfig) => {
    const mlApi = new MercadolibreData(argConfig) ;
    return mlApi ;
}