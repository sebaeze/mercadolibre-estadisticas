/*
*  APIs con Express.js
*/
//const passportConfig  = require('../auth/passportConfig').configApp ;
//const requestPromise  = require('request-promise') ;
//
const iniciarApi = ( argConfig ) => {
    //
    const express                = require('express')     ;
    const app                    = express() ;
    const path                   = require('path') ;
    const bodyParser             = require('body-parser')     ;
    const cookieParser           = require('cookie-parser')   ;
    const session                = require('express-session') ;
    const MemoryStore            = require('session-memory-store')(session);
    const utilitario             = require( path.join(__dirname,'../lib/utiles') ).Utilitarios() ;
    const config                 = utilitario.configApp() ;
    const mercadolibrePassport   = require( path.join(__dirname,'../auth/passportConfig') ).configApp ; //(  config.passport )  ;
    /*
    const utilitario = require( path.join(__dirname,'../lib/utiles') ).Utilitarios() ;
    const config     = utilitario.configApp() ;
    */
    //
      // hack to make SSO work
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
      app.use(cookieParser()) ;
      //app.use(cookieSession({ secret: 'wsx22wsx', cookie: {path: '/',httpOnly: true,secure: false,maxAge: '1d' } }));
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({extended: true}));
      app.use(session({ name:'mlsess',secret: 'wsx22wsx',cookie: {path: '/',httpOnly: true,maxAge: 6000000 },proxy: true, resave: true,saveUninitialized: true, store: new MemoryStore() }));
      //
      const passportConfigured = mercadolibrePassport(  config.passport, app )  ;
      /*
      const passport               = require('passport') ;
      app.use( passport.initialize() ) ;
      app.use( passport.session()    ) ;
      //
      const MercadoLibreStrategy = require('passport-mercadolibre').Strategy ;
      passport.use(new MercadoLibreStrategy({
          clientID: argConfig.passport.mercadolibre.clientID,
          clientSecret: argConfig.passport.mercadolibre.clientSecret ,
          callbackURL: argConfig.passport.mercadolibre.callbackURL,
          scope: [ 'read_public', 'read_relationships' ],
          passReqToCallback: true
        },
        function (req,accessToken, refreshToken, profile, done) {
          console.log('type: '+typeof done+' login: '+typeof req.login+';') ;
          console.log('here is req.user: '+ req.user+' accessToken: '+accessToken+' refreshToken: '+refreshToken+';');
          profile = profile || {};
          profile.accessToken = accessToken;
          profile.refreshToken = refreshToken;
          return done(null, profile);
          //
        }
      ));
      //
      passport.serializeUser(function (user, done) {
        done(null, user);
      });
      //
      passport.deserializeUser(function (user, done) {
        done(null, user);
      });
      */
      //
      app.disable('x-powered-by');
      app.disable('etag');
      //
      app.all('*', function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', '*');
        res.header("Access-Control-Allow-Credentials", true);
        res.header("credentials","same-origin") ;
        console.log( new Date().toISOString()+'... '+req.method+' url: '+req.url+' authenticated: '+req.isAuthenticated()+' name: '+(req.isAuthenticated() ? req.user.email : 'not_logged')) ;
        next() ;
      }) ;
      /*
    *   Rutas
    */
    var routerIndex          = require( path.join(__dirname,'/rutas/routerIndex') )(argConfig) ;
    app.use('/'              , routerIndex           ) ;
    app.use( '/auth/', passportConfigured.routes ) ;
    //
    /*
  app.all('/auth/mercadolibre',
      function(req,res,next){
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', '*');
        res.header("Access-Control-Allow-Credentials", true);
        res.header("credentials","same-origin") ;
        next() ;
      },
      passport.authenticate('mercadolibre')
  );
  //
  app.get('/auth/mercadolibre/callback', function(req, res, next) {
    passport.authenticate('mercadolibre',function(err, user, info) {
      if (err) { console.log('err: '+err+';') ; }
      console.log('user: ') ;
      console.dir(user) ;
      //
      if (!user) { return res.redirect('/'); }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        req.session.user = user ;
        return res.redirect('/');
      });
    })(req, res, next);
  });
  */
  /*
  *
  */
/*
    *
    */
   app.use(function(err, req, res, next) {
    console.log(' \n ******* (B) ERROR ********** ');
    console.dir(err) ;
    let mensajeError = '' ;
    if ( typeof err=='object' ){
        mensajeError = JSON.stringify(err) ;
    } else {
        mensajeError = err ;
    }
    res.redirect('/error?mensaje='+mensajeError) ;
});
//
app.use(function(req, res, next) {
    console.log(' \n *** ERROR - 404 --> url: '+req.originalUrl+' *** \n');
    res.status(404);
    res.send( { error: 'url: '+req.originalUrl+' Not found' } );
});
  //
    try {
        let puerto = process.env.PORT || argConfig.api.puerto || 9000  ;
        app.listen(puerto,function(){
          console.log('....listen server on http://localhost:'+puerto) ;
        });
      } catch( errApplaunch ){
        console.dir(errApplaunch) ;
      }
      //
}
//
module.exports.iniciarApi = (argConfig) => {
    iniciarApi(argConfig) ;
    return this ;
};