import ShellyMock from './mock/shelly.js';

// Expose global helpers expected by the Shelly script
global.print = (...args) => console.log(...args);

global.Timer = {
  set: (ms, repeat, cb) => repeat ? setInterval(cb, ms) : setTimeout(cb, ms),
};

// Create and expose the mock Shelly device
const mock = new ShellyMock();
global.Shelly = mock;

// Load the changeover script (registers event handlers and timers)
await import('./Changeover.mjs');

// Example scenario demonstrating the mocked device
setTimeout(() => {
  // simulate toggling input 0
  mock.toggleInput(0, true);
  // simulate a power usage report
  mock.powerUpdate(0, 40);

  // after a short time exit the test
  setTimeout(() => process.exit(0), 100);
}, 20);
