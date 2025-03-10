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

let inputCnt = 0;
let switchOut = false;
let initialized = false;

print("Hello World");

/*##################  EVENT  #########################*/
let _id = "";
let _input = "";
let _isInput = false;
let _state = false;
Shelly.addEventHandler(function(event, user_data) { // synchronize model
    _id = event.component;
    _input = _id.slice(0, _id.indexOf(':'));
    _isInput = _input === "input";
    _id = _id.slice(_id.indexOf(':')+1);
    _state = event.info.state;
    
    if(_state === undefined) return;
    
    print("")
    print(_input)
    print(_id)
    print(_state)

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
    
}, null);

/*##################  READ CONSUMPTION  #########################*/
function setConsumption(){
 if(consumptionRPC.done[0] && consumptionRPC.done[1]){
    //print("Both Consumption-RPC-Call done.");
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
              //print("Consumption-RPC-Call [0] done.");
          }
    });
   }
    
   if(consumptionRPC.call[1]){
    consumptionRPC.call[1] = false;
    Shelly.call("Switch.GetStatus", { id: 1 }, function(result) {
        if (result) {
            shelly.output["1"].apower = result.apower;
            consumptionRPC.done[1] = true;
            //print("Consumption-RPC-Call [1] done.");
        }
    });
   }
   return false;
}

/*##################  ALEXA LOGIC  #########################*/
function alexaOn(){
    print("")
    print("Alexa switched both on");
    // and was off
    if((!shelly.output["0"].apower) && (!shelly.output["1"].apower)){
      print("Was off.")
      shelly.crossed = !shelly.crossed;
    }else{
      print("Was on.")
    }
}

function alexaOff(){
    print("")
    print("Alexa switched both off");
    // and was on
    if(shelly.output["0"].apower || shelly.output["1"].apower){
      print("Was on.");
      shelly.crossed = !shelly.crossed;
    }else{
      print("Was off.")
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
    //print("Both Output-RPC-Call done.");
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
          print("Output-RPC-Call [0] done.");
        }
    });
  }
  
  if(outputRPC.call[1]){
    outputRPC.call[1] = false;
    Shelly.call("Switch.Set", {id: 1, on: shelly.output["1"].state}, function(result) {
        if(result){
          outputRPC.done[1] = true;
          print("Output-RPC-Call [1] done.");
        }
    });
  }
  return false;
}

function readInputs(){
  if(inputRPC.done[0] && inputRPC.done[1]){
    //print("Both Input-RPC-Call done.");
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
          print("Input-RPC-Call [0] done.");
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
          print("Input-RPC-Call [1] done.");
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
        print("Read Inputs successful.")
        setOutputs();
        print("Set Outputs successful.")
    }
  }else{
    if(!doneOut){
      doneOut = switchOutputs();
    }else{
      if(waitCnt < 10){
        waitCnt ++;
      }else{
        if(!doneCons){
          doneCons = setConsumption();
        }else{
          if(shelly.output["0"].apower || shelly.output["1"].apower){
            print("  Init light was on.");
            shelly.crossed = !shelly.crossed;
            setOutputs();
            switchOut = true;
          }else{
            print("  Init light was off.");
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
      print("Initialization successful.");
    }
  }else{
    setConsumption();
    if(switchOut){
      switchOut = !switchOutputs();
    }
  }
}

Timer.set(10, true, cyclic);

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
