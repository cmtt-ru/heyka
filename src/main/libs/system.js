const sleep = require('es7-sleep');
const si = require('systeminformation');
const IS_MAC = process.platform === 'darwin';
const IS_WIN = process.platform === 'win32';

// const APP_NAME = process.env.NODE_ENV === 'development' ? 'Electron' : 'Heyka';
const APP_NAME = 'Electron';
const PARENT_PID = 43452;

process.on('message', (msg) => {
  console.log('Message from parent:', msg);
});

init();

async function init() {
  while (true) {
    // eslint-disable-next-line no-magic-numbers
    await sleep(1000);
    await sysInfo();
  }
}

async function sysInfo() {
  const processIgnore = ['system.js', 'chrome_crashpad_handler'];

  /** todo: Check for count */
  let processesPids = await si.processLoad(APP_NAME);

  processesPids = processesPids[0].pids;

  const { list } = await si.processes();

  const appProcesses = list
    .filter(({ pid, name }) => processesPids.includes(pid) && !processIgnore.includes(name));

  const result = appProcesses.map(proc => {
    const argsKey = IS_WIN ? 'command' : 'params';
    const procArgs = parseParams(proc[argsKey]);

    return {
      template: procArgs.template,
      type: procArgs.type,
      path: procArgs.path,
      name: proc.name,
      pid: proc.pid,
      cpu: proc.cpu,
      mem: proc.memRss,
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

  const b = 1024;

  result.push({
    cpu: parseFloat(computedTotal.cpu.toFixed(2)),
    mem: parseFloat((computedTotal.mem / b).toFixed(2)),
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
