/* eslint-disable no-async-promise-executor */
var WDR = {
    Dir: __dirname,
    Presets: {},
    Max_Pokemon_Level: 35,
    Max_Raid_Level: 6
};

const ObjectHandler = require('./webhook.js');
const { Log } = require('./utilities.js');

const Express = require('express');
const BodyParser = require('body-parser');
const Server = Express();
Server.use(BodyParser.json({
    limit: '25MB'
}));
var payloadCount = 0;
var objectCount = 0;
Server.post('/', async (req, res) => {
    payloadCount++;
    objectCount = objectCount + req.body.length;
    res.sendStatus(200);
    let payloadSize = req.body.length;
    for(let o = 0; o < payloadSize; o++){
        req.body[o].message.type = req.body[o].type;
        new ObjectHandler(req.body[o].message);
    }
});
Server.use((err, req) => {
    // console.log('err.status: ' + err.status)
    // console.log('err.expected: ' + err.expected)
    // console.log('err.received: ' + err.received)
    // console.log('err.stack: ' + err.stack)
    req.destroy();
});

setInterval(() => {
    Log.info(`[index.js]  Payloads Received: ${payloadCount}.  Objects Received: ${objectCount}.`);
    payloadCount = 0;
    objectCount = 0;
}, 60000 * 5);












//  PACKAGE REQUIREMENTS
WDR.Ini = require('ini');
WDR.MySQL = require('mysql2');
WDR.GeoTz = require('geo-tz');
WDR.Fs = require('fs-extra');
WDR.Ontime = require('ontime');
WDR.Moment = require('moment-timezone');
WDR.PointInGeoJSON = require('point-in-geopolygon');
WDR.Colors = require('colors');
WDR.cliProgress = require('cli-progress');
WDR.Distance = require('geo-distance');
WDR.Axios = require('axios');

//  TIME FUNCTION
WDR.Time = (time, type, timezone) => {
    switch (type) {
        case '1':
            return WDR.Moment.unix(time).tz(timezone).format('h:mm A');
        case '2':
            return WDR.Moment().tz(timezone).format('HHmm');
        case '3':
            return WDR.Moment(time).tz(timezone).format('HHmm');
        case 'quest':
            return WDR.Moment().tz(timezone).format('dddd, MMMM Do') + ' @ Midnight';
        case 'log':
            return WDR.Moment().format('h:mmA');
        case 'full':
            return WDR.Moment().format('dddd, MMMM Do  h:mmA');
        case 'nest':
            return WDR.Moment.unix(time).tz(timezone).format('MMM Do YYYY hA');
        case 'unix':
            return WDR.Moment(time).tz(timezone).format('X');
    }
};

// LOAD SOME SNARK
delete require.cache[require.resolve(WDR.Dir + '/static/files/snark.json')];
WDR.Snarkiness = require(WDR.Dir + '/static/files/snark.json');

//  CONFIG
var randomNumber = Math.floor(Math.random() * Math.floor(WDR.Snarkiness.startup.length));
WDR.Config = WDR.Ini.parse(WDR.Fs.readFileSync(WDR.Dir + '/configs/config.ini', 'utf-8'));
WDR.Version = require(WDR.Dir + '/package.json').version;
WDR.Debug = WDR.Config.DEBUG;
WDR.db = require(WDR.Dir + '/static/data/updates.json');


// LOAD DISCORD.JS
WDR.DiscordJS = require('discord.js');

// LOAD COMMAND HANDLER
delete require.cache[require.resolve(WDR.Dir + '/src/handlers/messages.js')];
WDR.Message_Handler = require(WDR.Dir + '/src/handlers/messages.js');

// LOAD PAYLOAD HANDLER
delete require.cache[require.resolve(WDR.Dir + '/src/handlers/webhooks.js')];
WDR.Webhook_Handler = require(WDR.Dir + '/src/handlers/webhooks.js');

//  LOAD ALL DISCORDS
function load(location, type) {
    return new Promise(async resolve => {
        let Loader = require(WDR.Dir + location);
        let Loaded = await Loader.Load(WDR, type);
        return resolve(Loaded);
    });
}

//  LOAD MODULES
function load_modules() {
    return new Promise(async resolve => {
        let Loader = require(WDR.Dir + '/src/startup/load_modules.js');
        let Loaded = await Loader.Load(WDR);
        WDR.Feeds = Loaded.Feeds;
        WDR.Subscriptions = Loaded.Subscriptions;
        return resolve();
    });
}

// function load_events() {
//   const events = requireAll({
//     dirname: __dirname + "/src/events",
//     filter: /^(?!-)(.+)\.js$/
//   });
//   let event_count = 0;
//   WDR.removeAllListeners();
//   for (const filename in events) {
//     event_count++;
//     const event = events[filename];
//     WDR.Bot.on(filename, event.bind(null, WDR));
//   }
//   WDR.Console.info("[wdr.js] Loaded " + event_count + " Discord Event Listeners.");
//   return;
// };

function load_presets(type) {
    return new Promise(async resolve => {
        let Presets = require(WDR.Dir + '/src/startup/load_presets.js');
        let Loaded = await Presets.Load(WDR, type);
        return resolve(Loaded);
    });
}

// MYSQL CONNECTIONS
function mysql_connect(db) {
    return new Promise(async resolve => {
        let Database = require(WDR.Dir + '/src/database.js');
        WDR.DB_Interval = Database.Interval;
        WDR.UpdateAllSubTables = Database.UpdateAllSubTables;
        WDR = await Database.Load(WDR, db);
        return resolve();
    });
}

//  LOAD COMMANDS
function load_commands() {
    return new Promise(async resolve => {
        WDR.Commands = {};
        WDR.Commands.Subscription = new WDR.DiscordJS.Collection();
        await WDR.Fs.readdir(WDR.Dir + '/src/commands/subscription', (err, files) => {
            let command_files = files.filter(f => f.split('.').pop() === 'js');
            command_files.forEach((f) => {
                delete require.cache[require.resolve(WDR.Dir + '/src/commands/subscription/' + f)];
                let command = require(WDR.Dir + '/src/commands/subscription/' + f);
                WDR.Commands.Subscription.set(f.slice(0, -3), command);
            });
        });
        WDR.Commands.Admin = new WDR.DiscordJS.Collection();
        await WDR.Fs.readdir(WDR.Dir + '/src/commands/admin', (err, files) => {
            let command_files = files.filter(f => f.split('.').pop() === 'js');
            command_files.forEach((f) => {
                delete require.cache[require.resolve(WDR.Dir + '/src/commands/admin/' + f)];
                let command = require(WDR.Dir + '/src/commands/admin/' + f);
                WDR.Commands.Admin.set(f.slice(0, -3), command);
            });
        });
        return resolve();
    });
}

//  WDR INITIALIZATION
async function wdr_intialization() {
    console.log(('[WDR ' + WDR.Version + '] [' + WDR.Time(null, 'log') + '] ' + WDR.Snarkiness.startup[randomNumber]).bold.brightGreen);
    WDR = await load('/src/startup/load_functions.js');
    if (WDR.Fs.existsSync(__dirname + '/src/functions/Generate_Master.js')) {
        await WDR.Generate_Master(WDR);
    }
    WDR = await load('/src/startup/load_data.js');
    await mysql_connect('wdrDB');
    //await mysql_connect("pmsfDB");
    await mysql_connect('scannerDB');
    WDR.Discords = await load('/src/startup/load_discords.js');
    await load_modules();
    await load_commands();
    WDR.Filters = await load('/src/startup/load_filters.js');
    WDR.Geofences = await load('/src/startup/load_geofences.js');
    WDR = await load('/src/startup/load_ontime.js');
    WDR.Pokemon_Channels = await load('/src/startup/load_feeds.js', 'Pokemon_Channels');
    WDR.PvP_Channels = await load('/src/startup/load_feeds.js', 'PvP_Channels');
    WDR.Raid_Channels = await load('/src/startup/load_feeds.js', 'Raid_Channels');
    WDR.Quest_Channels = await load('/src/startup/load_feeds.js', 'Quest_Channels');
    WDR.Invasion_Channels = await load('/src/startup/load_feeds.js', 'Invasion_Channels');
    WDR.Lure_Channels = await load('/src/startup/load_feeds.js', 'Lure_Channels');
    WDR.Presets.Pokemon = await load_presets('pokemon');
    WDR.Presets.Raids = await load_presets('raids');
    WDR.Presets.PvP = await load_presets('pvp');
    WDR.Presets.Quests = await load_presets('quests');
    WDR.Bot = await load('/src/bot.js', );

    // EVENT WHEN WDR BOT SEES A MESSAGE
    WDR.Bot.on('message', message => {
        WDR.Message_Handler(WDR, message);
    });

    // EVENT WHEN BOT IS READY
    WDR.Bot.on('ready', () => {

        // LOAD EMOJIES
        let Emojis = require(WDR.Dir + '/src/emojis.js');
        WDR.Emotes = new Emojis.DiscordEmojis();
        WDR.Emotes.Load(WDR.Bot, WDR.Config.EMOJI_SERVERS.split(','));


        // LISTEN TO THE SPECIFIED PORT FOR TRAFFIC
        Server.listen(WDR.Config.LISTENING_PORT);
        WDR.Console.info(WDR, '[wdr.js] WebServer now Listening on Port ' + WDR.Config.LISTENING_PORT + '.');

        // LOG READY STATE
        let logText = WDR.Snarkiness.initialized[randomNumber];
        WDR.Console.log(WDR, '[wdr.js] ' + logText);
    });

    start_intervals();
}



function start_intervals() {

    setInterval(function () {
        WDR.DB_Interval(WDR);
    }, 1000 * 60);

    let down_mins = parseInt(WDR.Config.DOWN_MINS);
    if (WDR.Config.DOWN_ALERT == 'ENABLED' && payload_count === 0) {
        setInterval(function () {
            if (payload_count < 1) {
                let Outage_Embed = new WDR.DiscordJS.MessageEmbed()
                    .setColor('FF0000')
                    .setAuthor('WDR ' + WDR.Version, WDR.Bot.user.displayAvatarURL())
                    .setTitle('WARNING:  No Data Received in the Last ' + WDR.Config.DOWN_MINS + ' Minutes.')
                    .setFooter(WDR.Time(null, 'full'));
                WDR.Send_DM(WDR, null, WDR.Config.DOWN_USER_ID, Outage_Embed);
            }
            payload_count = 0;
        }, 60000 * down_mins);
    }
}

// START THIS BABY UP
wdr_intialization();