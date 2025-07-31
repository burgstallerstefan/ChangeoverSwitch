import { EventEmitter } from 'events';

class ShellyMock extends EventEmitter {
  constructor() {
    super();
    this.output = { "0": { state: false }, "1": { state: false } };
    this.input = { "0": { state: false }, "1": { state: false } };
  }

  call(method, params, callback) {
    switch (method) {
      case 'Switch.Set':
        this.output[String(params.id)].state = params.on;
        callback && callback(true);
        break;
      case 'Switch.SetConfig':
        callback && callback(true);
        break;
      default:
        callback && callback(true);
        break;
    }
  }

  addEventHandler(cb, userdata) {
    this.on('event', (event) => cb(event, userdata));
  }

  addStatusHandler(cb, userdata) {
    this.on('status', (event) => cb(event, userdata));
  }

  toggleInput(id, state) {
    this.emit('event', { component: `input:${id}`, info: { event: 'toggle', state } });
  }

  toggleSwitch(id, state) {
    this.emit('event', { component: `switch:${id}`, info: { event: 'toggle', state } });
  }

  powerUpdate(id, apower) {
    this.emit('event', { component: `switch:${id}`, info: { event: 'power_update', apower } });
  }
}

export default ShellyMock;
