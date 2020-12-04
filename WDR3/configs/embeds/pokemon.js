module.exports = function(WDR, p) {

  let pokemon_embed = new WDR.DiscordJS.MessageEmbed()
    .setColor(p.color)
    .setThumbnail(p.sprite)
    .addField("**" + p.name + "** " + p.form + p.gender, p.verified + "| " + p.time + " (*" + p.mins + "m " + p.secs + "s*)\n" + p.type + p.weather_boost)
    .addField("**" + p.area + " | Directions:", p.google + " | " + p.apple + " | " + p.waze, false)
    .setImage(p.static_map);

  return pokemon_embed;
}