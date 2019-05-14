/*
*
*/
const objConfig  = {
    mongoDb:{
        "url":"mongodb://localhost:27017",
        "database":"mlestadisticas",
        "usuario":"sebaeze",
        "password":"ZXCasdqwe123"
    },
} ;
//
const path       = require('path') ;
//const dbTest     = require( path.join(__dirname,'../server/db/dbProductos') ).dbUrlInstance( objConfig ) ;
const dbTest     = require( path.join(__dirname,'../server/db/dbIndex') ).bases( objConfig.mongoDb ) ;
//console.dir(dbTest) ;
console.dir(dbTest.productos)
//
let objProd = { id: 'MLA740798997',
site_id: 'MLA',
title: 'Kit Mantenimiento Hp P4014 4015dn Fusor Ruedas 100% Nuevo',
seller:
 { id: 60873335,
   power_seller_status: 'platinum',
   car_dealer: false,
   real_estate_agency: false,
   tags: [] },
price: 13352.97,
currency_id: 'ARS',
available_quantity: 50,
sold_quantity: 4,
buying_mode: 'buy_it_now',
listing_type_id: 'gold_special',
stop_time: '2038-07-28T04:00:00.000Z',
condition: 'new',
permalink: 'https://articulo.mercadolibre.com.ar/MLA-740798997-kit-mantenimiento-hp-p4014-4015dn-fusor-ruedas-100-nuevo-_JM',
thumbnail: 'http://mla-s2-p.mlstatic.com/779416-MLA27891232890_082018-I.jpg',
accepts_mercadopago: true,
installments: { quantity: 12, amount: 1822.35, rate: 63.77, currency_id: 'ARS' },
address:
 { state_id: 'AR-C',
   state_name: 'Capital Federal',
   city_id: '',
   city_name: 'Parque Chacabuco' },
shipping:
 { free_shipping: true,
   mode: 'me2',
   tags: [ 'self_service_in', 'mandatory_free_shipping' ],
   logistic_type: 'drop_off',
   store_pick_up: false },
seller_address:
 { id: '',
   comment: '',
   address_line: '',
   zip_code: '',
   country: { id: 'AR', name: 'Argentina' },
   state: { id: 'AR-C', name: 'Capital Federal' },
   city: { id: '', name: 'Parque Chacabuco' },
   latitude: '',
   longitude: '' },
attributes:
 [ { value_id: null,
     value_name: 'Alternativo / Generico',
     value_struct: null,
     attribute_group_id: 'OTHERS',
     attribute_group_name: 'Otros',
     source: 1572,
     id: 'BRAND',
     name: 'Marca' },
   { id: 'ITEM_CONDITION',
     name: 'Condición del ítem',
     value_id: '2230284',
     value_name: 'Nuevo',
     value_struct: null,
     attribute_group_id: 'OTHERS',
     attribute_group_name: 'Otros',
     source: 1572 },
   { source: 1572,
     id: 'MODEL',
     name: 'Modelo',
     value_id: null,
     value_name: 'P4014, P4014dn, P4014n, P4015dn, P4015n, P4015tn, P4015x,P4515n, P4515tn, P4515x, P4515xm',
     value_struct: null,
     attribute_group_id: 'OTHERS',
     attribute_group_name: 'Otros' } ],
original_price: null,
category_id: 'MLA430334',
official_store_id: null,
catalog_product_id: null,
reviews: {},
tags:
 [ 'brand_verified',
   'good_quality_picture',
   'good_quality_thumbnail',
   'immediate_payment',
   'cart_eligible' ],
categoriaSegunTitulo: 'KIT' } ;
//
dbTest.productos.add( objProd )
    .then(resuOk => {
        console.log('resultado ok') ; 
    })
    .catch(resuErr => {
        //console.dir(resuErr) ;
    }) ;
//