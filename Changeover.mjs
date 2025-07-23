/*###################  LOGGING  #########################*/
const VERBOSE = 0;
const INFO = 1;
const WARNING = 2;
const ERROR = 3;

let logFilter = INFO;

// Log-Funktion
function logger(level, message) {
  if (level >= logFilter) {
    let levelStr = "";
    switch (level) {
      case VERBOSE: levelStr = "VERBOSE"; break;
      case INFO: levelStr = "INFO"; break;
      case WARNING: levelStr = "WARNING"; break;
      case ERROR: levelStr = "ERROR"; break;
    }
    print(levelStr+";"+message);
  }
}

/*##################  MODEL  #########################*/
let shelly = { 
  crossed: false,
  load: false,
  input: {
      "0": {
        state:   false
      },
      "1": {
        state: false
      }
  },
  output: {
      "0": {
        state: false,
      },
      "1": {
        state: false,
      }
  }
};

let outputRPC = {
call:[true, true],
done:[false, false]
};

let inputRPC = {
call:[true, true],
done:[false, false]
};

/*##################  EVENT  #########################*/
let _id = "";
let _input = "";
let _isInput = false;
let _isSwitch = false;
let _state;
let _apower = 0.0;
Shelly.addEventHandler(function(event, user_data) {
  function handleToggleEvent(isInput, id, state) {
    if(isInput) { shelly.input[id].state = state; }
    else { shelly.output[id].state = state; }
  }
  function handlePowerUpdateEvent(id, apower) {
    shelly.load = (apower > 0.0);
  }
  logger(VERBOSE, "Event: " + JSON.stringify(event));
  _id = event.component;
  _input = _id.slice(0, _id.indexOf(':'));
  _isInput = _input === "input";
  _isSwitch = !_isInput;
  _id = _id.slice(_id.indexOf(':')+1);
  if (event.info && typeof event.info === "object" && "event" in event.info ) {
    if (event.info.event === "toggle" && "state" in event.info && typeof event.info.state === "boolean") {
      _state = event.info.state;
       handleToggleEvent(_isInput, _id, _state);
    }
    else if (event.info.event === "power_update" && "apower" in event.info && typeof event.info.apower === "number") {
      _apower = event.info.apower;
      handlePowerUpdateEvent(_id, _apower);
    }
    else {
      logger(ERROR, "Unknown event type: " + event.info.event);
      return;
    }
    logger(INFO, _input)
    logger(INFO, _id)
    logger(INFO, _state)

    changeover();
  }
}, null);

/*##################  CHANGEOVER #########################*/
function changeover(){
  logger(WARNING, "     INPUT 0  :  "+shelly.input["1"].state + "     INPUT 1  :  "+shelly.input["0"].state);
  logger(WARNING, "     OUTPUT 0 :  "+shelly.output["1"].state + "     OUTPUT 1 :  "+shelly.output["0"].state);
  updateOutputs();
}

/*##################  UPDATE OUTPUTS  #########################*/
function updateOutputs(){
  if(! shelly.crossed){
    shelly.output["0"].state = shelly.input["0"].state;
    shelly.output["1"].state = shelly.input["1"].state;
  }else{
    shelly.output["0"].state = shelly.input["1"].state;
    shelly.output["1"].state = shelly.input["0"].state;
  }
  writeOutputs();
}

/*##################  WRITE OUTPUTS  #########################*/
function writeOutputs(){
  if(outputRPC.done[0] && outputRPC.done[1]){
    //logger(VERBOSE, "Both Output-RPC-Call done.");
    outputRPC.call[0] = true;
    outputRPC.done[0] = false;
    outputRPC.call[1] = true;
    outputRPC.done[1] = false;
    return true;
  }

  if(outputRPC.call[0]){
    outputRPC.call[0] = false;
    Shelly.call("Switch.Set", {id: 0, on: shelly.output["0"].state}, function(result) {
        if(result){
          outputRPC.done[0] = true;
          logger(VERBOSE, "Output-RPC-Call [0] done.");
        }
    });
  }

  if(outputRPC.call[1]){
    outputRPC.call[1] = false;
    Shelly.call("Switch.Set", {id: 1, on: shelly.output["1"].state}, function(result) {
        if(result){
          outputRPC.done[1] = true;
          logger(VERBOSE, "Output-RPC-Call [1] done.");
        }
    });
  }
  return false;
}

/*##################  READ INPUTS  #########################*/
function readInputs(){
  if(inputRPC.done[0] && inputRPC.done[1]){
    //logger(VERBOSE, "Both Input-RPC-Call done.");
    inputRPC.call[0] = true;
    inputRPC.done[0] = false;
    inputRPC.call[1] = true;
    inputRPC.done[1] = false;
    return true;
  }

  if(inputRPC.call[0]){
    inputRPC.call[0] = false;
    Shelly.call("Input.GetStatus", {id: 0}, function(result) {
        if(result){
          inputRPC.done[0] = true;
          if(result.state === null){
            result.state = false;
          }
          shelly.input["0"].state = result.state;
          logger(VERBOSE, "Input-RPC-Call [0] done.");
        }
    });
  }

  if(inputRPC.call[1]){
    inputRPC.call[1] = false;
    Shelly.call("Input.GetStatus", {id: 1}, function(result) {
        if(result){
          inputRPC.done[1] = true;
          if(result.state === null){
            result.state = false;
          }
          shelly.input["1"].state = result.state;
          logger(VERBOSE, "Input-RPC-Call [1] done.");
        }
    });
  }

  return false;
}

/*##################  GET STATUS  #########################*/
function getStatus(){
  if(inputRPC.done[0] && inputRPC.done[1]){
    //logger(VERBOSE, "Both Input-RPC-Call done.");
    inputRPC.call[0] = true;
    inputRPC.done[0] = false;
    inputRPC.call[1] = true;
    inputRPC.done[1] = false;
    return true;
  }

  if(inputRPC.call[0]){
    inputRPC.call[0] = false;
    Shelly.call("Input.GetStatus", {id: 0}, function(result) {
        if(result){
          inputRPC.done[0] = true;
          if(result.state === null){
            result.state = false;
          }
          shelly.input["0"].state = result.state;
          logger(VERBOSE, "Input-RPC-Call [0] done.");
        }
    });
  }

  if(inputRPC.call[1]){
    inputRPC.call[1] = false;
    Shelly.call("Input.GetStatus", {id: 1}, function(result) {
        if(result){
          inputRPC.done[1] = true;
          if(result.state === null){
            result.state = false;
          }
          shelly.input["1"].state = result.state;
          logger(VERBOSE, "Input-RPC-Call [1] done.");
        }
    });
  }

  return false;
}

/*##################  INIT SHELLY  #########################*/
function initShelly() {

  Shelly.call("Switch.SetConfig", {
  id: 0,
  config: {
    id: 0,
    name: "Switch 0",
    in_mode: "detached",
    initial_state: "off",
    in_locked: false,
    auto_on: false,
    auto_on_delay: 60,
    auto_off: false,
    auto_off_delay: 60,
    autorecover_voltage_errors: false,
    power_limit: 4480,
    voltage_limit: 280,
    undervoltage_limit: 0,
    current_limit: 16
  },
  });   

  Shelly.call("Switch.SetConfig", {
    id: 1,
  config: {
    id: 1,
    name: "Switch 1",
    in_mode: "detached",
    initial_state: "off",
    in_locked: false,
    auto_on: false,
    auto_on_delay: 60,
    auto_off: false,
    auto_off_delay: 60,
    autorecover_voltage_errors: false,
    power_limit: 4480,
    voltage_limit: 280,
    undervoltage_limit: 0,
    current_limit: 16
  },
  });   

  // switch both outputs on
  shelly.input["0"].state = true;
  shelly.input["1"].state = true;
  changeover
}
/*##################  INIT SHELLY  #########################*/
initShelly();
