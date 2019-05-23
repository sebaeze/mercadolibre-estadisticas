/*
*
*/
module.exports.autenticado = (req,res,next) => {
    console.log(new Date().toISOString()+'....autenticado: user: '+(req.user ? req.user.email : '' )+';') ;
    if ( req.user ){
        next() ;
    } else {
        res.redirect('/auth/mercadolibre');
    }
} ;
//