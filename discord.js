module.exports = function () {
    global.fs = require("fs");
    global.ErisO = require("eris");
    global.Eris = require("./libutil");
    const bot = new Eris(config.token,{
        getAllUsers:true,
        disableEveryone: false,
        defaultImageSize: 1024,
        defaultImageFormat: "webp"
    });
    global.isO = function(msg) {
        return msg.author.id == config.oid;
    };
    global.connected = false;
    bot.connect();
    global.bot = bot;
    global.cmds = {};
    global.cmdAliases = {};
    require("./msgdotguild");
    require("./evt");
};