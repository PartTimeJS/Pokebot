// Get Size of Pokemon BIG Karp/Tiny Rat
module.exports = (WDR, pokemon_id, form_id, pokemon_height, pokemon_weight) => {
    return new Promise(resolve => {
        let weightRatio = 0,
            heightRatio = 0;
        if (form_id > 0 && WDR.Master.pokemon[pokemon_id].forms[form_id]) {
            let form_weight = WDR.Master.pokemon[pokemon_id].forms[form_id].weight ? WDR.Master.pokemon[pokemon_id].forms[form_id].weight : WDR.Master.pokemon[pokemon_id].weight;
            let form_height = WDR.Master.pokemon[pokemon_id].forms[form_id].height ? WDR.Master.pokemon[pokemon_id].forms[form_id].height : WDR.Master.pokemon[pokemon_id].height;
            weightRatio = pokemon_weight / form_weight;
            heightRatio = pokemon_height / form_height;
        } else if (form_id > 0 && !WDR.Master.pokemon[pokemon_id].forms[form_id]) {
            WDR.Console.error(WDR, '[functions/Get_Size.js] Missing Form `' + form_id + '` for Pokemon `' + pokemon_id + '`');
        } else {
            weightRatio = pokemon_weight / WDR.Master.pokemon[pokemon_id].weight;
            heightRatio = pokemon_height / WDR.Master.pokemon[pokemon_id].height;
        }

        let size = heightRatio + weightRatio;

        switch (true) {
            case size < 1.5:
                return resolve('tiny');
            case size <= 1.75:
                return resolve('small');
            case size < 2.25:
                return resolve('normal');
            case size <= 2.5:
                return resolve('large');
            default:
                return resolve('big');
        }
    });
};