/*
*
*//*
*  Funciones genericas y utilitarios
*/
const fs                  = require('fs')       ;
const path                = require('path')     ;
//
class Util {
    //
    constructor(){
        this.distPath   = path.join(__dirname, '../../dist') ;
        this.pathConfig = path.join(__dirname, '../config/config.json') ;
    }
    //
    configApp(){
        return this.parseArchivoJson2Js( this.pathConfig ) ;
    }
    //
    getDistPath(){
        return this.distPath ;
    }
    //
    parseArchivoJson2Js(argArchivo){
        let outJsonJs = {} ;
        try {
            let jsonString = fs.readFileSync( argArchivo );
            outJsonJs      = JSON.parse(jsonString) ;
        } catch(errParse){
            throw errParse ;
        }
        return outJsonJs ;
    }
    //
    htmlContent(argHtmlFile){
        let htmlConceptos = '' ;
        try{
            let htmlDir       = this.distPath+'/'+argHtmlFile;
            htmlConceptos     = fs.readFileSync( htmlDir );
        } catch(errReadHtml){
            throw errReadHtml ;
        }
        return htmlConceptos ;
    }
    //
    groupBy(array, cb, mapCb, flagDuplicados=true ) {
        var groups           = Object.create(null);
        let objSinDuplicados = {} ;
        array.forEach(function (o) {
            var key = cb(o);
            groups[key] = groups[key] || [];
            let obj2Guardar = o ;
            if ( typeof mapCb!="undefined" ){
                obj2Guardar = mapCb(o) ;
            }
            // Controla duplicados
            if ( flagDuplicados===false ){
                let keyBuscaPrev = key.trim() + String(obj2Guardar).trim() ;
                if ( !objSinDuplicados[ keyBuscaPrev ]  ){
                    groups[key].push( obj2Guardar );
                }
                objSinDuplicados[ keyBuscaPrev ] = true ;
            } else {
                groups[key].push( obj2Guardar );
            }
        });
        return groups;
    }
    //
}
//
module.exports.classUtilitario = Util ;
//
module.exports.Utilitarios = () => {
    return new Util() ;
}