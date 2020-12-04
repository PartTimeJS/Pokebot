module.exports = function(WDR, p) {

    // ADD YOUR CUSTOM SPACING
    if (p.form) {
        p.form = ' ' + p.form;
    }
    
    if (p.gender_wemoji) {
        p.gender_wemoji = ' | ' + p.gender_wemoji;
    } else {
        p.gender_wemoji = '';
    }

    let pokemon_embed = new WDR.DiscordJS.MessageEmbed()
        .setColor(p.color)
        .setThumbnail(p.sprite)
        .setDescription('Subscribe at ' + p.url)
        .addField('**' + p.name + '** ' + p.form + p.attack + '/' + p.defense + '/' + p.stamina + ' (' + p.iv + '%)\n' +
            'Level ' + p.level + ' | CP ' + p.cp + p.gender, 'Ht: ' + p.height + 'm | Wt: ' + p.weight + 'kg | ' + p.size + '\n' +
            p.move_name_1 + ' ' + p.move_type_1 + ' / ' + p.move_name_2 + ' ' + p.move_type_2, false)
        .addField(p.verified + '| ' + p.time + ' (*' + p.mins + 'm ' + p.secs + 's*) ', p.type + p.weather_boost + '\n' +
            '**' + p.area + '**', false);

    return pokemon_embed;
};

// White space used in the default embed => " "
//(Copy between the quotes. It's not a normal space even though it looks like one.)

// Other spaces:
// https://www.brunildo.org/test/space-chars.html

//------------------------------------------------------------------------------
//  AVAILABLE VARIABLES
//------------------------------------------------------------------------------
//    p.gen             -   Generation
//    p.name            -   Locale Name
//    p.form            -   Locale Form Name
//    p.id              -   Pokedex ID
//    p.sprite          -   Sprite Image
//    p.iv              -   Internal Value
//    p.cp              -   CP
//    p.gender_wemoji   - Gender with Emoji
//    p.gender_noemoji  - Gender without Emoji
//    p.height          -   Take a wild guess
//    p.weight          -   Probably cant figure this one out
//    p.type            -   Type(s) Emoji(s)
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
//    p.static_map      -   Static Map Tile Image
//    p.verified        -   Spawnpoint Timer Verified Emoji (Yes/No)
//    p.time            -   Despawn Time
//    p.mins            -   Despawn Minutes
//    p.secs            -   Despawn Seconds
//    p.atk             -   Attack IV
//    p.def             -   Defense IV
//    p.sta             -   Stamina IV
//    p.lvl             -   Level