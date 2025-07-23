let cyclicTime = 10; // ms

/*##################  EVENT PIPELINE #########################*/
let eventPipeline = []; // Array für Events
let eventPipelineStart = 0; // Startindex der Warteschlange
let exeEventPipe = false;

function addEventToPipeline(event) {
  eventPipeline[eventPipeline.length] = event;
}

function getNextEventFromPipeline() {
  if (eventPipelineStart < eventPipeline.length) {
    let event = eventPipeline[eventPipelineStart]; 
    eventPipelineStart++;
    return event;
  }else {
    eventPipelineStart = 0; 
    eventPipeline = []; 
  }
  return null;      
}

function executeEventPipeline() {
  let event = getNextEventFromPipeline();
  if (event) {
    handler(event);
    return false;
  }
  return true; // keine Events mehr in der Warteschlange
}

/*###################  LOGGING  #########################*/
const EXCEPTION = -1;
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
  load: true,
  input: {
      "0": {
        state: false
      },
      "1": {
        state: false
      }
  },
  output: {
      "0": {
        state: false
      },
      "1": {
        state: false
      }
  }
};

let prevShelly = JSON.parse(JSON.stringify(shelly));

function model_OutputChanged(){
  return prevShelly.output !== shelly.output;
}

function model_InputChanged(){
  return prevShelly.input !== shelly.input;
}

function model_LoadChanged(){
  return prevShelly.load !== shelly.load;
}

function model_IsLoad(){
  return shelly.load;
}

function model_IsCrossed(){
  return shelly.crossed;
}

function model_ToggleCrossed(){
  shelly.crossed = !shelly.crossed;
}

function model_bothOutputs(state){ 
  return (shelly.output["0"].state === state && shelly.output["1"].state === state);
}

function model_bothInputs(state){
  return (shelly.input["0"].state === state && shelly.input["1"].state === state);
} 

function model_SetOutputs(){
  // No intermediate states allowed
  if(!model_bothInputs(false) && !model_bothInputs(true)){
    if(! model_IsCrossed()){
      shelly.output["0"].state = shelly.input["0"].state;
      shelly.output["1"].state = shelly.input["1"].state;
    }else{
      shelly.output["0"].state = shelly.input["1"].state;
      shelly.output["1"].state = shelly.input["0"].state;
    }
  }
}

/*##################  RPC CALLS  #########################*/
let outputRPC = {
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

function handler(event){
  function handleToggleEvent(isInput, id, state) {
    if(isInput) { shelly.input[id].state = state; }
    else { shelly.output[id].state = state; }
  }
  function handlePowerUpdateEvent(id, apower) {
    shelly.load = (apower > 0.0);
  }

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
    logger(INFO, "Event handled: " + _input + ":" + _id + " - State: " + _state);

    changeover();
  }
}

Shelly.addEventHandler(function(event, _) {
  logger(INFO, "Event received: " + JSON.stringify(event));
  addEventToPipeline(event);
}, null);
Shelly.addStatusHandler(function(event, _) {
  /*logger(INFO, "Status received: " + JSON.stringify(event));
  addEventToPipeline(event);*/
}, null);


/*################## CHANGEOVER  #########################*/
function changeover(){
  logger(WARNING, "     INPUT 0  :  "+shelly.input["1"].state + "     INPUT 1  :  "+shelly.input["0"].state);
  logger(WARNING, "     OUTPUT 0 :  "+shelly.output["1"].state + "     OUTPUT 1 :  "+shelly.output["0"].state);
  logger(WARNING, "              LOAD      :  "+model_IsLoad());
  
  // Startup
  if(model_bothInputs(false) && model_bothOutputs(true)){
    logger(INFO, "!TODO!");
  }

  // Alexa logic
  if(model_LoadChanged() && model_OutputChanged()){
    model_ToggleCrossed();
  }
  

  model_SetOutputs();
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

/*##################  INIT SHELLY  #########################*/
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

function cyclic(){
  exeEventPipe = !executeEventPipeline();
  if(!exeEventPipe){
    logger(VERBOSE, "ExecuteEventPipeline successful.");
  }
}


Timer.set(cyclicTime, true, cyclic);
