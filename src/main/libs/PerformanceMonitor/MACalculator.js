const { EventEmitter } = require('events');

class MACalculator extends EventEmitter {
  constructor({ length }) {
    super();
    this.maLength = length;
    this.dataSet = [];
    this.dataSetLength = 0;
    this.counter = 1;
    this.computed = null;
  }

  add(item) {
    this.dataSet.push(item);
    this.dataSetLength = this.dataSet.length;
    this.dataSet = this.dataSet.slice(-this.maLength);

    if (this.counter === this.maLength) {
      this.counter = 1;
      this.calc();
    } else {
      this.counter++;
    }
  }

  calc() {
    const data = {};

    this.dataSet.forEach(item => {
      item.forEach(proc => {
        if (data[proc.pid] === undefined) {
          data[proc.pid] = {};
          data[proc.pid].source = proc;
          data[proc.pid].cpu = [];
          data[proc.pid].mem = [];
        }

        data[proc.pid].cpu.push(proc.cpu);
        data[proc.pid].mem.push(proc.mem);
      });
    });

    const calculated = Object.keys(data).map(key => {
      const item = data[key];

      return {
        ...item.source,
        cpu: avg(item.cpu),
        mem: avg(item.mem),
      };
    });

    const computedTotal = calculated.reduce((obj, proc) => {
      obj.cpu += proc.cpu;
      obj.mem += proc.mem;

      return obj;
    }, {
      cpu: 0,
      mem: 0,
    });

    calculated.push({
      cpu: computedTotal.cpu,
      mem: computedTotal.mem,
    });

    this.emit('update', calculated);

    // console.table(calculated);
  }
}

function avg(arr) {
  return arr.reduce((result, value) => result + value, 0) / arr.length;
}

module.exports = MACalculator;
