# Mercadolibre-Estadisticas
Sincronización de datos de mercadolibre en base Mongodb & APIs para acceder a los datos.

## Instalación y configuración

* git clone https://github.com/sebaeze/mercadolibre-estadisticas.git
* Ir a https://applications.mercadolibre.com/
* Generar applicación:
    * Copiar App ID & Secret Key en -> /server/config/config.json
* Mongodb: Crear base 'mlestadisticas', usuario y password.
* Cargar información de base en   -> /server/config/config.json

## Run
* npm install
* npm start

## APIs

GET  /api/visitas Array de visitas en periodo determinado
     parametros: ?nickname=NICKNAME&fechaDesde=YYYY-MM-DD

POST  /api/usuarios/sincronizar
      Inicia sincronización de usuario Id y sus productos
      parametros: ?id=ID&accessToken=ACCESS_TOKEN