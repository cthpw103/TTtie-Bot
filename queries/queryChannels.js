module.exports = function (iQuery, msg) {
    return new Promise((rs, rj) => { // we return a promise
        let users = msg.guild.channels.filter(fn => {
            // saving all users in an array where it finds these formats
            // username, id, mention (<@!id> or <@id>), nickname, username#1234 or nickname#1234 - case insensitive
            if (fn.name == iQuery || fn.id == iQuery || `<#${fn.id}>` == iQuery || fn.name.startsWith(iQuery)) return true;
            else if (fn.name.toLowerCase() == iQuery.toLowerCase() || fn.name.toLowerCase().startsWith(iQuery.toLowerCase())) return true;
            else return false; // we ignore other users
        });
        let binds = {}; // we save all users here
        if (users.length == 1) { // if the length of the array is 1, we resolve with the first element
            return rs(users[0]);
        } else if (users.length >= 2) { // else, we do use a reaction choice
            let uarr = []; // this is just to define the newlines
            function listUsers() { // user listing
                let numbers = [":one:", ":two:", ":three:", ":four:", ":five:"]; // normal discord emoji text
                let numbersUnicode = ["\u0031\u20E3", "\u0032\u20E3", "\u0033\u20E3", "\u0034\u20E3", "\u0035\u20E3"]; // unicode
                for (let i = 0; i <= 4; i++) { // we select first 5 users
                    let u = users[i]; // we try to define the user
                    if (u) { // if the user exists
                        uarr.push(numbers[i] + `    ${u.name}`); // we push it into the array with the newline definitions
                        binds[numbersUnicode[i]] = { // we also save it
                            userId: u.id // and put there his user id
                        };
                    }
                }
                return uarr.join("\n"); // we return a string from the array with newlines
            }
            bot.createMessage(msg.channel.id, { //then we send a message
                embed: { // with an embed
                    title: "Multiple channels found!", // saying that there are multiple users
                    description: `I've found ${users.length} users, displaying maximally 5 channels.\n${listUsers()}\nChoose one from the users by reacting with the number next to the username.\nElse, react with ❌ to cancel.\nQuery will automatically expire in 5 minutes.` // and other additional information, and of course, the user listing function to let user know
                }
            }).then(m => {
                let tout = setTimeout(() => { // we have a timeout for 5 minutes
                    bot.removeListener("messageReactionAdd", r); m.delete(); bot.createMessage(msg.channel.id, "Query canceled automatically after inactivity."); // which deletes the reaction listener and deletes message and let's user know
                    rj("Canceled automatically.");
                }, 300000);
                let numbers = ["\u0031\u20E3", "\u0032\u20E3", "\u0033\u20E3", "\u0034\u20E3", "\u0035\u20E3"]; // unicode emojis again
                for (let i = 0; i <= 4; i++) {
                    let u = users[i];
                    if (u) // we again query the array
                        m.addReaction(numbers[i]) // we add the reaction
                            .then(null, () => { rj("Cannot add reactions");  bot.createMessage(msg.channel.id, "Can't add reactions here, query canceled."); m.delete(); clearTimeout(tout); }); // if we can't, then we delete the message and delete the timeout
                }
                m.addReaction("❌");
                function r(me, e, u) {
                    if (u != msg.author.id) return; // ignoring other users
                    if (me.id != m.id) return; // ignoring other messages
                    if (e.name == "❌") { bot.removeListener("messageReactionAdd", r); m.delete(); bot.createMessage(msg.channel.id, "Query canceled."); rj("Cancelled by user"); clearTimeout(tout); } //cance
                    let bindUser = binds[e.name]; // this is the actual object
                    if (bindUser) { // if it exists
                        m.delete(); // we delete the message
                        clearTimeout(tout); // clear the timeout
                        bot.removeListener("messageReactionAdd", r); // remove the listener
                        return rs(msg.guild.members.get(bindUser.userId)); // and we resolve with the user
                    }
                }
                bot.on("messageReactionAdd", r);

            }).catch(() => {
                rj("Can't embed or send messages."); // if we can't send the message or embed it, we end
            });
        } else if (users.length == 0) { // else
            bot.createMessage(msg.channel.id, "No such channel!");  // we let user know that it doesn't exist
            rj("No such user."); // and end.
        }
    });

};