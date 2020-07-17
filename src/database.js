const Ontime = require("ontime");
var Queries = {};

const DB = {

  Queries: {},

  Load: function(WDR, database) {
    return new Promise(async resolve => {
      WDR[database] = WDR.MySQL.createPool({
        supportBigNumbers: true,
        connectionLimit: 100,
        host: WDR.Config[database].host,
        user: WDR.Config[database].username,
        password: WDR.Config[database].password,
        port: WDR.Config[database].port,
        database: WDR.Config[database].db_name
      });

      WDR[database].on("enqueue", function() {
        WDR.Console.error(WDR, "[src/database.js] Your " + database.toUpperCase() + " Query Load is Exceeding the Pool Size.");
      });

      switch (database) {
        case "wdrDB":
          await create_tables(WDR);
          await update_database(WDR);
          WDR.wdrDB.query(
            `SELECT
                *
             FROM
                wdr_info`,
            async function(error, row) {
              if (error) {
                WDR.Console.error(WDR, "[src/database.js] Error connecting to wdrDB.", error);
                return resolve();
              } else if (row[0].pvp_tables_generated < 1) {
                WDR.Console.error(WDR, "[src/database.js] PvP Tables Not Found. Generating...");
                await WDR.PvP_Table_Generator(WDR);
                WDR.wdrDB.query(
                  `UPDATE
                      wdr_info
                   SET
                      pvp_tables_generated = 1;`
                );
                WDR.Console.log(WDR, "[src/database.js] Generated PvP Tables.");
                return resolve(WDR);
              } else {
                WDR.Console.info(WDR, "[src/database.js] Successfully Connected to wdrDB.");
                return resolve(WDR);
              }
            }
          );
          break;

        case "pmsfDB":
          WDR.pmsfDB.query(
            `SELECT
                count(*)
             FROM
                users`,
            function(error, row) {
              if (error) {
                WDR.Console.error(WDR, "[src/database.js] Error connecting to pmsfDB.", error);
                return resolve();
              } else {
                WDR.Console.info(WDR, "[src/database.js] Successfully Connected to pmsfDB.");
                return resolve(WDR);
              }
            }
          );
          break;

        case "scannerDB":
          WDR.scannerDB.query(
            `SELECT
                count(*)
             FROM
                gym`,
            async function(error, row) {
              if (error) {
                WDR.Console.error(WDR, "[src/database.js] Error connecting to scannerDB.", error);
                return resolve();
              } else {
                WDR.Console.info(WDR, "[src/database.js] Successfully Connected to scannerDB.");

                // LOAD DATA ARRAYS FROM SCANNER DB
                WDR.Gym_Array = [];
                WDR.Pokestop_Array = [];
                WDR.Pokemon_Array = [];
                WDR.Park_Array = [];

                // LOAD POKEMON ARRAY
                WDR.Pokemon_Array = Object.keys(WDR.Master.Pokemon).map(i => WDR.Master.Pokemon[i].name);

                WDR.Console.info(WDR, "[src/database.js] Loaded " + WDR.Pokemon_Array.length + " Pokemon into the Pokemon Array.");

                // CHECK HOW MANY GYMS DO NOT HAVE NAMES
                await WDR.scannerDB.promise().query(
                  `SELECT
                      *
                   FROM
                      gym
                   WHERE
                      name is NULL`
                ).then(([null_gyms, fields]) => {
                  if (null_gyms && null_gyms.length > 0) {
                    WDR.Console.error(WDR, "[src/database.js] You have " + null_gyms.length + " Gyms without Names in your Database.");
                  }
                });
                // CHECK HOW MANY POKESTOPS DO NOT HAVE NAMES
                await WDR.scannerDB.promise().query(
                  `SELECT
                      *
                   FROM
                      pokestop
                   WHERE
                      name is NULL`
                ).then(([null_stops, fields]) => {
                  if (null_stops && null_stops.length > 0) {
                    WDR.Console.error(WDR, "[src/database.js] You have " + null_stops.length + " Pokestops without Names in your Database.");
                  }
                });
                // GYM NAMES ARRAY
                await WDR.scannerDB.promise().query(
                  `SELECT
                      *
                   FROM
                      gym
                   WHERE
                      name is not NULL`
                ).then(([gyms, fields]) => {
                  if (gyms) {
                    for (let g = 0, g_len = gyms.length; g < g_len; g++) {
                      let gym = gyms[g];
                      let record = {};
                      record.name = gym.name;
                      record.id = gym.id;
                      record.lat = gym.lat;
                      record.lon = gym.lon;
                      WDR.Gym_Array.push(record);
                    }

                    // LOG SUCCESS AND COUNTS
                    WDR.Console.info(WDR, "[src/database.js] Loaded " + WDR.Gym_Array.length + " Gyms into the Gym Array.");
                  }
                });
                // POKESTOP NAMES ARRAY
                await WDR.scannerDB.promise().query(
                  `SELECT
                      *
                   FROM
                      pokestop
                   WHERE
                      name is not NULL`
                ).then(([stops, fields]) => {
                  if (stops) {
                    for (let s = 0, s_len = stops.length; s < s_len; s++) {
                      let stop = stops[s];
                      let record = {};
                      record.name = stop.name;
                      record.id = stop.id;
                      record.lat = stop.lat;
                      record.lon = stop.lon;
                      WDR.Pokestop_Array.push(record);
                    }

                    // LOG SUCCESS AND COUNTS
                    WDR.Console.info(WDR, "[src/database.js] Loaded " + WDR.Pokestop_Array.length + " Pokestops into the Pokestop Array.");
                  }
                });

                if (WDR.Fs.existsSync(WDR.Dir + "/configs/db/quarterhourly.js")) {
                  DB.Queries.Minute = require(WDR.Dir + "/configs/db/quarterhourly.js");
                  DB.QuarterHourly(WDR, DB.Queries.Minute);
                }

                if (WDR.Fs.existsSync(WDR.Dir + "/configs/db/hourly.js")) {
                  DB.Queries.Hour = require(WDR.Dir + "/configs/db/hourly.js");
                  DB.Hourly(WDR, DB.Queries.Hour);
                }

                if (WDR.Fs.existsSync(WDR.Dir + "/configs/db/daily.js")) {
                  DB.Queries.Day = require(WDR.Dir + "/configs/db/daily.js");
                  DB.Daily(WDR, DB.Queries.Day);
                }

                if (WDR.Fs.existsSync(WDR.Dir + "/configs/db/scheduled.js")) {
                  DB.Queries.Scheduled = require(WDR.Dir + "/configs/db/scheduled.js");
                  DB.Scheduled(WDR, DB.Queries.Scheduled);
                }

                // END
                return resolve(WDR);
              }
            }
          );
          break;

        default:
          WDR.Console.error(WDR, "You failed at modifying the WDR Code.");
          process.exit(1);
      }
    });
  },
  //############################################################################

  QuarterHourly: function(WDR, QuarterHourly) {
    Ontime({
      cycle: ["00:05", "00:20", "00:35", "00:50"]
    }, function(ot) {

      QuarterHourly.forEach((query, index) => {
        setTimeout(function() {
          WDR[query[0]].query(
            query[1],
            function(error, data) {
              if (error) {
                WDR.Console.error(WDR, "[src/database.js] QuarterHourly Ontime Query Failed.", query[1]);
                console.error(error)
              }
            }
          );
        }, 1000 * (60 * index));
      });
      return ot.done();
    });
    WDR.Console.info(WDR, "[src/database.js] Loaded " + QuarterHourly.length + " queries to run every 15 minutes.");
    return;
  },

  //############################################################################

  Hourly: function(WDR, Hourly) {
    Ontime({
      cycle: ["00:00"]
    }, function(ot) {
      Hourly.forEach((query, index) => {
        setTimeout(function() {
          WDR[query[0]].query(
            query[1],
            function(error, data) {
              if (error) {
                WDR.Console.error(WDR, "[src/database.js] Hourly Ontime Query Failed.", error);
              }
            }
          );
        }, 1000 * (60 * index));
      });
      return ot.done();
    });
    WDR.Console.info(WDR, "[src/database.js] Loaded " + Hourly.length + " queries to run every hour.");
    return;
  },

  //############################################################################

  Daily: function(WDR, Daily) {
    let daily_time = WDR.Moment();
    daily_time = WDR.Moment.tz(daily_time, WDR.Config.Timezone).set({
      hour: 23,
      minute: 45,
      second: 0,
      millisecond: 0
    }).format('HH:mm:ss');
    Ontime({
      cycle: [daily_time]
    }, function(ot) {
      try {
        Daily.forEach((query, index) => {
          setTimeout(function() {
            WDR[query[0]].query(
              query[1],
              function(error, data) {
                if (error) {
                  WDR.Console.error(WDR, "[src/database.js] Daily Ontime Query Failed.", error);
                }
              }
            );
          }, 1000 * (60 * index)); // 60 second intervals
        });
      } catch (e) {
        WDR.WDR.Console.error(WDR, "Error executing daily database query", query);
        console.error(e);
      }
      return ot.done();
    });
    WDR.Console.info(WDR, "[src/database.js] Loaded " + Daily.length + " queries to run every day.");
    return;
  },

  //############################################################################

  Scheduled: function(WDR, Scheduled) {
    let count = 0;
    Scheduled.forEach(query => {
      try {
        count++;
        let time = query[0].split(":");
        let scheduled_time = WDR.Moment();
        scheduled_time = WDR.Moment.tz(scheduled_time, WDR.Config.Timezone).set({
          hour: time[0],
          minute: time[1],
          second: time[2],
          millisecond: 0
        }).format('HH:mm:ss');
        Ontime({
          cycle: [scheduled_time]
        }, function(ot) {
          WDR[query[1]].query(
            query[2],
            function(error, data) {
              if (error) {
                WDR.Console.error(WDR, "[src/database.js] Scheduled Ontime Query Failed.", query);
                console.error(error);
              }
            }
          );
          return ot.done();
        });
        WDR.Console.info(WDR, "[src/database.js] Loaded query to run at " + scheduled_time + ".");
      } catch (e) {
        WDR.Console.error(WDR, "[src/database.js] Daily Ontime Query Failed.", query);
        console.error(e);
      }
    });
    WDR.Console.info(WDR, "[src/database.js] Loaded " + count + " scheduled queries.");
    return;
  },

  Interval: function(WDR) {
    // SEND QUEST DMs
    WDR.wdrDB.query(
      `SELECT
            *
         FROM
            wdr_quest_queue
         WHERE
          alert_time < UNIX_TIMESTAMP()*1000`,
      function(error, alerts, fields) {
        if (alerts && alerts[0]) {
          alerts.forEach(async (alert, index) => {
            setTimeout(async function() {
              let guild = WDR.bot_array[alert.bot].guilds.cache.get(alert.discord_id);
              let user = guild.members.fetch(alert.user_id).catch(error => {
                WDR.Console.error(WDR, "[BAD USER ID] " + alert.user_id, error);
              });
              WDR.Bots.Array[alert.bot].guilds.cache.get(alert.discord_id).members.fetch(alert.user_id).then(TARGET => {
                let quest_embed = JSON.parse(alert.embed);
                TARGET.send({
                  embed: quest_embed
                }).catch(error => {
                  return WDR.Console.error(WDR, "[" + WDR.Time(null, "log") + "] " + TARGET.user.tag + " (" + alert.user_id + ") , CANNOT SEND THIS USER A MESSAGE.", error);
                });
              });
            }, 2000 * index);
          });
          WDR.wdrDB.query(
            `DELETE FROM
                  wdr_queued
               WHERE
                  alert_time < UNIX_TIMESTAMP()*1000`,
            function(error, alerts, fields) {
              if (error) {
                console.error;
              }
            }
          );
        }
      }
    );
    return;
  }
}


async function create_tables(WDR) {
  return new Promise(async resolve => {

    let wdr_info = `
      CREATE TABLE IF NOT EXISTS wdr_info (
        db_version tinyint NOT NULL DEFAULT 1,
        next_bot tinyint NOT NULL,
        pvp_tables_generated tinyint NOT NULL DEFAULT 0,
        tokens varchar(255)
      );`;
    WDR.wdrDB.query(wdr_info);

    let wdr_users = `
      CREATE TABLE IF NOT EXISTS wdr_users (
        user_id bigint NOT NULL,
        user_name varchar(40) NOT NULL,
        guild_id bigint NOT NULL,
        guild_name varchar(40) NOT NULL,
        bot tinyint NOT NULL DEFAULT '0',
        geofence varchar(50) NOT NULL DEFAULT 'all',
        coords varchar(30) DEFAULT NULL,
        distance tinyint DEFAULT '5',
        status tinyint NOT NULL DEFAULT '1',
        pokemon_status tinyint NOT NULL DEFAULT '1',
        pvp_status tinyint NOT NULL DEFAULT '1',
        raid_status tinyint NOT NULL DEFAULT '1',
        quest_status tinyint NOT NULL DEFAULT '1',
        lure_status tinyint NOT NULL DEFAULT '1',
        invasion_status tinyint NOT NULL DEFAULT '1',
        alert_time varchar(5) NOT NULL DEFAULT '08:00',
        PRIMARY KEY (user_id,guild_id)
      );`;
    WDR.wdrDB.query(wdr_users);

    let wdr_subscriptions = `
      CREATE TABLE IF NOT EXISTS wdr_subscriptions (
        user_id bigint NOT NULL,
        user_name varchar(40) NOT NULL,
        guild_id bigint NOT NULL,
        guild_name varchar(40) NOT NULL,
        bot tinyint NOT NULL,
        status tinyint DEFAULT '1',
        geofence varchar(50) NOT NULL,
        distance varchar(30) NOT NULL DEFAULT '0',
        sub_type varchar(10) NOT NULL,
        pokemon_id smallint NOT NULL DEFAULT '0',
        pokemon_type varchar(10) NOT NULL DEFAULT '0',
        form smallint NOT NULL DEFAULT '0',
        min_lvl tinyint NOT NULL DEFAULT '0',
        max_lvl tinyint NOT NULL DEFAULT '0',
        min_iv tinyint NOT NULL DEFAULT '0',
        max_iv tinyint NOT NULL DEFAULT '0',
        min_cp smallint NOT NULL DEFAULT '0',
        size varchar(5) NOT NULL DEFAULT '0',
        gender tinyint NOT NULL DEFAULT '0',
        generation tinyint NOT NULL DEFAULT '0',
        reward varchar(25) NOT NULL DEFAULT '0',
        gym_id varchar(50) NOT NULL DEFAULT '0',
        min_rank smallint NOT NULL DEFAULT '0',
        league varchar(10) NOT NULL DEFAULT '0',
        alert_time varchar(10) DEFAULT '0',
        PRIMARY KEY (user_id,guild_id,sub_type,pokemon_id,form,pokemon_type,min_lvl,max_lvl,min_iv,max_iv,size,generation,reward,gym_id,min_rank,league),
        KEY ix_data (gender,min_cp)
      );`;
    WDR.wdrDB.query(wdr_subscriptions);

    let wdr_quest_queue = `
      CREATE TABLE IF NOT EXISTS wdr_quest_queue (
        user_id bigint NOT NULL,
        user_name varchar(40) NOT NULL,
        guild_id bigint NOT NULL,
        bot smallint NOT NULL,
        area varchar(20),
        alert varchar(10),
        alert_time bigint,
        embed LONGTEXT NOT NULL
      );`;
    WDR.wdrDB.query(wdr_quest_queue);

    let wdr_pokedex = `
      CREATE TABLE IF NOT EXISTS wdr_pokedex (
        id smallint(4) NOT NULL,
        name varchar(40) NOT NULL,
        default_form bigint(25) NOT NULL,
        default_form_id smallint(5) NOT NULL,
        types varchar(20) NOT NULL,
        attack smallint(4) NOT NULL,
        defense smallint(4) NOT NULL,
        stamina smallint(4) NOT NULL,
        PRIMARY KEY (id,name)
      );`;
    WDR.wdrDB.query(wdr_pokedex);

    // END
    return resolve(WDR);
  });
}

function update_database(WDR) {
  return new Promise(async resolve => {

    WDR.wdrDB.query(
      `SELECT
          *
       FROM
          wdr_info`,
      async function(error, row, fields) {
        if (!row || !row[0]) {
          WDR.Console.error(WDR, "[src/database.js] No data found in wdr_info. Inserting default values...");
          await WDR.wdrDB.promise().query(
            `INSERT INTO
                wdr_info(
                  db_version,
                  next_bot,
                  pvp_tables_generated
                )
             VALUES
                (1,0,0)`
          );
          return resolve();
        } else if (row[0].db_version < WDR.db.LATEST) {

          // LOG FOUND UPDATE
          WDR.Console.error(WDR, "[src/database.js] Database Update Found. Updating...");

          // PERFORM UPDATES
          await update_each_version(WDR, row[0].db_version);

          // END
          return resolve();

        } else if (row[0].db_version > WDR.db.LATEST) {

          // LOG HIGHER VERSION THAN LATEST
          WDR.Console.error(WDR, "[src/database.js] Your database version is higher than latest. WTF did you do?");

          // TERMINATE THE SCRIPT
          process.exit(1);

        } else {

          // END
          return resolve();
        }
      }
    );
  });
}

async function update_each_version(WDR, v) {
  return new Promise(async resolve => {

    // LOOP EACH VERSION LOWER OR EQUAL TO LATEST
    for (let version = v; version <= WDR.db.LATEST; version++) {

      // CHECK IF VERSION IS LATEST
      if (version == WDR.db.LATEST) {

        // LOG UP TO DATE
        WDR.Console.log(WDR, "[src/database.js] Database is now Up-To-Date.");

        // END
        return resolve();

      } else {

        // SET VERSION TO UPDATE TO
        let update_to = version + 1;

        // LOOP EACH QUERY IN THE UPDATE
        await WDR.db[update_to].forEach(async (update, index) => {

          // PERFORM EACH QUERY FOR THE UPDATE
          await WDR.wdrDB.promise().query(
            update.sql,
            update.data,
            async function(error, results, fields) {
              if (error) {
                WDR.Console.error(update.bLog, error);
              } else {
                WDR.Console.log(update.gLog);
              }
              // CHANGE DB VERSION
              await WDR.wdrDB.promise().query(
                `UPDATE
                    wdr_info
                 SET
                    db_version = ${update_to}
                 WHERE
                    db_version = ${version}`
              );

              // LOG UPDATE
              WDR.Console.log(WDR, "[src/database.js] Database updated to Version " + update_to + ".");
            }
          );
        });
      }
    }
  });
}

module.exports = DB;