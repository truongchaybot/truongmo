const os = require('os');
const moment = require('moment-timezone');
const fs = require('fs').promises;
const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = {
    config: {
        name: "upt",
        version: "3.1.0",
        hasPermission: 2,
        credits: "",
        description: "Hiển thị thông tin hệ thống của bot",
        commandCategory: "Admin",
        usages: "[cpu/ram/all]",
        cooldowns: 5,
        image: []
    },
    run: async ({ api, event, args }) => {
        const startTime = Date.now();

        function getSystemRAMUsage() {
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            const usedMem = totalMem - freeMem;
            return {
                totalMem: Math.round(totalMem / 1024 / 1024),
                usedMem: Math.round(usedMem / 1024 / 1024),
                freeMem: Math.round(freeMem / 1024 / 1024)
            };
        }

        const pingReal = Date.now() - startTime;
        const botStatus = (pingReal < 200) ? 'mượt mà' : (pingReal < 800) ? 'bình thường' : 'lag';

        function getHeapMemoryUsage() {
            const heap = process.memoryUsage();
            return {
                heapTotal: Math.round(heap.heapTotal / 1024 / 1024),
                heapUsed: Math.round(heap.heapUsed / 1024 / 1024),
                external: Math.round(heap.external / 1024 / 1024),
                rss: Math.round(heap.rss / 1024 / 1024)
            };
        }

        async function getDependencyCount() {
            try {
                const packageJsonString = await fs.readFile('package.json', 'utf8');
                const packageJson = JSON.parse(packageJsonString);
                return Object.keys(packageJson.dependencies || {}).length;
            } catch (error) {
                console.error('Không thể đọc file package.json:', error);
                return -1;
            }
        }

        function getFilteredUptime() {
            const uptime = process.uptime();
            const days = Math.floor(uptime / (24 * 60 * 60));
            const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
            const minutes = Math.floor((uptime % (60 * 60)) / 60);
            const seconds = Math.floor(uptime % 60);

            let uptimeString = '';
            if (days > 0) uptimeString += `${days} ngày `;
            if (hours > 0) uptimeString += `${hours} giờ `;
            if (minutes > 0) uptimeString += `${minutes} phút `;
            if (seconds > 0 || uptimeString === '') uptimeString += `${seconds} giây.`;

            return uptimeString.trim();
        }

        async function getCPUUsage() {
            const startMeasure = process.cpuUsage();
            await new Promise(resolve => setTimeout(resolve, 100));
            const endMeasure = process.cpuUsage(startMeasure);
            const userUsage = endMeasure.user / 1000000;
            const systemUsage = endMeasure.system / 1000000;
            return (userUsage + systemUsage).toFixed(1);
        }

        const systemRAM = getSystemRAMUsage();
        const heapMemory = getHeapMemoryUsage();
        const uptimeString = getFilteredUptime();
        const dependencyCount = await getDependencyCount();
        const cpuUsage = await getCPUUsage();

        try {
            const fullInfo = `
⏰ Thời gian hiện tại: ${moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss | DD/MM/YYYY')}
⏱️ Thời gian hoạt động: ${uptimeString}
📝 Tiền tố lệnh mặc định: ${(global.config && global.config.PREFIX) || '/'}
🗂️ Số lượng gói phụ thuộc: ${dependencyCount >= 0 ? dependencyCount : "Không xác định"}
🔣 Trạng thái bot: ${botStatus}
📋 Hệ điều hành: ${os.type()} ${os.release()} (${os.arch()})
💻 CPU: ${os.cpus().length} core(s)
📛 Sử dụng CPU: ${cpuUsage}%
📊 RAM hệ thống: ${systemRAM.usedMem}MB/${systemRAM.totalMem}MB (đã sử dụng)
🧠 Bộ nhớ Heap: ${heapMemory.heapUsed}MB/${heapMemory.heapTotal}MB
📀 RSS: ${heapMemory.rss}MB
🛢️ RAM trống: ${(systemRAM.freeMem / 1024).toFixed(2)}GB
🛜 Ping: ${pingReal}ms
`.trim();

            const cpuInfo = `
💻 Thông tin CPU:
   Số core: ${os.cpus().length}
   Sử dụng: ${cpuUsage}%
`.trim();

            const ramInfo = `
📊 Thông tin RAM:
   Tổng RAM hệ thống: ${systemRAM.totalMem}MB
   RAM đã sử dụng: ${systemRAM.usedMem}MB
   RAM còn trống: ${systemRAM.freeMem}MB
🧠 Bộ nhớ Heap:
   Tổng: ${heapMemory.heapTotal}MB
   Đã dùng: ${heapMemory.heapUsed}MB
   Bên ngoài: ${heapMemory.external}MB
   RSS: ${heapMemory.rss}MB
`.trim();

            let replyMsg = '';
            const command = args[0]?.toLowerCase();

            switch (command) {
                case 'cpu':
                    replyMsg = cpuInfo;
                    break;
                case 'ram':
                    replyMsg = ramInfo;
                    break;
                case 'all':
                default:
                    replyMsg = fullInfo;
            }

            await api.sendMessage({
                body: replyMsg,
attachment: global.vdsp.splice(0, 1)
            }, event.threadID, event.messageID);

        } catch (error) {
            console.error('Lỗi khi lấy thông tin hệ thống:', error.message);
            await api.sendMessage('Đã xảy ra lỗi khi lấy thông tin hệ thống.', event.threadID, event.messageID);
        }
    }
};const os = require('os');
const moment = require('moment-timezone');
const fs = require('fs').promises;
const osu = require('os-utils');

module.exports.config = {
  name: "upt",
  version: "2.0.0",
  hasPermission: 3,
  credits: "VAZTEAM",
  description: "Hiển thị thông tin hệ thống của bot",
  commandCategory: "Admin",
  usages: "upt",
  cooldowns: 5
};

async function getDependencyCount() {
  try {
    const packageJsonString = await fs.readFile('package.json', 'utf8');
    const packageJson = JSON.parse(packageJsonString);
    const depCount = Object.keys(packageJson.dependencies || {}).length;
    const devDepCount = Object.keys(packageJson.devDependencies || {}).length;
    return { depCount, devDepCount };
  } catch (error) {
    console.error('Không thể đọc file package.json:', error);
    return { depCount: -1, devDepCount: -1 };
  }
}

function getStatusByPing(ping) {
  if (ping < 200) {
    return 'tốt';
  } else if (ping < 800) {
    return 'bình thường';
  } else {
    return 'xấu';
  }
}

async function getBotFileSize() {
  try {
    const stats = await fs.stat(__filename);
    const fileSizeInBytes = stats.size;
    const fileSizeInKB = fileSizeInBytes / 1024;
    const fileSizeInMB = fileSizeInKB / 1024;
    return { fileSizeInBytes, fileSizeInKB, fileSizeInMB };
  } catch (error) {
    console.error('Không thể đọc thông tin file bot:', error);
    return { fileSizeInBytes: -1, fileSizeInKB: -1, fileSizeInMB: -1 };
  }
}
async function getCurrentCPUUsage() {
  return new Promise((resolve) => {
    osu.cpuUsage((v) => {
      resolve((v * 100).toFixed(2)); // Chuyển đổi thành phần trăm và làm tròn đến 2 chữ số sau dấu thập phân
    });
  });
}

module.exports.run = async ({ api, event, Users, Threads }) => {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const uptime = process.uptime();

  const { depCount, devDepCount } = await getDependencyCount();
  let name = await Users.getNameUser(event.senderID);
  const botStatus = getStatusByPing(Date.now() - event.timestamp);

  const uptimeHours = Math.floor(uptime / (60 * 60));
  const uptimeMinutes = Math.floor((uptime % (60 * 60)) / 60);
  const uptimeSeconds = Math.floor(uptime % 60);

  const uptimeString = `${uptimeHours} giờ ${uptimeMinutes} phút ${uptimeSeconds} giây`;

  const threadInfo = await Threads.getInfo(event.threadID);
  const memberCount = threadInfo.participantIDs.length;

  // Find an admin in the group
  const admins = threadInfo.adminIDs || [];
  const adminName = admins.length > 0 ? await Users.getNameUser(admins[0]) : "Không có";

  // Get bot file size
  const { fileSizeInBytes, fileSizeInKB, fileSizeInMB } = await getBotFileSize();
  const cpuUsage = await getCurrentCPUUsage();
  // Formatted message including CPU and RAM details
  const replyMsg = `
🕒 Bây giờ là: ${moment().tz('Asia/Ho_Chi_Minh').format('HH:mm:ss')} || ${moment().tz('Asia/Ho_Chi_Minh').format('DD/MM/YYYY')}
⏲️ Thời gian hoạt động: ${uptimeString}
🆕 Prefix mặc định: ${global.config.PREFIX}
📊 Tổng số dependencies: ${depCount}
🔧 Tổng số devDependencies: ${devDepCount}
💬 Số thành viên trong nhóm: ${memberCount}
📊 Tình trạng: ${botStatus}
🖥️ Hệ điều hành: ${os.type()} ${os.release()} (${os.arch()})
💻 CPU: ${os.cpus().length} core(s) - ${os.cpus()[0].model.trim()} @ ${os.cpus()[0].speed}MHz
🔄 CPU Đã Dùng: ${cpuUsage}%
🔋 RAM: ${(usedMemory / 1024 / 1024 / 1024).toFixed(2)}GB/${(totalMemory / 1024 / 1024 / 1024).toFixed(2)}GB (Used/Total)
🆓 Dung lượng trống: ${(freeMemory / 1024 / 1024 / 1024).toFixed(2)}GB
📶 Ping: ${Date.now() - event.timestamp}ms
👤 Yêu cầu bởi: ${name}
  `.trim();

  api.sendMessage({body: replyMsg, attachment: global.krystal.splice(0, 1)}, event.threadID, event.messageID);
};
