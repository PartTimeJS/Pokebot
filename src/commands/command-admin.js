module.exports = (WDR, Message) => {
    let command = Message.content.split(' ')[0].slice(1);
    try {
        if (WDR.Fs.existsSync(WDR.Dir + '/src/commands/admin/' + command.toLowerCase() + '.js')) {
            let Cmd = require(WDR.Dir + '/src/commands/admin/' + command.toLowerCase() + '.js');
            Cmd(WDR, Message);
        } else {
            console.log(WDR.Dir + '/src/commands/admin/' + command.toLowerCase() + '.js does not exist');
        }
    } catch (error) {
        console.error(error);
    }
};