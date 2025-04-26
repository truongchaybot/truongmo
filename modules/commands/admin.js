var request = require("request");const { readdirSync, readFileSync, writeFileSync, existsSync, copySync, createWriteStream, createReadStream } = require("fs-extra");
module.exports.config = {
	name: "admin",
	version: "1.0.5",
	hasPermssion: 3,
	credits: "Mirai Team",
	description: "Admin Config",
	commandCategory: "Admin",
	usages: "Admin",
    cooldowns: 2,
    dependencies: {
        "fs-extra": ""
    }
};

module.exports.languages = {
    "vi": {
        "listAdmin": `===「 ADMIN BOT 」===\n━━━━━━━━━━━━━━━\n%1\n\n==「 NGƯỜI THUÊ BOT 」==\n━━━━━━━━━━━━━━━\n%2`,
        "notHavePermssion": 'MODE - Bạn không đủ quyền hạn để có thể sử dụng chức năng "%1"',
        "addedNewAdmin": 'MODE - Đã thêm thành công %1 người dùng trở thành Admin Bot\n\n%2',
      "addedNewNDH": 'MODE - Đã thêm thành công %1 người dùng trở thành Người Thuê Bot\n\n%2',
        "removedAdmin": 'MODE - Đã gỡ thành công vai trò Admin %1 người dùng trở lại làm thành viên\n\n%2',
      "removedNDH": 'MODE - Đã gỡ thành công vai trò Người Thuê Bot %1 người dùng trở lại làm thành viên\n\n%2'

    },
    "en": {
        "listAdmin": '[Admin] Admin list: \n\n%1',
        "notHavePermssion": '[Admin] You have no permission to use "%1"',
        "addedNewAdmin": '[Admin] Added %1 Admin :\n\n%2',
        "removedAdmin": '[Admin] Remove %1 Admin:\n\n%2'
    }
}
module.exports.onLoad = function() {
    const { writeFileSync, existsSync } = require('fs-extra');
    const { resolve } = require("path");
    const path = resolve(__dirname, 'cache', 'data.json');
    if (!existsSync(path)) {
        const obj = {
            adminbox: {}
        };
        writeFileSync(path, JSON.stringify(obj, null, 4));
    } else {
        const data = require(path);
        if (!data.hasOwnProperty('adminbox')) data.adminbox = {};
        writeFileSync(path, JSON.stringify(data, null, 4));
    }
}
module.exports.run = async function ({ api, event, args, Users, permssion, getText }) {  
    const content = args.slice(1, args.length);
    if (args.length == 0) return api.sendMessage({body:`==== [ ADMIN SETTING ] ====\n━━━━━━━━━━━━━━━\n- admin list: Xem danh sách admin\n- admin add: Thêm admin mới\n- admin del: Gỡ vai trò admin\n- admin addntb: Thêm người thuê bot mới\n- admin delntb: Gỡ vai trò người thuê bot\n- admin qtvonly: Bật/Tắt tính năng chỉ qtv box được dùng bot\n- admin ntbonly: Bật/Tắt tính năng chỉ được người thuê dùng bot\n- admin only: Bật/Tắt tính năng chỉ được admin dùng bot\n- admin ibonly: Chỉ được admin mới được ib với bot`}, event.threadID, event.messageID); 
    const { threadID, messageID, mentions } = event;
    const { configPath } = global.client;
    const { ADMINBOT } = global.config;
    const { NDH } = global.config;
    const { userName } = global.data;
    const { writeFileSync } = global.nodemodule["fs-extra"];
    const mention = Object.keys(mentions);

    delete require.cache[require.resolve(configPath)];
    var config = require(configPath);
    switch (args[0]) {
        case "list":
        case "all":
        case "-a": { 
          listAdmin = ADMINBOT || config.ADMINBOT ||  [];
            var msg = [];
            for (const idAdmin of listAdmin) {
                if (parseInt(idAdmin)) {
                  const name = (await Users.getData(idAdmin)).name
                    msg.push(`Tên: ${name}\n» FB: https://www.facebook.com/${idAdmin}`);
                }
            }
          listNDH = NDH || config.NDH ||  [];
            var msg1 = [];
            for (const idNDH of listNDH) {
                if (parseInt(idNDH)) {
                  const name1 = (await Users.getData(idNDH)).name
                    msg1.push(`Tên: ${name1}\n» FB: https://www.facebook.com/${idNDH}`);
                }
            }

            return api.sendMessage(getText("listAdmin", msg.join("\n\n"), msg1.join("\n\n")), threadID, messageID);
        }

       
        case "add": { 
            if (event.senderID != global.config.NDH[0]) return api.sendMessage(`❎ Bạn không phải là Admin Bot nên không có quyền sử dụng lệnh này. `, event.threadID, event.messageID)
            if (permssion != 3) return api.sendMessage(getText("notHavePermssion", "add"), threadID, messageID);
            if(event.type == "message_reply") { content[0] = event.messageReply.senderID }
            if (mention.length != 0 && isNaN(content[0])) {
                var listAdd = [];

                for (const id of mention) {
                    ADMINBOT.push(id);
                    config.ADMINBOT.push(id);
                    listAdd.push(`${id} - ${event.mentions[id]}`);
                };

                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                return api.sendMessage(getText("addedNewAdmin", mention.length, listAdd.join("\n").replace(/\@/g, "")), threadID, messageID);
            }
            else if (content.length != 0 && !isNaN(content[0])) {
                ADMINBOT.push(content[0]);
                config.ADMINBOT.push(content[0]);
                const name = (await Users.getData(content[0])).name
                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                return api.sendMessage(getText("addedNewAdmin", 1, `Admin - ${name}`), threadID, messageID);
            }
            else return global.utils.throwError(this.config.name, threadID, messageID);
        }
        case "add": { 
          if (event.senderID != global.config.NDH[0]) return api.sendMessage(`❎ Bạn không phải là Admin Bot nên không có quyền sử dụng lệnh này. `, event.threadID, event.messageID)
            if (permssion != 3) return api.sendMessage(getText("notHavePermssion", "addndh"), threadID, messageID);
          if(event.type == "message_reply") { content[0] = event.messageReply.senderID }
            if (mention.length != 0 && isNaN(content[0])) {
                var listAdd = [];
                for (const id of mention) {
                    NDH.push(id);
                    config.NDH.push(id);
                    listAdd.push(`${id} - ${event.mentions[id]}`);
                };

                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                return api.sendMessage(getText("addedNewNDH", mention.length, listAdd.join("\n").replace(/\@/g, "")), threadID, messageID);
            }
            else if (content.length != 0 && !isNaN(content[0])) {
                NDH.push(content[0]);
                config.NDH.push(content[0]);
                const name = (await Users.getData(content[0])).name
                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                return api.sendMessage(getText("addedNewNDH", 1, `Người Thuê Bot - ${name}`), threadID, messageID);
            }
            else return global.utils.throwError(this.config.name, threadID, messageID);
                  }
        case "remove":
        case "rm":
        case "del": {
            if (event.senderID != global.config.NDH[0]) return api.sendMessage(`❎ Bạn không phải là Admin Bot nên không có quyền sử dụng lệnh này. `, event.threadID, event.messageID)
            if (permssion != 3) return api.sendMessage(getText("notHavePermssion", "del"), threadID, messageID);
            if(event.type == "message_reply") { content[0] = event.messageReply.senderID }
            if (mentions.length != 0 && isNaN(content[0])) {
                const mention = Object.keys(mentions);
                var listAdd = [];

                for (const id of mention) {
                    const index = config.ADMINBOT.findIndex(item => item == id);
                    ADMINBOT.splice(index, 1);
                    config.ADMINBOT.splice(index, 1);
                    listAdd.push(`${id} - ${event.mentions[id]}`);
                };

                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                return api.sendMessage(getText("removedAdmin", mention.length, listAdd.join("\n").replace(/\@/g, "")), threadID, messageID);
            }
            else if (content.length != 0 && !isNaN(content[0])) {
                const index = config.ADMINBOT.findIndex(item => item.toString() == content[0]);
                ADMINBOT.splice(index, 1);
                config.ADMINBOT.splice(index, 1);
                const name = (await Users.getData(content[0])).name
                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                return api.sendMessage(getText("removedAdmin", 1, `${content[0]} - ${name}`), threadID, messageID);
            }
            else global.utils.throwError(this.config.name, threadID, messageID);
            }

        case "removentb":
        case "delntb":{
          if (event.senderID != global.config.NDH[0]) return api.sendMessage(`❎ Bạn không phải là Admin Bot nên không có quyền sử dụng lệnh này. `, event.threadID, event.messageID)
            if (permssion != 3) return api.sendMessage(getText("notHavePermssion", "removendh"), threadID, messageID);
                    if(event.type == "message_reply") { content[0] = event.messageReply.senderID }
            if (mentions.length != 0 && isNaN(content[0])) {
                const mention = Object.keys(mentions);
                var listAdd = [];

                for (const id of mention) {
                    const index = config.NDH.findIndex(item => item == id);
                    NDH.splice(index, 1);
                    config.NDH.splice(index, 1);
                    listAdd.push(`${id} -${event.mentions[id]}`);
                };

                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                return api.sendMessage(getText("removedNDH", mention.length, listAdd.join("\n").replace(/\@/g, "")), threadID, messageID);
            }
            else if (content.length != 0 && !isNaN(content[0])) {
                const index = config.NDH.findIndex(item => item.toString() == content[0]);
                NDH.splice(index, 1);
                config.NDH.splice(index, 1);
                const name = (await Users.getData(content[0])).name
                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                return api.sendMessage(getText("removedNDH", 1, `${content[0]} - ${name}`), threadID, messageID);
            }
            else global.utils.throwError(this.config.name, threadID, messageID);
  }
        case 'qtvonly': {
       const { resolve } = require("path");
        const pathData = resolve(__dirname, 'cache', 'data.json');
        const database = require(pathData);
        const { adminbox } = database;   
          if (permssion < 1) return api.sendMessage("❎ Bạn không phải là Admin Bot nên không có quyền sử dụng lệnh này. ", threadID, messageID);
        if (adminbox[threadID] == true) {
            adminbox[threadID] = false;
            api.sendMessage("✅ Đã tắt chế độ chỉ quản lý nhóm được dùng bot.", threadID, messageID);
        } else {
            adminbox[threadID] = true;
            api.sendMessage("✅ Đã bật thành công chế độ chỉ quản lý nhóm dùng được bot.", threadID, messageID);
    }
        writeFileSync(pathData, JSON.stringify(database, null, 4));
        break;
    }
   case 'ntbonly':
        case '-ndh': {
            //---> CODE ADMIN ONLY<---//
   if (permssion < 2) return api.sendMessage("❎ Bạn không phải là Người Thuê Bot nên không có quyền sử dụng lệnh này. ", threadID, messageID);       
            if (config.ndhOnly == false) {
                config.ndhOnly = true;
                api.sendMessage(`✅ Đã bật thành công chế độ chỉ Người Thuê Bot mới dùng được bot.`, threadID, messageID);
            } else {
                config.ndhOnly = false;
                api.sendMessage(`✅ Đã tắt chế độ chỉ Người Thuê Bot mới dùng được bot.`, threadID, messageID);
            }
                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                break;
            }
            case 'ibonly': {
            if (permssion != 3) return api.sendMessage("❎ Bạn không phải là Admin Bot nên không có quyền sử dụng lệnh này.", threadID, messageID);
                   if (config.adminPaOnly == false) {
                    config.adminPaOnly = true;
                    api.sendMessage("✅ Đã bật thành công chế độ chỉ Admin được phép ib riêng với bot", threadID, messageID);
                } else {
                    config.adminPaOnly = false;
                    api.sendMessage("✅ Đã tắt chế độ chỉ Admin mới dùng được bot, tất cả mọi người bây giờ có thể ib riêng với bot.", threadID, messageID);
                }
                    writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
            break;
        }
        case 'only':
        case '-o': {
            //---> CODE ADMIN ONLY<---//
          if (permssion != 3) return api.sendMessage("❎ Bạn không phải là Admin Bot nên không có quyền sử dụng lệnh này. ", threadID, messageID);
            if (config.adminOnly == false) {
                config.adminOnly = true;
                api.sendMessage(`✅ Đã bật thành công chế độ chỉ Admin dùng bot`, threadID, messageID);
            } else {
                config.adminOnly = false;
                api.sendMessage(`✅ Đã tắt thành công chế độ chỉ Admin dùng bot, tất cả mọi người bây giờ có thể dùng bot.`, threadID, messageID);
            }
                writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
                break;
              }
        default: {
            return global.utils.throwError(this.config.name, threadID, messageID);
        }
    };
      }
