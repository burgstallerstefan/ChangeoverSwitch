# Shelly 2PM Two-Way Switching Script

This script enables two-way switching functionality for the **Shelly 2PM**, providing seamless integration between physical inputs and smart home systems like Alexa.

---

## Features

- **Two-Way Switching Logic**:  
  - Default mapping: `input[0] -> output[0]` and `input[1] -> output[1]`.  
  - Automatically switches to a crossed state (`input[0] -> output[1]` and `input[1] -> output[0]`) after external toggling via Alexa or other systems.

- **Alexa Integration**:  
  - Handles simultaneous toggling of both outputs by grouping them in Alexa or another smart home system.
  - Ensures the next manual switch operation works correctly with updated mapping.

- **Automatic State Detection**:  
  - Reads initial input/output states and power consumption on startup.
  - Adjusts the switching logic based on whether the lights were already on or off.

- **Failsafe Operation**:  
  - Maintains correct switching behavior even after external interference or manual toggling of outputs.

---

## Prerequisites

1. **Shelly 2PM Configuration**:  
   - Ensure the Shelly 2PM is set up and accessible via the Shelly app or Web UI.

2. **Alexa/Smart Home Grouping**:  
   - Create a group containing both outputs (`output[0]` and `output[1]`) to allow simultaneous toggling.

3. **Script Installation**:  
   - Open the **Scripts** section in the Shelly Web UI.  
   - Copy and paste the script into a new script file.  
   - Save and enable the script.

---

## Usage

1. **Physical Inputs**:  
   - Use `input[0]` or `input[1]` to toggle the corresponding outputs.

2. **Alexa/Smart Home**:  
   - Control both outputs simultaneously through Alexa or another grouped smart home system.

3. **Startup Behavior**:  
   - The script initializes by detecting input/output states and power consumption, ensuring reliable operation from the start.

---

This script enhances the functionality of the Shelly 2PM, ensuring smooth and reliable two-way switching in both manual and smart home setups.
