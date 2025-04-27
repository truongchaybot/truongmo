const folder = process.cwd() + "/includes/datajson/";
const fse = require("fs-extra");
const { unlinkSync, renameSync, writeFileSync, readdirSync, readFileSync, statSync } = require("fs");
const { downloadFile } = require("../../utils/index");
exports.config = {
  name: "api",
  version: "0.0.9",
  hasPermssion: 0,
  credits: "Harin",
  description: "Up link lên data API",
  commandCategory: "Admin",
  usages: "[ text ] + [ namefile ] + [ reply link or image/video ]",
  cooldowns: 5,
  usePrefix: false,
  dependencies: ""
};
exports.run = async function (_){
const { threadID: t, messageReply: mRl, messageID: m, senderID: s } = _.event;
const send = (msg, callback) => _.api.sendMessage(msg, t, callback, m)
const permission = global.config.ADMINBOT[0];
if (!permission.includes(s)) return send("Cút!")
if (!fse.existsSync(folder)) {
fse.mkdirSync(folder, { recursive: true });
};
switch (_.args[0]){
case "add":{
var namefile = _.args.join(" ").slice(4)
if(!namefile && !mRl){
send("Vui lòng nhập tên file và reply link or video/image! ❎")
} else if(!namefile){
send("Vui lòng nhập tên file! ❎")
} else if(!mRl){
send("Vui lòng reply link! ❎")
}
if(mRl.attachments == 0){
if(namefile){
const regex = /(https?:\/\/[^\s]+)/g;
const nd = mRl.body.match(regex);
if(nd == null ) return send("Không phải link! ❎")
if (!fse.existsSync(`${folder}${namefile}.json`)) {
fse.writeFileSync(`${folder}${namefile}.json`, "[]");
};
nd.forEach((msg) => {
let data = JSON.parse(fse.readFileSync(`${folder}/${namefile}.json`), "utf-8");
data.push(msg)
fse.writeFileSync(`${folder}${namefile}.json`, JSON.stringify(data, null, 4), "utf-8")
})
send(`✅ Đã up ${nd.length} link lên API`)
}
}
if(mRl.attachments[0].url) {
if(namefile){
if (!fse.existsSync(`${folder}${namefile}.json`)) {
fse.writeFileSync(`${folder}${namefile}.json`, "[]");
};
let data = JSON.parse(fse.readFileSync(`${folder}/${namefile}.json`), "utf-8");
var file = []
for(let h of(mRl.attachments || []))try {
const ext = h.type == "photo" ? "jpg" : h.type == "video" ? "mp4" : h.type == "audio" ? "m4a" : h.type == "animated_image" ? "gif" : "txt";
await downloadFile(h.url, __dirname + `/cache/0.${ext}`);
file.push(__dirname + `/cache/0.${ext}`)
} catch (e) {};
for (i of file){
require("imgur").setClientId("c76eb7edd1459f3");
const link = await require("imgur").uploadFile(i)
data.push(link.link)
unlinkSync(i)
}
send(`✅ Đã up ${mRl.attachments.length} link lên API`)
fse.writeFileSync(`${folder}${namefile}.json`, JSON.stringify(data, null, 4), "utf-8")
}
}
break;
}
case "del":{
try {
unlinkSync(folder + _.args[1] + '.json');
send("Đã xóa thành công tệp! ✅");
} catch (e) {
send("Không tồn tại tệp! ❎");
}
break;
}
case "rename":{
try {
renameSync(folder + _.args[1] + '.json', folder + _.args[2] + '.json');
send("Đã đổi thành công tên tệp! ✅");
} catch (e) {
send("Không tồn tại tệp để đổi tên! ❎");
}
break;
}
case "write":{
try{
writeFileSync(folder + _.args[1] + '.json', '[]')
send("Đã tạo thành công file cho bạn! ✅")
} catch (e) {
send("Tệp đã tồn tại! ✅");
}
break;
}
case "read":{
try{
send(readFileSync(folder + _.args[1] + '.json', "utf-8"))
} catch (e) {
send("Không thể đọc tệp bạn yêu cầu! ❎");
}
break;
}
case "list":{
const files = readdirSync(folder)
var msg = []
msg = "[ Danh Sách API Hiện Có ]\n"
files.forEach((file, index) => {
const stats = statSync(folder + file).size;
msg += `\n[ ${index + 1} ]. ${file} ( ${stats} bytes )`
});
var msgg = `\n\n API bạn tổng có: ${readdirSync(folder).length} file\n📌 Reply (phản hồi) theo STT để xem chi tiết`
send({body:`${msg}${msgg}`, attachment: global.a.splice(0, 1)}, (err, res)=>(res.name = exports.config.name, res.author = s, res.message = m, res.type = "infoapi", res.namefolder = files, global.client.handleReply.push(res)))
break;
}
default: send({ attachment: (await require("axios").get(`${global.api_url}/upload/wdpu5tlqy3.jpg`, { responseType: "stream" })).data })
}
}
exports.handleReply = async function(o) {
const { threadID: t, messageID: m, body: b, args: a, senderID: s } = o.event;
const send = (msg,callback) => o.api.sendMessage(msg, t, callback, m)
if (s != o.handleReply.author) return send("Cút!")
o.api.unsendMessage(o.handleReply.message)
switch (o.handleReply.type){
case "infoapi": {
try{
send({body:`[ ${o.handleReply.namefolder[b-1]} ]\n🌐 Số link hiện có: ${JSON.parse(readFileSync(folder + o.handleReply.namefolder[b-1])).length}\n\n📌 Reply (phản hồi) tin nhắn này\nXóa -> Dùng để xóa API\nRename -> Dùng để đổi tên API\nRead -> Dùng để đọc nội dung API\nUp -> Dùng để up nội dung API lên runmocky`, attachment: global.a.splice(0, 1)},(err, res)=>(res.name = exports.config.name, res.author = s, res.message = m, res.type = "fileapi", res.namefolder = o.handleReply.namefolder[b-1], global.client.handleReply.push(res)))
} catch (e){
const data = JSON.stringify(readFileSync(folder + o.handleReply.namefolder[b-1], "utf-8").split("\n"))
send({body:`[ ${o.handleReply.namefolder[b-1]} ]\n🌐 Số link hiện có: ${JSON.parse(data).length}\n\n📌 Reply (phản hồi) tin nhắn này\nXóa -> Dùng để xóa API\nRename -> Dùng để đổi tên API\nRead -> Dùng để đọc nội dung API\nUp -> Dùng để up nội dung API lên runmocky`, attachment: global.a.splice(0, 1)},(err, res)=>(res.name = exports.config.name, res.author = s, res.message = m, res.type = "fileapi", res.namefolder = o.handleReply.namefolder[b-1], global.client.handleReply.push(res)))
}
}
break;
case 'fileapi': {
switch (a[0].toLowerCase()){
case "read":{
try{
send(readFileSync(folder + o.handleReply.namefolder, "utf-8"))
} catch (e) {
send("Không thể đọc tệp bạn yêu cầu! ❎");
}
break;
}
case "xoá":{
try {
unlinkSync(folder + o.handleReply.namefolder);
send("Đã xóa thành công tệp! ✅");
} catch (e) {
send("Không tồn tại tệp! ❎");
}
break;
}
case "rename":{
try {
renameSync(folder + o.handleReply.namefolder, folder + a[1] + '.json');
send("Đã đổi thành công tên tệp! ✅");
} catch (e) {
send("Không tồn tại tệp để đổi tên! ❎");
}
break;
}
case "up": {
const data = readFileSync(folder + o.handleReply.namefolder,"utf-8")
const result = await require("axios").post("https://api.mocky.io/api/mock", {
status: 200,
content: data,
content_type: "application/json",
charset: "UTF-8",
secret: "lvbang",
expiration: "never",
});
send(`${result.data.link}`);
break;
}
default: send({ attachment: (await require("axios").get(`${global.api_url}/upload/le161w4sb6.jpg`, { responseType: "stream" })).data })
}
}
break;
}
}
