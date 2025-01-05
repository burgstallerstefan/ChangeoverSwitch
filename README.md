# Shelly 2PM Changeover Switch Script

This script enables **changeover switch** functionality for the **Shelly 2PM**, providing seamless integration between switches and smart home systems like Alexa.

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

---

## Prerequisites

1. **Shelly 2PM Configuration**:  
   - Configure the Shelly 2PM so that the **inputs are detached from the outputs** (set "Detached Switch" mode in the Shelly app or Web UI).  
   - Ensure the device is set up and accessible via the Shelly app or Web UI.

2. **Alexa/Smart Home Grouping**:  
   - Create a group containing both outputs (`output[0]` and `output[1]`) to allow simultaneous toggling.

3. **Script Installation**:  
   - Open the **Scripts** section in the Shelly Web UI.  
   - Copy and paste the script into a new script file.  
   - Save and enable the script.

---

This script enhances the functionality of the Shelly 2PM, providing reliable changeover switching for manual and smart home setups.
