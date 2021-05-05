const sleep = require('es7-sleep');
const si = require('systeminformation');

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
  /** todo: App name depends on environment */
  const processName = 'Electron';
  const processIgnore = ['system.js', 'chrome_crashpad_handler'];

  /** todo: Check for count */
  let processesPids = await si.processLoad(processName);

  processesPids = processesPids[0].pids;

  const { list } = await si.processes();

  const appProcesses = list
    .filter(({ pid, name }) => processesPids.includes(pid) && !processIgnore.includes(name));

  const result = {};

  appProcesses.forEach(proc => {
    const name = `${getTemplateFromParams(proc.params)}:${proc.name}:${proc.pid}`;
    // const name = `${proc.pid}:${proc.name}`;

    /** Save key for result */
    result[name] = {
      pid: proc.pid,
      cpu: proc.cpu,
      mem: proc.memRss,
    };
  });

  const cpuTotal = appProcesses.reduce((sum, proc) => {
    return sum + proc.cpu;
  }, 0);

  const memTotal = appProcesses.reduce((sum, proc) => {
    return sum + proc.memRss;
  }, 0);

  const b = 1024;

  result['total'] = {
    pid: 0,
    cpu: parseFloat(cpuTotal.toFixed(2)),
    mem: parseFloat((memTotal / b).toFixed(2)),
  };

  console.log('\n');
  console.table(result);
}

function getTemplateFromParams(params) {
  const template = params.split(' ').find(argv => argv.includes('--template='));

  if (template) {
    return template.split('=')[1];
  } else {
    return 'unknown';
  }
}
