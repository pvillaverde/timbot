# Timbot - Twitch en Galego
[![Discord server](https://img.shields.io/discord/772481634045788211?color=%25237289da&label=discord%20server&logo=discord)](https://discord.gg/pTbpHp9zwE)

🤖 **Un robot sinxelo e que se pode personalizar. Anuncia as emisións en directo de Twitch en Galego.**

![Timbot Twitch en Galego](https://pbs.twimg.com/media/ErJW_5RXEAUfApb?format=png&name=900x900)

## Características

 - 📢 Monitoriza e anuncia as canles de Twitch que entran en directo, pódese personalizar as `@mencions`.
 - 🔴 Tarxeta coa información relevante da emisión que se vai actualizando co estado, espectadores e unha previsualización do que se emite.

## Cómo uso o robot?

Tes dúas opcións:

1. Podes [invitar ó bot de Twitch en Galego](https://discord.com/oauth2/authorize?client_id=796412840873427024&scope=bot) ó teu servidor de discord para recibir as notificacións da comunidade de [Twitch en Galego](https://twitter.com/GalegoTwitch/) (Tes que ter unha canle no servidor co nome `📡emitindo-twitch-galego`). Este bot é o que mantén a comunidade de Twitch en Galego e manterá actualizada a lista de canles de Twitch segundo se vaian incorporando.

2. Ou, podes facer unha copia propia seguindo as instruccións de debaixo e personalizalo como che apeteza.

## Instalación e configuración

### Prerequisitos

Este bot está feito en Node.js. Se non tes Node instalado, descárgao e instala a última versión LTS dende a páxina oficial para a plataforma na que o vaias executar:

https://nodejs.org/en/download/

**Recoméndase Node v10+.**

### Instalación

Para configurar Timbot, o xeito máis sinxelo e clonar o repositorio utilizando `git`:

    git clone https://github.com/pvillaverde/timbot/
    
Unha vez instalado, entra no directorio e instala as dependencias:

    cd timbot
    npm install

### Conseguindo os tokens requeridos

Terás que configurar algunhas aplicacións externas: 

#### Aplicación do Bot de discord
O teu bot de discord precisa rexistrarse coma unha aplicación, e precisarás configurar o seu token (`discord_bot_token` na configuración de Timbot).

Segue [esta guía (en inglés)](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token) para máis información.

#### Aplicación de Twitch
Para conectarse a API de Twitch, precisarás rexistrar unha aplicación na [Consola de Desenvolvedores de Twitch](https://dev.twitch.tv/console/apps).

Terás que introducir a ID de Cliente na configuración de Timbot (`twitch_client_id`).

#### Twitch OAuth token
Para enredar un pouco as cousas, todas as consultas feitas a API de Twitch teñen que autentificarse cun oAuth xerado pola túa propia aplicación.

Para comezar o proceso de autentificación, precisas completar esta ligazón introducindo a ID de Cliente e entrando na seguitne ligazón:
 
```
https://id.twitch.tv/oauth2/authorize?client_id=<A_TUA_ID_CLIENTE>&response_type=token&redirect_uri=http://localhost
```

Podes collere o `access_token` da URL de redirección a que che leva o teu navegador, e gardala como `twitch_oauth_token` na configuración de Timbot. 

### Google Sheets API
O robot pódese configurar para que recolle os datos dunha folla de Excel, de tal xeito que cada 10 minutos refresca a lista de canles e a información dos usuarios en Twitch. Se están configurados os datos de Google Sheets, tratará de coller os datos da folla de cálculo, se non, collerá as canles configuradas en `twitch_channels`.

Para obter os datos segue a [Guía Rápida da API de Google Sheets](https://developers.google.com/sheets/api/quickstart/nodejs) para configurar unha aplicación e descarga o arquivo `credentials.json`. Os parámetros que están no atributo `installed`son os que se configuran no `config.json` no apartado `google_credentials`.

Unha vez feito, é preciso arrancar manualmente á aplicación como se indica abaixo e seguir os pasos pra que xenere o arquivo `token.json`, co que se autentificará con google para consultar os datos da folla de cálculo. 

No apartado `google_spreadsheet`, indicase o documento e o rango onde estan os datos.


### Configuración
 
Para configurar Timbot, copia o arquivo incluído `config-sample.json` a `config.json` e introduce ou personaliza os valores do arquivo.

```json
{
	"twitch_channels": "{{Canle_De_Twitch}},{{Canle_De_Twitch}}",
	"discord_announce_channel": "📡emitindo-twitch-galego",
	"discord_mentions": {
		"{{Canle_De_Twitch}}": "everyone",
		"{{Canle_De_Twitch}}": "here"
	},
	"discord_bot_token": "<CONFIGURAME>",
	"twitch_client_id": "<CONFIGURAME>",
	"twitch_oauth_token": "<CONFIGURAME>",
	"twitch_check_interval_ms": 60000,
	"twitch_use_boxart": true,
	"google_spreadsheet": {
		"id": "1AFbvk9SLOpOyST4VWG6IOkiMdclzExUPQrKUBuEUHKY",
		"range": "Canles!A2:A",
		"headers": "name"
	},
	"google_credentials": {
		"client_id": "<<XERADO POR GOOGLE: credentials.installed>>",
		"project_id": "<<XERADO POR GOOGLE: credentials.installed>>",
		"auth_uri": "<<XERADO POR GOOGLE: credentials.installed>>",
		"token_uri": "<<XERADO POR GOOGLE: credentials.installed>>",
		"auth_provider_x509_cert_url": "<<XERADO POR GOOGLE: credentials.installed>>",
		"client_secret": "<<XERADO POR GOOGLE: credentials.installed>>",
		"redirect_uris": "<<XERADO POR GOOGLE: credentials.installed>>"
	}
}
```    

Configuration options explained:

|Crave|Requerido?|Descripción|
|---|---------|-----------|
|`twitch_channels`|☑|Lista separada por comas das canles que queres monitorizar e enviar notificacións. Se está en branco, colle os datos de `google_spreadsheet`|
|`discord_announce_channel`|☑|Nome da canle na que se enviarán os avisos. Asegúrate de que o bot ten permisos pra escribir e editar mensaxes aquí.|
|`discord_mentions`| |Isto relaciona os nomes das canlees cos @ os que queiras mencionar, coma un rol ou un @everyone. Se falta unha canle, non se utilizará @. Nota: Unha vez a mensaxe se actualiza, o @ elimínase pra evitar o spam de notificacións ós usuarios.|
|`twitch_client_id`|☑|ID cliente da tua apllicación de Twitch, no portal de desenvolvedores.|
|`twitch_oauth_token`|☑|OAuth token que che da acceso a túa aplicación de Twitch, vía `id.twitch.tv` como se explicou máis arriba.|
|`twitch_check_interval_ms`| |Con que frecuencia(milisegundos) se refrescan os datos das emisións e se envían actualizacións no discord. Por defecto 1 minuto|
|`twitch_use_boxart`| |Se está como `true`, envía unha pequena imaxe coa categoría do xogo a maiores da previsualización do directo.|
|`google_spreadsheet.id`| |A ID do documento de google, a URL do exemplo é `https://docs.google.com/spreadsheets/d/1AFbvk9SLOpOyST4VWG6IOkiMdclzExUPQrKUBuEUHKY/edit`.|
|`google_spreadsheet.range`| |O rango onde están os datos. Nome da folla e rango de columnas. Mirar a folla de cálculo para ver os datos que se collen`.|
|`google_spreadsheet.headers`| |O nome das columnas pra facer referencia a elas no código. A primeira serán sempre os nomes das canles.|
|`google_credentials`| |Son os datos obtidos da API de Google Sheets. No arquivo `credentials.json`.|

### Arrincando Timbot

Unha vez configurada, podes arrancar a aplicación para probala utilizando `node` dende o directorio de instalación:

    node .
### Configurar Timbot como servizo

Opcionalmente, pódese configurar coma servizo nun servidor linux para que estea correndo permanentemente. Para iso, asumindo que está instalado na ruta `/opt/timbot`, copiar o arquivo `timbot.service` en `/etc/systemd/system`. Crear o usuario `timbot` e asignarlle a propiedade da carpeta `/opt/timbot`. Unha vez feito, activalo e arrincar o servizo

	useradd -r -s /bin/false timbot
	chown timbot:timbot /opt/timbot -R
    systemctl enable timbot
	systemctl start timbot
	
  
### Invitando o teu Timbot

Envía a seguinte ligazón o administrador do servidor de Discord no que queiras invitar o teu robot:

  `https://discordapp.com/oauth2/authorize?client_id=ID_CLIENTE_ROBOT&scope=bot`
  
Cambia `ID_CLIENTE_ROBOT` na URL pola ID de cliente da túa aplicación de Discord, que podes atopala nos detallees da aplicación.
## Credits

O Timbot orixinal foi desenvolto por @roydejong e isto é un fork do mesmo. Se atopas algún erro ou es un dos autores e pensas que hai algún erro, contacta conmigo!