const assert = require('assert');
const { shelly, setOutputs } = require('../setOutputs');

function resetModel(){
  shelly.crossed = false;
  shelly.input['0'].state = false;
  shelly.input['1'].state = false;
  shelly.output['0'].state = false;
  shelly.output['1'].state = false;
}

function test_not_crossed(){
  resetModel();
  shelly.crossed = false;
  shelly.input['0'].state = true;
  shelly.input['1'].state = false;
  setOutputs();
  assert.strictEqual(shelly.output['0'].state, shelly.input['0'].state, 'output[0] should follow input[0]');
  assert.strictEqual(shelly.output['1'].state, shelly.input['1'].state, 'output[1] should follow input[1]');
}

function test_crossed(){
  resetModel();
  shelly.crossed = true;
  shelly.input['0'].state = true;
  shelly.input['1'].state = false;
  setOutputs();
  assert.strictEqual(shelly.output['0'].state, shelly.input['1'].state, 'output[0] should follow input[1]');
  assert.strictEqual(shelly.output['1'].state, shelly.input['0'].state, 'output[1] should follow input[0]');
}

function run(){
  test_not_crossed();
  test_crossed();
  console.log('All tests passed');
}

run();
