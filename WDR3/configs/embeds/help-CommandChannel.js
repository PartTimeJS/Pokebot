const Discord = require("discord.js");
module.exports = function(c) {
  if (c.user) {
    //############################################################################
    //  USER HELP COMMAND
    //############################################################################

    let user_help = new Discord.MessageEmbed()
      .setColor("000044")
      .setTitle("Available Subscription Commands")
      .setDescription("Type a Command to view category options." + "\n" +

        "`" + c.prefix + "pokemon`　or　`" + c.prefix + "p`" + "\n" +
        "　Initializes Pokémon Subscription Options." + "\n" +

        "`" + c.prefix + "pvp`" + "\n" +
        "　Initializes Pokémon PvP Subscription Options." + "\n" +

        // "`" + c.prefix + "quest`　or　`" + c.prefix + "q`" + "\n" +
        // "　Initializes Quest Subscription Options." + "\n" +
        //
        // "`" + c.prefix + "lure`　or　`" + c.prefix + "l`" + "\n" +
        // "　Initializes Lure Subscription Options." + "\n" +
        //
        // "`" + c.prefix + "invasion`　or　`" + c.prefix + "i`" + "\n" +
        // "　Initializes Team Rocket Invasion Subscription Options." + "\n" +
        //
        // "`" + c.prefix + "area`" + "\n" +
        // "　Shows Area subscription options." + "\n" +

        "`" + c.prefix + "pause`　or　`" + c.prefix + "resume`" + "\n" +
        "　Pause　or　Resume **ALL** subscription alerts." + "\n" +

        // "`" + c.prefix + "seen`　or　`" + c.prefix + "s`" + "\n" +
        // "　Look up the # of sightings for a specific Pokémon." + "\n" +

        // "`" + c.prefix + "nest`　or　`" + c.prefix + "n`" + "\n" +
        // "　Initializes Nest Search." + "\n" +
        //
        // "`" + c.prefix + "cp`" + "\n" +
        // "　Initializes perfect Pokémon CP string lookup." + "\n" +
        //
        // "`" + c.prefix + "raidcp`" + "\n" +
        // "　Initializes raid Pokémon top CPs table." + "\n" +
        //
        // "`" + c.prefix + "questcp`" + "\n" +
        // "　Initializes quest Pokémon top CPs table." + "\n" +
        //
        // "`" + c.prefix + "dex`" + "\n" +
        // "　Initializes Pokedex search."
      );

    return user_help;

  } else if (c.admin) {
    //############################################################################
    //  ADMIN HELP COMMAND
    //############################################################################


    let admin_help = new Discord.MessageEmbed()
      .setColor("000044")
      .setTitle("Available Subscription Commands")
      .setDescription("Type a Command to view category options." + "\n" +

        "`" + c.prefix + "pokemon`　or　`" + c.prefix + "p`" + "\n" +
        "　Initializes Pokémon Subscription Options." + "\n" +

        "`" + c.prefix + "pvp`" + "\n" +
        "　Initializes Pokémon PvP Subscription Options." + "\n" +

        // "`" + c.prefix + "quest`　or　`" + c.prefix + "q`" + "\n" +
        // "　Initializes Quest Subscription Options." + "\n" +
        //
        // "`" + c.prefix + "lure`　or　`" + c.prefix + "l`" + "\n" +
        // "　Initializes Lure Subscription Options." + "\n" +
        //
        // "`" + c.prefix + "invasion`　or　`" + c.prefix + "i`" + "\n" +
        // "　Initializes Team Rocket Invasion Subscription Options." + "\n" +
        //
        // "`" + c.prefix + "area`" + "\n" +
        // "　Shows Area subscription options." + "\n" +

        "`" + c.prefix + "pause`　or　`" + c.prefix + "resume`" + "\n" +
        "　Pause　or　Resume **ALL** subscription alerts." + "\n" +

        // "`" + c.prefix + "seen`　or　`" + c.prefix + "s`" + "\n" +
        // "　Look up the # of sightings for a specific Pokémon." + "\n" +

        // "`" + c.prefix + "nest`　or　`" + c.prefix + "n`" + "\n" +
        // "　Initializes Nest Search." + "\n" +
        //
        // "`" + c.prefix + "cp`" + "\n" +
        // "　Initializes perfect Pokémon CP string lookup." + "\n" +
        //
        // "`" + c.prefix + "raidcp`" + "\n" +
        // "　Initializes raid Pokémon top CPs table." + "\n" +
        //
        // "`" + c.prefix + "questcp`" + "\n" +
        // "　Initializes quest Pokémon top CPs table." + "\n" +
        //
        // "`" + c.prefix + "dex`" + "\n" +
        // "　Initializes Pokedex search."
      );

    return admin_help;
  }




}