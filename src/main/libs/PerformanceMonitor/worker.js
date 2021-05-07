/* eslint-disable require-jsdoc */
const sleep = require('es7-sleep');
const si = require('systeminformation');
const MACalculator = require('./MACalculator');

const IS_MAC = process.platform === 'darwin';
const IS_WIN = process.platform === 'win32';

const PROCESS_IGNORE = ['worker.js', 'chrome_crashpad_handler'];
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
let sleepTimeout = 1000;

const ma = new MACalculator({
  length: 1,
});

ma.on('update', data => {
  process.send({
    action: 'processes',
    data,
  });
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

init();

async function init() {
  while (true) {
    // eslint-disable-next-line no-magic-numbers
    await sleep(sleepTimeout);
    await sysInfo();
  }
}

async function sysInfo() {
  const { list } = await si.processes();

  const appProcesses = list
    .filter(proc => {
      if (PROCESS_IGNORE.includes(proc.name)) {
        return false;
      }

      return (proc.parentPid === parrentPid || proc.pid === parrentPid);
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
      // renderId: processRenderId,
      pid: proc.pid,
      // parentPid: proc.parentPid,
      cpu: proc.cpu,
      mem: proc.memRss,
    };
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
