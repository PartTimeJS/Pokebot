module.exports = async (WDR, Raid) => {

  let discord = Raid.discord;

  let query_id = "";
  if (Raid.pokemon_id < 1) {
    query_id = -1;
  } else {
    query_id = Raid.pokemon_id;
  }

  let query = `
    SELECT
        *
    FROM
        wdr_subscriptions
    WHERE
        status = 1
      AND
        sub_type = 'raid'
      AND (
        pokemon_id = 0
          OR
        pokemon_id = ${query_id}
      )
      AND (
        max_lvl = 0
          OR
        max_lvl >= ${Raid.level}
      )
      AND (
        min_lvl = 0
          OR
        min_lvl <= ${Raid.level}
      )
      AND (
        gym_id = '0'
          OR
        gym_id = '${Raid.gym_id}'
      );
    `;

  WDR.wdrDB.query(
    query,
    async function(error, matching, fields) {
      if (error) {
        WDR.Console.error(WDR, "[commands/pokemon.js] Error Querying Subscriptions.", [query, error]);
      } else if (matching && matching[0]) {

        Raid.sprite = WDR.Get_Sprite(WDR, Raid);

        if (WDR.Config.RAID_PREGEN_TILES != "DISABLED") {
          Raid.body = await WDR.Generate_Tile(WDR, Raid, "pokemon", Raid.latitude, Raid.longitude, Raid.sprite);
          Raid.static_map = WDR.Config.STATIC_MAP_URL + 'staticmap/pregenerated/' + Raid.body;
        }

        for (let m = 0, mlen = matching.length; m < mlen; m++) {

          let User = matching[m];

          User.location = JSON.parse(User.location);

          let member = WDR.Bot.guilds.cache.get(Raid.discord.id).members.cache.get(User.user_id);
          if (member) {

            let memberRoles = member.roles.cache.map(r => r.id);

            let authorized = await WDR.Check_Roles(memberRoles, Raid.discord.allowed_roles);
            if (authorized) {

              let match = {};

              if (User.geotype == "city") {
                if (User.guild_name == Raid.area.default) {
                  match.embed = matching[0].embed ? matching[0].embed : "pokemon_iv.js";
                  if (WDR.Config.DEBUG.Pokemon_Subs == "ENABLED") {
                    WDR.Console.log(WDR, "[DEBUG] [src/subs/raids.js] " + Raid.gym_id + " | Sent city sub to " + User.user_name + ".");
                  }
                  Send_Subscription(WDR, match, Raid, User);
                } else if (WDR.Config.DEBUG.Pokemon_Subs == "ENABLED") {
                  WDR.Console.info(WDR, "[DEBUG] [src/subs/raids.js] " + Raid.gym_id + " | User: " + User.user_name + " | Failed City Geofence. Wanted: `" + User.guild_name + "` Saw: `" + Raid.area.default+"`")
                }

              } else if (User.geotype == "areas") {
                let defGeo = (User.areas.indexOf(Raid.area.default) >= 0);
                let mainGeo = (User.areas.indexOf(Raid.area.main) >= 0);
                let subGeo = (User.areas.indexOf(Raid.area.sub) >= 0);
                if (defGeo || mainGeo || subGeo) {
                  match.embed = matching[0].embed ? matching[0].embed : "pokemon_iv.js";
                  if (WDR.Config.DEBUG.Pokemon_Subs == "ENABLED") {
                    WDR.Console.log(WDR, "[DEBUG] [src/subs/raids.js] " + Raid.gym_id + " | Sent area sub to " + User.user_name + ".");
                  }
                  Send_Subscription(WDR, match, Raid, User);
                } else if (WDR.Config.DEBUG.Pokemon_Subs == "ENABLED") {
                  WDR.Console.info(WDR, "[DEBUG] [src/subs/raids.js] " + Raid.gym_id + " | User: " + User.user_name + " | Failed Area Geofence.")
                }

              } else if (User.geotype == "location") {
                let distance = WDR.Distance.between({
                  lat: Raid.latitude,
                  lon: Raid.longitude
                }, {
                  lat: User.location.coords.split(",")[0],
                  lon: User.location.coords.split(",")[1]
                });
                let loc_dist = WDR.Distance(parseInt(User.location.radius) + " km");
                if (loc_dist > distance) {
                  match.embed = matching[0].embed ? matching[0].embed : "pokemon_iv.js";
                  if (WDR.Config.DEBUG.Pokemon_Subs == "ENABLED") {
                    WDR.Console.log(WDR, "[DEBUG] [src/subs/raids.js] " + Raid.gym_id + " | Sent location sub to " + User.user_name + ".");
                  }
                  Send_Subscription(WDR, match, Raid, User);
                }
              } else {
                WDR.Console.error(WDR, "[DEBUG] [src/subs/raids.js] User: " + User.user_name + " | User geotype has a bad value.", User);
              }
            } else if (WDR.Config.DEBUG.Pokemon_Subs == "ENABLED") {
              WDR.Console.info(WDR, "[DEBUG] [src/subs/raids.js] " + Raid.gym_id + " | " + User.user_name + " IS NOT an Authorized User in " + discord.name + " (" + discord.id + ").");
              console.info("[DEBUG] [src/subs/raids.js] Allowed Roles: ", discord.allowed_roles);
              console.info("[DEBUG] [src/subs/raids.js] User Roles: ", memberRoles);
            }
          } else if (WDR.Config.DEBUG.Pokemon_Subs == "ENABLED") {
            WDR.Console.info(WDR, "[DEBUG] [src/subs/raids.js] " + Raid.gym_id + " | " + User.user_name + " IS NOT a Member of " + discord.name + " (" + discord.id + ").", discord);
          }
        }
      }
    }
  );

  // END
  return;
}

async function Send_Subscription(WDR, match, Raid, User) {
  match.id = Raid.gym_id;
  match.lvl = Raid.level;
  match.gym = Raid.gym_name ? Raid.gym_name : "No Name";

  if (WDR.Gym_Notes && WDR.Gym_Notes[Raid.gym_id]) {
    match.notes = WDR.Gym_Notes[Raid.gym_id] ? WDR.Gym_Notes[Raid.gym_id].description : "";
  } else {
    match.notes = "";
  }
  match.boss = Raid.pokemon_name ? Raid.pokemon_name : "Egg";
  match.exraid = Raid.is_exclusive ? "**EXRaid Invite Only**\n" : "";

  match.lat = Raid.latitude;
  match.lon = Raid.longitude;
  match.map_img = "";
  match.area = Raid.area.embed;
  match.map_url = WDR.Config.FRONTEND_URL;

  match.google = "[Google Maps](https://www.google.com/maps?q=" + match.lat + "," + match.lon + ")";
  match.apple = "[Apple Maps](http://maps.apple.com/maps?daddr=" + match.lat + "," + match.lon + "&z=10&t=s&dirflg=d)";
  match.waze = "[Waze](https://www.waze.com/ul?ll=" + match.lat + "," + match.lon + "&navigate=yes)";
  match.pmsf = "[Scan Map](" + WDR.Config.FRONTEND_URL + "?lat=" + match.lat + "&lon=" + match.lon + "&zoom=15)";
  match.rdm = "[Scan Map](" + WDR.Config.FRONTEND_URL + "@/" + match.lat + "/" + match.lon + "/15)";

  if (Raid.team_id == 1) {
    match.team = WDR.Emotes.mystic + " Control";
    match.url = Raid.gym_url ? Raid.gym_url : "https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/team_blue.png";
    match.embed_image = "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/gyms/Russell_Gym_Mystic.png";
  } else if (Raid.team_id == 2) {
    match.team = WDR.Emotes.valor + " Control";
    match.url = Raid.gym_url ? Raid.gym_url : "https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/team_red.png";
    match.embed_image = "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/gyms/Russell_Gym_Valor.png";
  } else if (Raid.team_id == 3) {
    match.team = WDR.Emotes.instinct + " Control";
    match.url = Raid.gym_url ? Raid.gym_url : "https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/team_yellow.png";
    match.embed_image = "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/gyms/Russell_Gym_Instinct.png";
  } else {
    match.team = "Uncontested Gym";
    match.url = Raid.gym_url ? Raid.gym_url : "https://raw.githubusercontent.com/shindekokoro/PogoAssets/master/static_assets/png/TeamLesRaid.png";
    match.embed_image = "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/gyms/Russell_Gym_Uncontested.png";
  }

  // CHECK IF SPONSORED GYM
  match.sponsor = (Raid.sponsor_id || Raid.ex_raid_eligible) ? WDR.Emotes.exPass + " Eligible" : "";

  // GET RAID COLOR
  if (Raid.level == 1 || Raid.level == 2) {
    match.color = "f358fb";
  } else if (Raid.level == 3 || Raid.level == 4) {
    match.color = "ffd300";
  } else {
    match.color = "5b00de";
  }

  match.hatch_time = WDR.Time(Raid.start, "1", Raid.Timezone);
  match.end_time = WDR.Time(Raid.end, "1", Raid.Timezone);
  match.hatch_mins = Math.floor((Raid.start - (Raid.Time_Now / 1000)) / 60);
  match.end_mins = Math.floor((Raid.end - (Raid.Time_Now / 1000)) / 60);

  match.marker_latitude = Raid.latitude + .0004;

  // DETERMINE IF IT"S AN EGG OR A RAID
  if (Raid.Type == "Egg") {
    if (Raid.level == 1 || Raid.level == 2) {
      match.sprite = "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/gyms/ic_raid_egg_normal.png";
    } else if (Raid.level == 3 || Raid.level == 4) {
      match.sprite = "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/gyms/ic_raid_egg_rare.png";
    } else {
      match.sprite = "https://raw.githubusercontent.com/PartTimeJS/Assets/master/pogo/gyms/ic_raid_egg_legendary.png";
    }
  } else {
    match.sprite = WDR.Get_Sprite(WDR, Raid);
    match.form = Raid.form_name ? Raid.form_name : "";
    match.form = match.form == "[Normal]" ? "" : match.form;
    match.typing = await WDR.Get_Typing(WDR, Raid);
    match.type = match.typing.type;
    match.type_noemoji = match.typing.type_noemoji;
    match.weaknesses = match.typing.weaknesses;
    match.resistances = match.typing.resistances;
    match.reduced = match.typing.reduced;
    match.move_1_type = WDR.Emotes[WDR.Master.Moves[Raid.move_1].type.toLowerCase()];
    match.move_2_type = WDR.Emotes[WDR.Master.Moves[Raid.move_2].type.toLowerCase()];
    match.move_1_name = Raid.move_1_name;
    match.move_2_name = Raid.move_2_name;
    match.minCP = WDR.PvP.CalculateCP(WDR, Raid.pokemon_id, Raid.form_id, 10, 10, 10, 20);
    match.maxCP = WDR.PvP.CalculateCP(WDR, Raid.pokemon_id, Raid.form_id, 15, 15, 15, 20);
    match.minCP_boosted = WDR.PvP.CalculateCP(WDR, Raid.pokemon_id, Raid.form_id, 10, 10, 10, 25);
    match.maxCP_boosted = WDR.PvP.CalculateCP(WDR, Raid.pokemon_id, Raid.form_id, 15, 15, 15, 25);
  }

  if (WDR.Debug.Processing_Speed == "ENABLED") {
    let difference = Math.round((new Date().getTime() - Raid.WDR_Received) / 10) / 100;
    match.footer = "Latency: " + difference + "s";
  }

  if (WDR.Config.RAID_PREGEN_TILES != "DISABLED") {
    if (Raid.static_map) {
      match.body = Raid.body;
      match.static_map = Raid.static_map;
    } else {
      match.body = await WDR.Generate_Tile(WDR, Raid, "raids", match.marker_latitude, match.lon, match.embed_image, match.sprite);
      Raid.body = match.body;
      match.static_map = WDR.Config.STATIC_MAP_URL + 'staticmap/pregenerated/' + match.body;
      Raid.static_map = match.static_map;
    }
  }

  match.embed = await Embed_Config(WDR, match);

  WDR.Send_DM(WDR, User.guild_id, User.user_id, match.embed, User.bot);
}