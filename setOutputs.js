const shelly = {
  crossed: false,
  input: {"0": {state: false}, "1": {state: false}},
  output: {"0": {state: false}, "1": {state: false}}
};

let switchOut = false;

function setOutputs(){
  if(!shelly.crossed){
    shelly.output["0"].state = shelly.input["0"].state;
    shelly.output["1"].state = shelly.input["1"].state;
  }else{
    shelly.output["0"].state = shelly.input["1"].state;
    shelly.output["1"].state = shelly.input["0"].state;
  }
  switchOut = true;
}

module.exports = { shelly, setOutputs };
