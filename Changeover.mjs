/*##################  MODEL  #########################*/
let shelly = { 
    crossed: false,
    input: {
        "0": {
          state:   true
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
  call:[false, false],
  done:[true, true]
};

let outputRPC = {
  call:[false, false],
  done:[true, true]
};

print("Hello World");

/*##################  EVENT  #########################*/
Shelly.addEventHandler(function(event, user_data) { // synchronize model
    let _id = event.component;
    let _input = _id.slice(0, _id.indexOf(':'));
    let _isInput = _input === "input";
    _id = _id.slice(_id.indexOf(':')+1);
    let _state = event.info.state;
    
    if(_state === undefined) return;
    
    print("")
    print(_input)
    print(_id)
    print(_state)

    if(_isInput){
        shelly.input[_id].state = _state;
    }else{
        shelly.output[_id].state = _state;
    }
}, null);

/*##################  READ CONSUMPTION  #########################*/
function setConsumption(){
 
 if(consumptionRPC.done[0] && consumptionRPC.done[1]){
    print("Both Consumption-RPC-Call done.");
    consumptionRPC.call[0] = true;
    consumptionRPC.call[1] = true;
    consumptionRPC.done[0] = false;
    consumptionRPC.done[1] = false;
  }
  
  if(consumptionRPC.call[0]){
    consumptionRPC.call[0] = false;
    Shelly.call("Switch.GetStatus", { id: 0 }, function(result) {
          if (result) {
              shelly.output["0"].apower = result.apower;
              consumptionRPC.done[0] = true;
              print("Consumption-RPC-Call [0] done.");
          }
    });
   }
    
   if(consumptionRPC.call[1]){
    consumptionRPC.call[1] = false;
    Shelly.call("Switch.GetStatus", { id: 1 }, function(result) {
        if (result) {
            shelly.output["1"].apower = result.apower;
            consumptionRPC.done[1] = true;
            print("Consumption-RPC-Call [1] done.");
        }
    });
   }
}

/*##################  ALEXA LOGIC  #########################*/
function main(){

    // Alexa switched both off
    if((!shelly.output["0"].state) && (!shelly.output["1"].state)){
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
    
    if(shelly.output["0"].state && shelly.output["1"].state){
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
    
    if(! shelly.crossed){
      shelly.output["0"].state = shelly.input["0"].state;
      shelly.output["1"].state = shelly.input["1"].state;
    }else{
      shelly.output["0"].state = shelly.input["1"].state;
      shelly.output["1"].state = shelly.input["0"].state;
    }
}

/*##################  SET OUTPUTS  #########################*/
function setOutputs(){
  if(outputRPC.done[0] && outputRPC.done[1]){
    print("Both Output-RPC-Call done.");
    outputRPC.call[0] = true;
    outputRPC.call[1] = true;
    outputRPC.done[0] = false;
    outputRPC.done[1] = false;
  }

  if(outputRPC.call[0]){
    outputRPC.call[0] = false;
    Shelly.call("Switch.Set", {id: 0, on: shelly.output["0"].state}, function(result) {
        if(result){
          outputRPC.done[0] = true;
          print("Output-RPC-Call [1] done.");
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
}

function cyclic(){
    setConsumption();
    main();
    setOutputs();
}

Timer.set(100, true, cyclic);
