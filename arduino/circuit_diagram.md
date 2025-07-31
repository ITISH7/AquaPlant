# Smart Plant Watering System - ESP32 Circuit Diagram

## Components Required:
- ESP32 Development Board
- Soil Moisture Sensor (Capacitive or Resistive)
- Water Pump (5V or 12V)
- Relay Module (5V)
- DHT22 Temperature & Humidity Sensor
- LDR (Light Dependent Resistor)
- 10kΩ Resistor (for LDR)
- Breadboard/PCB
- Jumper Wires
- External Power Supply (for pump)

## Pin Connections:

### Soil Moisture Sensor
- **VCC** → **3.3V** (ESP32)
- **GND** → **GND** (ESP32)
- **Analog Output** → **GPIO 36 (A0)** (ESP32)

### DHT22 Sensor
- **VCC** → **3.3V** (ESP32)
- **GND** → **GND** (ESP32)
- **Data** → **GPIO 4** (ESP32)

### LDR (Light Sensor)
- **One end** → **3.3V** (ESP32)
- **Other end** → **GPIO 34 (A6)** (ESP32) + **10kΩ resistor to GND**

### Relay Module (for Water Pump)
- **VCC** → **5V** (ESP32 VIN or external 5V)
- **GND** → **GND** (ESP32)
- **IN** → **GPIO 2** (ESP32)

### Water Pump
- **Positive** → **Relay COM (Common)**
- **Negative** → **External Power Supply GND**
- **Relay NO (Normally Open)** → **External Power Supply Positive**

## Circuit Diagram (ASCII):

```
                    ESP32
                 ┌─────────────┐
                 │             │
    Moisture ────│ GPIO 36(A0) │
    Sensor   ────│ 3.3V        │
             ────│ GND         │
                 │             │
    DHT22    ────│ GPIO 4      │
    Sensor   ────│ 3.3V        │
             ────│ GND         │
                 │             │
    LDR      ────│ GPIO 34(A6) │
    Circuit  ────│ 3.3V        │
             ────│ GND         │
                 │             │
    Relay    ────│ GPIO 2      │
    Module   ────│ 5V (VIN)    │
             ────│ GND         │
                 │             │
    WiFi     ────│ Built-in    │
                 └─────────────┘

    Water Pump Circuit:
    
    External 12V ──┬── Relay NO
    Power Supply   │
                   │
                   └── Relay COM ── Water Pump (+)
                   
    ESP32 GND ────────── External Power GND ── Water Pump (-)
    
    Light Sensor Circuit:
    
    3.3V ──── LDR ──┬── GPIO 34
                    │
                    └── 10kΩ ── GND
```

## Safety Notes:
1. **Isolation**: Use a relay to isolate the ESP32 from the water pump's power circuit
2. **Waterproofing**: Keep the ESP32 and electronics away from water
3. **Power Supply**: Use appropriate voltage for your water pump (5V/12V)
4. **Grounding**: Ensure all components share a common ground
5. **Moisture Sensor**: Use a capacitive sensor for better longevity

## Pin Usage Summary:
- **GPIO 36**: Soil moisture sensor (analog input)
- **GPIO 4**: DHT22 temperature/humidity sensor
- **GPIO 34**: LDR light sensor (analog input)
- **GPIO 2**: Relay control for water pump
- **Built-in WiFi**: For web interface communication

## Additional Notes:
- The soil moisture sensor should be inserted into the soil near the plant roots
- Calibrate the moisture sensor readings (0-4095) to percentage (0-100%)
- Place the LDR sensor where it can detect ambient light levels
- Ensure proper ventilation for the DHT22 sensor