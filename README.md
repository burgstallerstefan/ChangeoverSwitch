# Shelly 2PM Changeover Switch Script

This script enables **changeover switch** functionality for the **Shelly 2PM**, providing seamless integration between switches and smart home systems like Alexa.

This script only makes sense if the wiring looks like this:

![ShellDiag](https://github.com/user-attachments/assets/022be4b8-6bc7-42d0-b6e4-e25588aec309)

If the wiring is still freely selectable, you can wire the Shelly as follows and configure the switch as an Edge, so the script is not necessary:
![Unbenanntes Diagramm](https://github.com/user-attachments/assets/bfa63448-7172-4917-8f62-08b8bc07f32d)


---

## Features

- **Changeover Switching Logic**:  
  - Default mapping: `input[0] -> output[0]` and `input[1] -> output[1]`.  
  - Automatically switches to a crossed state (`input[0] -> output[1]` and `input[1] -> output[0]`) after external toggling via Alexa or other systems.

- **Alexa Integration**:  
  - Handles simultaneous toggling of both outputs by Alexa.  
  - Ensures the next manual switch operation works correctly with updated mapping.

- **Automatic State Detection**:  
  - Reads initial input/output states and power consumption on startup.  
  - Adjusts the switching logic based on whether the lights were already on or off.

- **Automatic Detach of switches from inputs**:  
  - Switches get detached from inputs automatically during startup.
---

## Prerequisites

1. **Alexa/Smart Home Grouping**:  
   - Create a group containing both outputs (`output[0]` and `output[1]`) to allow simultaneous toggling.

2. **Script Installation**:  
   - Open the **Scripts** section in the Shelly Web UI.  
   - Copy and paste the script into a new script file.  
   - Save and enable the script.

---

This script enhances the functionality of the Shelly 2PM, providing reliable changeover switching for manual and smart home setups.
