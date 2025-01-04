# Shelly Changeover switch

This repository contains a script designed to manage and control a Shelly device. The script synchronizes input and output states, tracks energy consumption, and integrates basic logic for toggling states via Alexa. It is implemented using Shelly's API and event handlers.

## Features

- **Input/Output Synchronization**: Updates device output states based on input changes and vice versa.
- **Energy Monitoring**: Tracks active power consumption on connected outputs.
- **Alexa Integration**: Adds support for controlling the device using Alexa with logical state handling.
- **Cross-Output Logic**: Includes functionality for switching states between two outputs.
- **Initialization and Cyclic Updates**: Ensures the system is initialized and periodically updated.

## File Structure

- `model`: Represents the internal state of the Shelly device inputs and outputs.
- `event handlers`: Synchronize the device state with real-time events.
- `functions`: Handle input/output toggling, state updates, and power consumption readings.
- `cyclic`: A periodic timer-based function to manage system updates and ensure consistency.

## Requirements

- **Shelly Device**: Compatible with devices supporting Shelly scripts.
- **Shelly Cloud API**: The script relies on Shelly's API for status updates and toggling states.
- **Timer**: Uses a periodic timer for cyclic updates.

## Installation

1. Open the Shelly script editor for your device.
2. Copy and paste the provided script into the editor.
3. Save and enable the script.

## Usage

1. **Initialization**: The script automatically initializes on start-up. It reads input/output states, checks power consumption, and sets the initial state.
2. **Real-Time Events**: Updates are handled through Shelly event handlers to keep the device state synchronized.
3. **Alexa Commands**: Alexa can switch outputs on or off. The script manages additional logic to handle cross-state toggling.

## Functions Overview

### `setConsumption`

Diese Funktion liest den aktuellen Energieverbrauch (Active Power) der Ausgänge und aktualisiert das interne Modell. Sie wird verwendet, um zu prüfen, ob eine Last eingeschaltet ist (d.h. ob der Verbrauch > 0 ist). 

Die Informationen über die Leistungsaufnahme sind wichtig, um den Zustand der angeschlossenen Geräte zu überwachen und sicherzustellen, dass die Steuerungslogik (z. B. für Alexa-Befehle) korrekt funktioniert.

### `alexaOn` & `alexaOff`
Handle Alexa commands to toggle both outputs.

### `setOutputs`
Synchronizes output states based on input and cross-state logic.

### `switchOutputs`
Executes the RPC calls to set the physical device output states.

### `readInputs`
Reads the current input states from the device and updates the internal model.

### `init`
Initialization logic to ensure the device starts in a consistent state.

### `cyclic`
A periodic function that updates energy consumption and synchronizes outputs.

## Development Notes

- The script uses a `Timer.set` with a 10ms interval for cyclic updates.
- Output state toggling includes logic to avoid unnecessary state changes.
- Ensure your Shelly device firmware supports the scripting functionality.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
