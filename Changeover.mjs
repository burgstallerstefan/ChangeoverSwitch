/*##################  EVENT PIPELINE #########################*/
let eventPipeline = []; // Array für Events
let eventPipelineStart = 0; // Startindex der Warteschlange

// Funktion zum Hinzufügen eines Events zur Warteschlange
function addEventToPipeline(event) {
  eventPipeline[eventPipeline.length] = event; // Füge das Event am Ende hinzu
}

// Funktion zum Entfernen des ersten Events aus der Warteschlange
function getNextEventFromPipeline() {
  if (eventPipelineStart < eventPipeline.length) {
    let event = eventPipeline[eventPipelineStart]; // Hole das erste Event
    eventPipelineStart++; // Erhöhe den Startindex
    return event;
  }else {
    eventPipelineStart = 0; // Setze den Startindex zurück
    eventPipeline = []; // Leere die Warteschlange
  }
  return null; // Keine Events mehr in der Warteschlange & reset start index       
}

/*###################  LOGGING  #########################*/
const VERBOSE = 0;
const INFO = 1;
const WARNING = 2;
const ERROR = 3;

let logFilter = INFO;

// Log-Funktion
function console(level, message) {
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
        apower: 0.0
      },
      "1": {
        state: false,
        apower: 0.0
      }
  }
};

/*##################  RPC  #########################*/
let consumptionRPC = {
call:[true, true],
done:[false, false]
};

let outputRPC = {
call:[true, true],
done:[false, false]
};

let inputRPC = {
call:[true, true],
done:[false, false]
};

/*##################  GLOBAL VARS  #########################*/
let inputCnt = 0;
let switchOut = false;
let getConsumpt = false;
let initialized = false;
let cyclicTime = 10; // ms
let exeEventPipe = false;

console(VERBOSE, "Hello World");

/*##################  waitInCyclicMs  #########################*/

function waitInCyclicMs(timeout){
  count = timeout / cyclicTime;
  if(count < 1){
    count = 1;
  }
  return count;
}
  
/*##################  EVENT  #########################*/
let _id = "";
let _input = "";
let _isInput = false;
let _state = false;
Shelly.addEventHandler(function(event, user_data) { // synchronize model
  getConsumpt = true;
  addEventToPipeline(event);
}, null);

function eventHandler(event){
  _id = event.component;
  _input = _id.slice(0, _id.indexOf(':'));
  _isInput = _input === "input";
  _id = _id.slice(_id.indexOf(':')+1);
  _state = event.info.state;
  
  // Get switch state in task section
  console(INFO, "AddEventHandler");
  console(INFO, _input)
  console(INFO, _id)
  console(INFO, _state)
  console(INFO, "GetConsumpt to true.");

  if(_state === undefined)return;

  if(_isInput){
      shelly.input[_id].state = _state;
      inputCnt ++;
  }else{
      shelly.output[_id].state = _state;
  }
  
  if(shelly.output["0"].state && shelly.output["1"].state) { // alexa on
    alexaOn();
    setOutputs();
  }
  
  if((!shelly.output["0"].state) && (!shelly.output["1"].state)) { // alexa off
    alexaOff();
    setOutputs();
  }
  
  if(inputCnt>1){ // both input states received
    inputCnt = 0;
    setOutputs();
  }
}

// Funktion zur Verarbeitung der Events in der Warteschlange
function executeEventPipeline() {
// async function executeEventPipeline() {  
  let event = getNextEventFromPipeline();
  if (event) {
    eventHandler(event);
    return false;
  }
  return true; // keine Events mehr in der Warteschlange
}

/*##################  READ CONSUMPTION  #########################*/
function getConsumption(){
if(consumptionRPC.done[0] && consumptionRPC.done[1]){
  //console(VERBOSE, "Both Consumption-RPC-Call done.");
  consumptionRPC.call[0] = true;
  consumptionRPC.call[1] = true;
  consumptionRPC.done[0] = false;
  consumptionRPC.done[1] = false;
  return true;
}

if(consumptionRPC.call[0]){
  consumptionRPC.call[0] = false;
  Shelly.call("Switch.GetStatus", { id: 0 }, function(result) {
        if (result) {
            shelly.output["0"].apower = result.apower;
            consumptionRPC.done[0] = true;
            //console(VERBOSE, "Consumption-RPC-Call [0] done.");
        }
  });
 }
  
 if(consumptionRPC.call[1]){
  consumptionRPC.call[1] = false;
  Shelly.call("Switch.GetStatus", { id: 1 }, function(result) {
      if (result) {
          shelly.output["1"].apower = result.apower;
          consumptionRPC.done[1] = true;
          //console(VERBOSE, "Consumption-RPC-Call [1] done.");
      }
  });
 }
 return false;
}

/*##################  ALEXA LOGIC  #########################*/
function alexaOn(){
  console(VERBOSE, "")
  console(VERBOSE, "Alexa switched both on");
  // and was off
  if((!shelly.output["0"].apower) && (!shelly.output["1"].apower)){
    console(VERBOSE, "Was off.")
    shelly.crossed = !shelly.crossed;
  }else{
    console(VERBOSE, "Was on.")
  }
}

function alexaOff(){
  console(VERBOSE, "")
  console(VERBOSE, "Alexa switched both off");
  // and was on
  if(shelly.output["0"].apower || shelly.output["1"].apower){
    console(VERBOSE, "Was on.");
    shelly.crossed = !shelly.crossed;
  }else{
    console(VERBOSE, "Was off.")
  }
}

/*##################  SET OUTPUTS  #########################*/
function setOutputs(){

if(! shelly.crossed){
  shelly.output["0"].state = shelly.input["0"].state;
  shelly.output["1"].state = shelly.input["1"].state;
}else{
  shelly.output["0"].state = shelly.input["1"].state;
  shelly.output["1"].state = shelly.input["0"].state;
}

switchOut = true;
}

/*##################  Switch OUTPUTS  #########################*/
function switchOutputs(){

if(outputRPC.done[0] && outputRPC.done[1]){
  //console(VERBOSE, "Both Output-RPC-Call done.");
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
        console(VERBOSE, "Output-RPC-Call [0] done.");
      }
  });
}

if(outputRPC.call[1]){
  outputRPC.call[1] = false;
  Shelly.call("Switch.Set", {id: 1, on: shelly.output["1"].state}, function(result) {
      if(result){
        outputRPC.done[1] = true;
        console(VERBOSE, "Output-RPC-Call [1] done.");
      }
  });
}
return false;
}

function readInputs(){
if(inputRPC.done[0] && inputRPC.done[1]){
  //console(VERBOSE, "Both Input-RPC-Call done.");
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
        console(VERBOSE, "Input-RPC-Call [0] done.");
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
        console(VERBOSE, "Input-RPC-Call [1] done.");
      }
   });
}

return false;
}

/*##################  INITIALIZATION  #########################*/
let doneIn = false;
let doneOut = false;
let waitCnt = 0;
let doneCons = false;
function init(){
if(!doneIn){
  doneIn = readInputs();
  if(doneIn){
      console(VERBOSE, "Read Inputs successful.")
      setOutputs();
      console(VERBOSE, "Set Outputs successful.")
  }
}else{
  if(!doneOut){
    doneOut = switchOutputs();
  }else{
    if(waitCnt < waitInCyclicMs(1000)){ // wait 1000ms
      waitCnt ++;
    }else{
      if(!doneCons){
        doneCons = getConsumption();
      }else{
        if(shelly.output["0"].apower || shelly.output["1"].apower){
          console(VERBOSE, "  Init light was on.");
          shelly.crossed = !shelly.crossed;
          setOutputs();
          switchOut = true;
        }else{
          console(VERBOSE, "  Init light was off.");
        }
        return true;
      }
    }
  }
}
return false;
}

/*##################  CYCLIC  #########################*/
function cyclic(){
if(!initialized){
  initialized = init();    
  if(initialized){
    console(INFO, "Initialization successful.");
  }
}else{
  if(getConsumpt){
    getConsumpt = !getConsumption();
    if(!getConsumpt){
      console(INFO, "GetConsumption successful.");
      exeEventPipe = true;
    }
  }
  if(exeEventPipe){
    exeEventPipe = !executeEventPipeline();
    if(!exeEventPipe){
      console(INFO, "ExecuteEventPipeline successful.");
    }
  }
  if(switchOut){
    switchOut = !switchOutputs();
  }
}
}

Timer.set(cyclicTime, true, cyclic);

Shelly.call("Switch.SetConfig", {
id: 0,
config: {
  in_mode: "detached",
},
});

Shelly.call("Switch.SetConfig", {
id: 1,
config: {
  in_mode: "detached",
},
});
