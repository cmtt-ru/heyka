/* eslint-disable require-jsdoc */
const fs = require('fs');
const path = require('path');
const sleep = require('es7-sleep');
const si = require('systeminformation');
const MACalculator = require('./MACalculator');

const IS_MAC = process.platform === 'darwin';
const IS_WIN = process.platform === 'win32';

const PROCESS_IGNORE = ['worker.js', 'chrome_crashpad_handler', 'System Idle Process'];
const ARGS_KEY = IS_WIN ? 'command' : 'params';

let parrentPid = 63907;
let processPids = [
  {
    template: 'main',
    pid: 63920,
  },
  {
    template: 'overlay',
    pid: 65507,
  },
  {
    template: 'push',
    pid: 64003,
  },
];
let logPath = null;
let jsonStream = null;
let sleepTimeout = 1000;

const ma = new MACalculator({
  length: 1,
});

ma.on('update', data => {
  const jsonPath = path.join(logPath, 'utilization.json');

  const wrappedData = {
    timestamp: new Date().toString(),
    data: data,
  };

  process.send({
    action: 'processes',
    data: wrappedData,
  });

  if (!fs.existsSync(jsonPath) && jsonStream) {
    jsonStream.end();
    jsonStream = null;
  }

  if (jsonStream === null) {
    jsonStream = fs.createWriteStream(jsonPath, { flags: 'a' });
  }

  jsonStream.write(JSON.stringify(wrappedData) + ',\n');
});

/** Listen messages from parent process */
process.on('message', data => {
  console.log('Worker --> message received', data);
  switch (data.action) {
    case 'parent-pid':
      parrentPid = data.pid;
      break;

    case 'process-pids':
      processPids = data.data;
      break;

    case 'log-path':
      logPath = data.path;
      break;

    case 'sleep-timeout':
      sleepTimeout = data.timeout;
      break;

    case 'start':
      init();
      break;
  }
});

async function init() {
  while (true) {
    await sleep(sleepTimeout);
    await sysInfo();
  }
}

async function sysInfo() {
  const { list } = await si.processes();

  const processes = list.filter(proc => {
    if (IS_WIN) {
      if (PROCESS_IGNORE.includes(proc.command)) {
        return false;
      }
    } else {
      if (PROCESS_IGNORE.includes(proc.name)) {
        return false;
      }
    }

    return true;
  });

  const appProcesses = processes.filter(proc => {
    return (proc.parentPid === parrentPid || proc.pid === parrentPid);
  });

  const backgroundProcesses = processes.filter(proc => {
    return (proc.parentPid !== parrentPid && proc.pid !== parrentPid);
  });

  const bgTotal = backgroundProcesses.reduce((obj, proc) => {
    obj.cpu += proc.cpu;
    obj.mem += proc.memRss;

    return obj;
  }, {
    cpu: 0,
    mem: 0,
  });

  const result = appProcesses.map(proc => {
    const processType = getArgv(proc[ARGS_KEY], 'type') || '';
    const processSubType = getArgv(proc[ARGS_KEY], 'utility-sub-type') || '';
    // const processRenderId = getArgv(proc[ARGS_KEY], 'renderer-client-id') || '';
    const winProcess = processPids.find(p => p.pid === proc.pid);
    let template = '';

    if (winProcess) {
      template = winProcess.template;
    }

    return {
      template,
      type: processType,
      subType: processSubType,
      name: proc.name,
      pid: proc.pid,
      cpu: proc.cpu,
      mem: proc.memRss,
      // parentPid: proc.parentPid,
      // renderId: processRenderId,
    };
  });

  result.push({
    pid: 'bg',
    cpu: bgTotal.cpu,
    mem: bgTotal.mem,
  });

  ma.add(result);

  // console.log('\n');
  // console.table(result);
}

function getArgv(args, arg) {
  const value = args.split(' ').find(argv => argv.includes(`--${arg}=`));

  if (value) {
    return value.split('=')[1];
  }
}
