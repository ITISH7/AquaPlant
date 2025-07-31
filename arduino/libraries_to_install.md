# Required Arduino Libraries

Before uploading the code to your ESP32, you need to install the following libraries in Arduino IDE:

## Installation Steps:

1. Open Arduino IDE
2. Go to **Tools > Manage Libraries**
3. Search for and install each library listed below:

## Required Libraries:

### 1. ESP32 Board Package
- Go to **File > Preferences**
- Add this URL to "Additional Board Manager URLs":
  ```
  https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_dev_index.json
  ```
- Go to **Tools > Board > Board Manager**
- Search for "ESP32" and install "esp32 by Espressif Systems"

### 2. WebSockets Library
- **Library Name**: WebSockets
- **Author**: Markus Sattler
- **Version**: Latest (2.4.0 or higher)
- **Installation**: Library Manager → Search "WebSockets"

### 3. ArduinoJson Library
- **Library Name**: ArduinoJson
- **Author**: Benoit Blanchon
- **Version**: Latest (6.x.x)
- **Installation**: Library Manager → Search "ArduinoJson"

### 4. DHT Sensor Library
- **Library Name**: DHT sensor library
- **Author**: Adafruit
- **Version**: Latest (1.4.x)
- **Installation**: Library Manager → Search "DHT sensor library"

### 5. Adafruit Unified Sensor
- **Library Name**: Adafruit Unified Sensor
- **Author**: Adafruit
- **Version**: Latest
- **Installation**: This is automatically installed with DHT library, but you can search "Adafruit Unified Sensor" if needed

## Board Configuration:

After installing libraries, configure your ESP32 board:

1. **Tools > Board** → Select your ESP32 board (e.g., "ESP32 Dev Module")
2. **Tools > Upload Speed** → 921600
3. **Tools > CPU Frequency** → 240MHz (WiFi/BT)
4. **Tools > Flash Size** → 4MB (32Mb)
5. **Tools > Port** → Select your ESP32 COM port

## Code Configuration:

Before uploading, update these values in the Arduino code:

```cpp
// WiFi Configuration
const char* ssid = "YOUR_WIFI_SSID";          // Your WiFi network name
const char* password = "YOUR_WIFI_PASSWORD";   // Your WiFi password

// WebSocket Configuration  
const char* websocket_host = "YOUR_REPLIT_URL"; // Your Replit app URL (e.g., "myapp.username.repl.co")
const int websocket_port = 443;                 // Use 443 for HTTPS
```

## Optional: Sensor Calibration

If your moisture readings seem incorrect, uncomment and call the calibration function:

```cpp
void setup() {
  // ... existing setup code ...
  
  // Uncomment to calibrate moisture sensor
  // calibrateMoistureSensor();
}
```

This will help you determine the correct MOISTURE_MIN and MOISTURE_MAX values for your specific sensor.