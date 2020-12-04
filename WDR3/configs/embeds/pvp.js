module.exports = function(WDR, p) {

  // ADD YOUR CUSTOM SPACING
  if (p.form) {
    p.form = " " + p.form;
  }

  if (p.gender_wemoji) {
    p.gender_wemoji = " | " + p.gender_wemoji;
  } else {
    p.gender_wemoji = "";
  }

  if (p.gender_noemoji) {
    p.gender_noemoji = " | " + p.gender_noemoji;
  } else {
    p.gender_noemoji = "";
  }

  p.possible_cps.forEach(pvp => {
    let pipe = " | "; // SPACING
    let Name = WDR.Master.Pokemon[pvp.pokemon_id].name;
    let Level = "Lvl " + pvp.level;
    let Cp = "CP " + pvp.cp;
    let Rank = "**Rank " + pvp.rank + "**";
    let Percent = pvp.percent + "%";
    let string = Rank + " " + Name + " (" + Percent + ")\n" + Level + pipe + Cp + pipe + p.atk + "/" + p.def + "/" + p.sta;
    p.pvp_data += string + "\n";
  });

  let Pokemon_Embed = new WDR.DiscordJS.MessageEmbed()
    .setColor(p.color)
    .setThumbnail(p.sprite)
    .setTitle(p.pvp_data)
    .setDescription("**" + p.name + "" + p.form + "** " + p.atk + "/" + p.def + "/" + p.sta + " (" + p.iv + "%)" + "\n" +
      "Level " + p.lvl + " | CP " + p.cp + p.gender_wemoji + "\n" +
      "Ht: " + p.height + "m | Wt: " + p.weight + "kg | " + p.size + "\n" +
      p.move_1_name + " " + p.move_1_type + " / " + p.move_2_name + " " + p.move_2_type + "\n" +
      "Despawn: **" + p.time + " (" + p.mins + "m " + p.secs + "s)** " + p.verified + "\n" +
      p.weather_boost + " \n" +
      "Directions:" + "\n" +
      p.google + " - " + p.apple + " - " + p.waze)
    .setImage(p.static_map)
    .setFooter(p.footer);

  return Pokemon_Embed;
}

//------------------------------------------------------------------------------
//  AVAILABLE VARIABLES
//------------------------------------------------------------------------------
//    p.pvpString       -   String of PVP data
//    p.ranks           -   String of PVP Ranks
//    p.pvp_data        -   Lines of PVP Data
//    p.gen             -   Generation
//    p.name            -   Locale Name
//    p.form       -   Locale Form Name
//    p.id              -   Pokedex ID
//    p.sprite          -   Sprite Image
//    p.iv              -   Internal Value
//    p.cp              -   CP
//    p.gender_wemoji   - Gender with Emoji
//    p.gender_noemoji  - Gender without Emoji
//    p.height          -   Take a wild guess
//    p.weight          -   Probably cant figure this one out
//    p.type_wemoji     -   Type(s) w/ Emoji(s)
//    p.type_noemoji    -   Type(s) Wording
//    p.color           -   Type Color (Hex)
//    p.weather_boost   -   If Weather-Boosted
//    p.lat             -   GPS Latitude
//    p.lon             -   GPS Longitude
//    p.area            -   Geofence Area of the Sighting
//    p.move_1_name     -   Locale Move 1 Name
//    p.move_2_name     -   Locale Move 2 Name
//    p.move_1_type     -   Move 1 Type Emoji
//    p.move_2_type     -   Move 2 Type Emoji
//    p.map_url         -   Map URL
//    p.google          -   Google Directions URL
//    p.apple           -   Apple Directions URL
//    p.waze            -   Waze Directions URL
//    p.pmsf            -   PMSF Map Link to the Sighting
//    p.rdm             -   RDM Map Link to the Sighting
//    p.verified        -   Spawnpoint Timer Verified Emoji (Yes/No)
//    p.time            -   Despawn Time
//    p.mins            -   Despawn Minutes
//    p.secs            -   Despawn Seconds
//    p.atk             -   Attack IV
//    p.def             -   Defense IV
//    p.sta             -   Stamina IV
//    p.lvl             -   Level
//    p.footer          -   Includes processing latency