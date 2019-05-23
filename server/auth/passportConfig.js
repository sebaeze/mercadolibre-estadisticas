/*
*    Passport configuration for our app
*/
const passport            = require('passport') ;
const router              = require('express').Router()   ;
const path                = require('path')     ;
const eventos             = require( path.join(__dirname,'../lib/emisorEventos') ) ;
//
const configPassportApp = (argConfigPassport,argApp) => {
  //
  const strategies        = require('./passportStrategy').strategies( argConfigPassport ) ;
  //
  for ( let keyStrategy in strategies ){
    let objStrategy = strategies[keyStrategy] ;
    let objRedirects = { successRedirect: '/',
                          failureRedirect: '/login',
                          failureFlash: false
                        } ;
    //
    if ( argConfigPassport[keyStrategy].scope ){ objRedirects['scope']=argConfigPassport[keyStrategy].scope; }
    if ( argConfigPassport[keyStrategy].urlLogin ){
      router.all( argConfigPassport[keyStrategy].urlLogin ,
          function(req,res,next){
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', '*');
            res.header("Access-Control-Allow-Credentials", true);
            res.header("credentials","same-origin") ;
            next() ;
          },
          passport.authenticate(keyStrategy,objRedirects)
        ) ;
    }
    if ( argConfigPassport[keyStrategy].pathUrlCallback ){
      router.get(argConfigPassport[keyStrategy].pathUrlCallback, function(req, res, next) {
        passport.authenticate(keyStrategy,function(err, user, info) {
          if (err) {
            console.log('err: '+err+';') ;
          } else {
            console.log('user: ') ;
            console.dir(user.email) ;
          }
          //
          if (!user) { return res.redirect('/'); }
          req.logIn(user, function(err) {
            if (err) { return next(err); }
            req.session.user = user ;
            return res.redirect('/');
          });
          //
        })(req, res, next);
      });
    }
    //
    passport.use( objStrategy.strategy ) ;
      //
    passport.serializeUser(function(user, done) { done(null, user)   ; });
    passport.deserializeUser(function(user, done) { done(null, user) ; });
    //
  }
  //
  argApp.use( passport.initialize() ) ;
  argApp.use( passport.session()    ) ;
  //
  return {
    passport: passport,
    routes: router
  } ;
  //
} ;
//
module.exports.configApp = configPassportApp ;
//