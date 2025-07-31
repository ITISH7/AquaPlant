# ESP32 Setup Guide for Aqua Plant System

## Quick Start

Your ESP32 code is ready to connect to **aqua-plant.replit.app**! Follow these steps:

### 1. Update WiFi Settings

Open `arduino/plant_watering_system.ino` and change these lines:

```cpp
const char* ssid = "YOUR_WIFI_SSID";          // Replace with your WiFi name
const char* password = "YOUR_WIFI_PASSWORD";   // Replace with your WiFi password
```

### 2. Install Required Libraries

In Arduino IDE, go to **Tools > Manage Libraries** and install:

- `WebSocketsClient` by Markus Sattler
- `ArduinoJson` by Benoit Blanchon  
- `DHT sensor library` by Adafruit

### 3. Hardware Connections

Connect your sensors exactly as shown in the circuit diagram:

- **Soil Moisture Sensor** → GPIO 36 (analog input)
- **DHT22 Temperature/Humidity** → GPIO 4 (digital)
- **Light Sensor (LDR)** → GPIO 34 (analog input)  
- **Water Pump Relay** → GPIO 2 (digital output)

### 4. Upload and Test

1. Select your ESP32 board type in Arduino IDE
2. Choose the correct COM port
3. Upload the code
4. Open Serial Monitor (115200 baud rate)
5. Watch for "Connected to WiFi" and "WebSocket Connected" messages

## Features

Your ESP32 will automatically:

✓ Connect to your web app at aqua-plant.replit.app
✓ Send sensor readings every 5 seconds
✓ Respond to manual watering commands from the web interface
✓ Auto-stop watering when moisture reaches 100%
✓ Send notifications to the web app
✓ Reconnect if connection drops

## Troubleshooting

**WiFi not connecting?**
- Double-check your WiFi name and password
- Make sure your ESP32 is in range of your router

**WebSocket not connecting?**
- Verify your internet connection
- The web app must be running on aqua-plant.replit.app

**Sensors giving weird readings?**
- Check all wire connections
- Run the calibration function for moisture sensor
- Make sure sensors are powered correctly

## Serial Monitor Output

You should see output like this:
```
Connected to WiFi. IP: 192.168.1.100
WebSocket Connected to: wss://aqua-plant.replit.app/ws
Moisture: 45% (2100) | Temp: 24°C | Humidity: 65% | Light: Medium (2000)
```

## Need Help?

- Check the circuit diagram in `arduino/circuit_diagram.md`
- Review the libraries list in `arduino/libraries_to_install.md`
- Make sure your web app is running on aqua-plant.replit.app