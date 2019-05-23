/*
*  Strategies for Passportjs
*/
const LocalStrategy        = require('passport-local').Strategy              ;
const GoogleStrategy       = require('passport-google-oauth').OAuth2Strategy ;
const MercadoLibreStrategy = require('passport-mercadolibre').Strategy       ;
const FacebookStrategy     = require('passport-facebook').Strategy           ;
const path                 = require('path') ;
const eventos              = require( path.join(__dirname,'../lib/emisorEventos') ) ;
//
//
module.exports.strategies = (argConfig) => {
    //
    let outStrategies = {} ;
    for( let keyStrategy in argConfig ){
        //
        let classStrategy  ;
        switch( keyStrategy ){
            case 'local':
                classStrategy = LocalStrategy ;
            break ;
            case 'google':
                classStrategy = GoogleStrategy ;
            break ;
            case 'mercadolibre':
                classStrategy = MercadoLibreStrategy ;
            break ;
            case 'facebook':
                classStrategy = FacebookStrategy ;
            break ;
            default:
                throw new Error('ERROR: No se conoce estrategi: '+keyStrategy+';') ;
        }
        //
        outStrategies[ keyStrategy ] = {
                strategy: new classStrategy({
                clientID: argConfig[keyStrategy].clientID ,
                clientSecret: argConfig[keyStrategy].clientSecret ,
                callbackURL: argConfig[keyStrategy].callbackURL,
                scope: [ 'read_public', 'read_relationships' ],
                passReqToCallback: true
            },
            async function(req,accessToken, refreshToken, profile, done){
                //
                console.log('token: '+accessToken+' refreshToken: '+refreshToken+' email: '+(profile.email ? profile.email : 'NO_EMAIL')) ;
                //console.dir(profile) ;
                //
                profile = profile || {};
                profile.accessToken = accessToken;
                profile.refreshToken = refreshToken;
                //
                eventos.emit('sincronizar-usuario',profile) ;
                //
                return done(null, profile );
                //
            }.bind(this))
        }
    }
    //
    return outStrategies ;
    //
}  ;
//