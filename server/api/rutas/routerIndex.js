/*
*
*/
const express         = require('express') ;
const router          = require('express').Router()   ;
const path            = require('path') ;
const routerUsuarios   = require('./routerUsuarios').routerUsuarios ;
const utilitario      = require(  path.join(__dirname,'../../lib/utiles') ).Utilitarios() ;
const db              = require( path.join(__dirname ,'../../db/dbIndex') ).bases ;
const autenticado     = require(  path.join(__dirname,'../../auth/autenticado') ).autenticado ;
const htmlReporte     = utilitario.htmlContent( 'reporte.html' ) ;
//
const public          = utilitario.getDistPath() ;
//
let opciones = {
  dotfiles: 'ignore',etag: false,extensions: [],index: false,maxAge: '1d' ,redirect: false,
  setHeaders: function (res, path, stat) {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', '*');
      res.set("Access-Control-Allow-Credentials", true);
      res.set('Connection', 'Keep-Alive') ;
      }
  } ;
/*
*
*/
module.exports = (argConfig) => {
  //
  const dbases     = db(argConfig.mongoDb) ;
  //
  argConfig.email.nombreMuestraEmailGateway = argConfig.email.nombreMuestraEmailGateway+' <'+argConfig.email.emailGateway+'>' ;
  const sendGmail = require('gmail-send')({
    user: argConfig.email.emailGateway,
    pass: argConfig.email.passwordEmailGateway,
    to:   argConfig.email.emailSoporte,
    // to:   credentials.user,                  // Send to yourself
                                             // you also may set array of recipients:
                                             // [ 'user1@gmail.com', 'user2@gmail.com' ]
    // from:    credentials.user,            // from: by default equals to user
    from: argConfig.email.nombreMuestraEmailGateway  ,
    // replyTo: credentials.user,            // replyTo: by default undefined
    // bcc: 'some-user@mail.com',            // almost any option of `nodemailer` will be passed to it
    subject: 'test subject',
    //text:    'gmail-send example 1',      // Plain text
    html:    '<b>html text</b>'            // HTML
  });
  //
  router.use('/', express.static( public, opciones ) );
  //
  router.get('/', function(req, res) {
    res.set('access-Control-Allow-Origin', '*');
    res.set('access-Control-Allow-Methods', '*');
    res.setHeader("Access-Control-Allow-Credentials", true);
    //
    res.status(200) ;
    res.json({"path":"index"});
    //
  });
  router.use('/api', routerUsuarios(dbases) ) ;
  //
  router.get('/api/clientes', function(req, res) {
    res.set('access-Control-Allow-Origin', '*');
    res.set('access-Control-Allow-Methods', '*');
    res.setHeader("Access-Control-Allow-Credentials", true);
    //
    dbases.usuarios.getClientes('33300941',{soloId:false})
          .then(arrayClientes => {
            res.status(200) ;
            res.json(arrayClientes) ;
          })
          .catch(respError => {
            res.status(500) ;
            res.json( {error: respError} ) ;
          })
    //
  });
  //
  router.get('/reporte', function(req, res) {
    res.set('access-Control-Allow-Origin', '*');
    res.set('access-Control-Allow-Methods', '*');
    res.setHeader("Access-Control-Allow-Credentials", true);
    //
    res.status(200) ;
    let pathReporteHtml = path.join(__dirname,'../../../dist/reporte.html') ;
    console.log('pathReporteHtml: '+pathReporteHtml) ;
    res.sendFile( pathReporteHtml );
    //
  });
  //
  router.all('/mercadollibre/callback/notificaciones', function(req, res) {
    res.set('access-Control-Allow-Origin', '*');
    res.set('access-Control-Allow-Methods', '*');
    res.setHeader("Access-Control-Allow-Credentials", true);
    //
    console.log(new Date().toISOString()+'...estoy en Mercadolibre callback/notificaciones: ');
    console.dir(req.headers) ;
    //
    res.status(200) ;
    res.json({"path":"index"});
    //
  });
  //
  router.all('/mercadollibre/callback/login', function(req, res) {
    res.set('access-Control-Allow-Origin', '*');
    res.set('access-Control-Allow-Methods', '*');
    res.setHeader("Access-Control-Allow-Credentials", true);
    //
    console.log(new Date().toISOString()+'...estoy en Mercadolibre CallBack/login: ');
    console.dir(req.headers) ;
    //
    res.status(200) ;
    res.json({"path":"index"});
    //
  });
  //
  router.get('/404', function(req, res) {
    //
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", true);
    //
    res.status(404) ;
    res.json({"path":"not-found"});
    //
  });
  //
  router.post('/email', function(req, res) {
    //
    res.set('access-Control-Allow-Origin', '*');
    res.set('access-Control-Allow-Methods', '*');
    res.setHeader("access-Control-Allow-Credentials", true);
    //
    console.log('.....email') ;
    console.dir(req.body)
    //
    enviarEmail( req.body )
        .then(function(respEmail){
          res.status(200) ;
          res.json( respEmail ) ;
        }.bind(res))
        .catch(function(respErr){
          res.status(500) ;
          res.json( respErr ) ;
        }.bind(res))
    //
  });
  //
  const enviarEmail = (argBody) => {
    return new Promise(function(respResu,respRej){
      try {
          // sendGmail
          sendGmail({ // Overriding default parameters
            subject: argBody.subject ,
            html: '<p>Nueva consulta de: '+argBody.email+'</p><p>'+argBody.message+'</p>'
            //files: [ filepath ],
          },
          function (err, res) {
            if ( err ){
              console.log('....ERROR enviando email: ') ;
              console.dir(err) ;
              respRej(err) ;
            } else {
              respResu('* [example 1.1] send() callback returned: err:', err, '; res:', res) ;
            }
          }) ;
        //
      } catch(errMsg){
        respRej(errMsg) ;
      }
    }.bind(this)) ;
  }
  //
  return router ;
} ;
//