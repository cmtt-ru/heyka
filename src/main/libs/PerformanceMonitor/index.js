import WindowManager from '../../../shared/WindowManager/WindowManagerMain';
import { getLogPath } from '../../classes/LogManager';
import { fork } from 'child_process';
import { EventEmitter } from 'events';

let worker = null;

class PerformanceMonitor extends EventEmitter {
  setSleepTimeout(timeout) {
    worker.send({
      action: 'sleep-timeout',
      timeout,
    });
  }

  start() {
    if (worker) {
      console.log('PerformanceMonitor --> worker is already running');

      return;
    }

    /** Run worker in another thread */
    worker = fork('src/main/libs/PerformanceMonitor/worker.js');

    /** Listen for messages from worker */
    worker.on('message', data => {
      console.log('PerformanceMonitor --> message from worker', data);
    });

    /** Send pid of main process to worker */
    worker.send({
      action: 'parent-pid',
      pid: process.pid,
    });

    /** Send pid for all opened windows to worker */
    worker.send({
      action: 'process-pids',
      data: WindowManager.getProcesses(),
    });

    /** Send log path to worker */
    worker.send({
      action: 'log-path',
      path: getLogPath(),
    });

    /** Send sleep timeout between iterations to worker */
    worker.send({
      action: 'sleep-timeout',
      timeout: 2000,
    });

    /** Start worker */
    worker.send({
      action: 'start',
    });

    /** Listen for window processes update */
    WindowManager.on('processes-update', data => {
      if (!worker.killed) {
        worker.send({
          action: 'process-pids',
          data,
        });
      }
    });
  }

  stop() {
    if (worker) {
      WindowManager.removeAllListeners('processes-update');
      worker.removeAllListeners('message');
      worker.kill();
      worker = null;
    }
  }
}

export default new PerformanceMonitor();
