const sleep = require('es7-sleep');
const si = require('systeminformation');
const IS_MAC = process.platform === 'darwin';
const IS_WIN = process.platform === 'win32';

// const APP_NAME = process.env.NODE_ENV === 'development' ? 'Electron' : 'Heyka';
const APP_NAME = 'Electron';
const PROCESS_IGNORE = ['system.js', 'chrome_crashpad_handler'];
const KILOBYTE = 1024;

let PARENT_PID;
let PIDS;

process.on('message', data => {
  console.log('Message received', data);
  switch (data.action) {
    case 'pid':
      PARENT_PID = data.pid;
      break;

    case 'pids':
      PIDS = data.data;
      break;

    case 'start':
      init();
      break;
  }
});

async function init() {
  while (true) {
    // eslint-disable-next-line no-magic-numbers
    await sleep(1000);
    await sysInfo();
  }
}

async function sysInfo() {
  const { list } = await si.processes();

  const appProcesses = list
    .filter(({ name, pid, parentPid }) => {
      if (PROCESS_IGNORE.includes(name)) {
        return false;
      }

      return (parentPid === PARENT_PID || pid === PARENT_PID);
    });

  const result = appProcesses.map(proc => {
    const argsKey = IS_WIN ? 'command' : 'params';
    const procArgs = parseParams(proc[argsKey]);
    const winProcess = PIDS.find(p => p.pid === proc.pid);
    let template = '';

    if (winProcess) {
      template = winProcess.template;
    }

    return {
      template,
      type: procArgs.type,
      name: proc.name,
      pid: proc.pid,
      cpu: parseFloat(proc.cpu.toFixed(2)),
      mem: parseFloat((proc.memRss / KILOBYTE).toFixed(2)),
      parentPid: proc.parentPid,
    };
  });

  const computedTotal = appProcesses.reduce((obj, proc) => {
    obj.cpu += proc.cpu;
    obj.mem += proc.memRss;

    return obj;
  }, {
    cpu: 0,
    mem: 0,
  });

  result.push({
    cpu: parseFloat(computedTotal.cpu.toFixed(2)),
    mem: parseFloat((computedTotal.mem / KILOBYTE).toFixed(2)),
  });

  console.log('\n');
  console.table(result);
}

function parseParams(params) {
  const list = params.split(' ');

  // console.log(list);

  return {
    template: getArgv(list, 'template') || '',
    type: getArgv(list, 'type') || '',
    path: getArgv(list, 'app-path') || '',
  };
}

function getArgv(list, arg) {
  const value = list.find(argv => argv.includes(`--${arg}=`));

  if (value) {
    return value.split('=')[1];
  }
}
