#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// Pin Definitions
#define MOISTURE_SENSOR_PIN 36    // Analog pin for soil moisture sensor
#define DHT_PIN 4                 // Digital pin for DHT22 sensor
#define LDR_PIN 34               // Analog pin for light sensor
#define PUMP_RELAY_PIN 2         // Digital pin for water pump relay

// Sensor Configuration
#define DHT_TYPE DHT22
DHT dht(DHT_PIN, DHT_TYPE);

// WiFi Configuration
const char* ssid = "YOUR_WIFI_SSID";          // Replace with your WiFi SSID
const char* password = "YOUR_WIFI_PASSWORD";   // Replace with your WiFi password

// WebSocket Configuration
const char* websocket_host = "aqua-plant.replit.app";  // Your Replit app URL
const int websocket_port = 443;                         // Use 443 for HTTPS
const char* websocket_path = "/ws";

WebSocketsClient webSocket;

// System Variables
bool pumpRunning = false;
unsigned long lastSensorReading = 0;
unsigned long lastHeartbeat = 0;
const unsigned long SENSOR_INTERVAL = 5000;    // Read sensors every 5 seconds
const unsigned long HEARTBEAT_INTERVAL = 30000; // Send heartbeat every 30 seconds

// Moisture sensor calibration values (adjust based on your sensor)
const int MOISTURE_MIN = 2800;  // Sensor value in air (dry)
const int MOISTURE_MAX = 1300;  // Sensor value in water (wet)

void setup() {
  Serial.begin(115200);
  
  // Initialize pins
  pinMode(PUMP_RELAY_PIN, OUTPUT);
  digitalWrite(PUMP_RELAY_PIN, LOW);  // Ensure pump is off initially
  
  // Initialize sensors
  dht.begin();
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Connected to WiFi. IP: ");
  Serial.println(WiFi.localIP());
  
  // Initialize WebSocket with SSL for secure connection to Replit
  webSocket.beginSSL(websocket_host, websocket_port, websocket_path);
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
  webSocket.enableHeartbeat(15000, 3000, 2);  // Enable heartbeat
  
  Serial.println("Attempting WebSocket connection to:");
  Serial.print("Host: ");
  Serial.println(websocket_host);
  Serial.print("Port: ");
  Serial.println(websocket_port);
  Serial.print("Path: ");
  Serial.println(websocket_path);
  
  Serial.println("Smart Plant Watering System Started");
  Serial.println("Pin Configuration:");
  Serial.println("- Moisture Sensor: GPIO 36");
  Serial.println("- DHT22 Sensor: GPIO 4");
  Serial.println("- LDR Sensor: GPIO 34");
  Serial.println("- Pump Relay: GPIO 2");
}

void loop() {
  webSocket.loop();
  
  unsigned long currentTime = millis();
  
  // Read sensors periodically
  if (currentTime - lastSensorReading >= SENSOR_INTERVAL) {
    readAndSendSensors();
    lastSensorReading = currentTime;
  }
  
  // Send heartbeat periodically
  if (currentTime - lastHeartbeat >= HEARTBEAT_INTERVAL) {
    sendHeartbeat();
    lastHeartbeat = currentTime;
  }
  
  delay(100);
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.println("WebSocket Disconnected");
      break;
      
    case WStype_CONNECTED:
      Serial.print("WebSocket Connected to: ");
      Serial.println((char*)payload);
      sendSystemStatus();
      break;
      
    case WStype_TEXT: {
      Serial.print("Received: ");
      Serial.println((char*)payload);
      
      // Parse JSON message
      DynamicJsonDocument doc(1024);
      deserializeJson(doc, payload);
      
      String messageType = doc["type"];
      
      if (messageType == "start_watering") {
        startPump();
      } else if (messageType == "stop_watering") {
        stopPump();
      } else if (messageType == "get_status") {
        sendSystemStatus();
      }
      break;
    }
    
    default:
      break;
  }
}

void readAndSendSensors() {
  // Read moisture sensor
  int moistureRaw = analogRead(MOISTURE_SENSOR_PIN);
  int moisturePercent = map(moistureRaw, MOISTURE_MIN, MOISTURE_MAX, 0, 100);
  moisturePercent = constrain(moisturePercent, 0, 100);
  
  // Read temperature and humidity
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  
  // Read light sensor
  int lightRaw = analogRead(LDR_PIN);
  String lightLevel;
  if (lightRaw > 3000) {
    lightLevel = "High";
  } else if (lightRaw > 1500) {
    lightLevel = "Medium";
  } else {
    lightLevel = "Low";
  }
  
  // Check for sensor errors
  if (isnan(temperature) || isnan(humidity)) {
    temperature = 25.0;  // Default fallback
    humidity = 60.0;     // Default fallback
    Serial.println("DHT sensor error, using default values");
  }
  
  // Auto-stop pump if moisture reaches 100%
  if (pumpRunning && moisturePercent >= 100) {
    stopPump();
    sendNotification("Watering completed!", "Moisture level reached 100%", "success");
  }
  
  // Send sensor data via WebSocket
  DynamicJsonDocument doc(512);
  doc["type"] = "system_status";
  doc["data"]["moistureLevel"] = moisturePercent;
  doc["data"]["temperature"] = (int)round(temperature);
  doc["data"]["humidity"] = (int)round(humidity);
  doc["data"]["lightLevel"] = lightLevel;
  doc["data"]["isWatering"] = pumpRunning;
  doc["data"]["pumpStatus"] = pumpRunning ? "running" : "idle";
  doc["data"]["connectionStatus"] = "connected";
  
  String message;
  serializeJson(doc, message);
  webSocket.sendTXT(message);
  
  // Debug output
  Serial.print("Moisture: ");
  Serial.print(moisturePercent);
  Serial.print("% (");
  Serial.print(moistureRaw);
  Serial.print(") | Temp: ");
  Serial.print(temperature);
  Serial.print("°C | Humidity: ");
  Serial.print(humidity);
  Serial.print("% | Light: ");
  Serial.print(lightLevel);
  Serial.print(" (");
  Serial.print(lightRaw);
  Serial.println(")");
}

void startPump() {
  if (!pumpRunning) {
    digitalWrite(PUMP_RELAY_PIN, HIGH);
    pumpRunning = true;
    Serial.println("Water pump started");
    sendSystemStatus();
  }
}

void stopPump() {
  if (pumpRunning) {
    digitalWrite(PUMP_RELAY_PIN, LOW);
    pumpRunning = false;
    Serial.println("Water pump stopped");
    sendSystemStatus();
  }
}

void sendSystemStatus() {
  readAndSendSensors();  // This will send the current status
}

void sendHeartbeat() {
  DynamicJsonDocument doc(256);
  doc["type"] = "heartbeat";
  doc["data"]["uptime"] = millis();
  doc["data"]["freeHeap"] = ESP.getFreeHeap();
  doc["data"]["wifiRSSI"] = WiFi.RSSI();
  
  String message;
  serializeJson(doc, message);
  webSocket.sendTXT(message);
}

void sendNotification(String title, String message, String notificationType) {
  DynamicJsonDocument doc(512);
  doc["type"] = "notification";
  doc["data"]["title"] = title;
  doc["data"]["message"] = message;
  doc["data"]["type"] = notificationType;
  
  String jsonMessage;
  serializeJson(doc, jsonMessage);
  webSocket.sendTXT(jsonMessage);
}

// Moisture sensor calibration function (call this to calibrate your sensor)
void calibrateMoistureSensor() {
  Serial.println("Moisture Sensor Calibration");
  Serial.println("1. Place sensor in air and note the value");
  Serial.println("2. Place sensor in water and note the value");
  Serial.println("3. Update MOISTURE_MIN and MOISTURE_MAX in code");
  
  for (int i = 0; i < 10; i++) {
    int reading = analogRead(MOISTURE_SENSOR_PIN);
    Serial.print("Reading ");
    Serial.print(i + 1);
    Serial.print(": ");
    Serial.println(reading);
    delay(1000);
  }
}