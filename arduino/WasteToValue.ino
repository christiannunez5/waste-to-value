#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <HX711.h>
#include <ESP32Servo.h> // <-- ADDED SERVO LIBRARY

// =========================
// HARDWARE PINS
// =========================
const int LOADCELL_DOUT_PIN = 16;
const int LOADCELL_SCK_PIN  = 4;
const int SERVO_PIN         = 13; // <-- ADDED SERVO PIN

// =========================
// COMPONENTS
// =========================
HX711 scale;
Servo rewardServo; // <-- ADDED SERVO OBJECT

// =========================
// BLE SETTINGS
// =========================
#define bleServerName "WasteScale"

#define SERVICE_UUID        "7e400001-b5a3-f393-e0a9-e50e24dcca9e"
#define CHARACTERISTIC_UUID "7e400003-b5a3-f393-e0a9-e50e24dcca9e"

BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;

bool deviceConnected = false;
bool oldDeviceConnected = false;

// =========================
// IMPORTANT
// Change this if needed
// =========================
float calibration_factor = 452.0;

// =========================
// TIMERS
// =========================
unsigned long lastSend  = 0;
unsigned long lastPrint = 0;

// =========================
// BLE CALLBACKS
// =========================
class MyServerCallbacks : public BLEServerCallbacks {

  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
    Serial.println("BLE Device Connected!");
  }

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    Serial.println("BLE Device Disconnected!");
  }
};

// =========================
// SETUP
// =========================
void setup() {

  Serial.begin(115200);

  // =========================
  // SERVO SETUP
  // =========================
  ESP32PWM::allocateTimer(0);
  rewardServo.setPeriodHertz(50); 
  rewardServo.attach(SERVO_PIN, 500, 2400);
  rewardServo.write(0); // Start with trapdoor closed

  // =========================
  // HX711 SETUP
  // =========================
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);

  delay(1000);

  scale.set_scale(calibration_factor);

  Serial.println("Calibrating... Remove all weight.");

  delay(2000);

  scale.tare();

  Serial.println("HX711 Ready");

  // =========================
  // BLE SETUP
  // =========================
  BLEDevice::init(bleServerName);

  pServer = BLEDevice::createServer();

  pServer->setCallbacks(new MyServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);

  pCharacteristic = pService->createCharacteristic(
                      CHARACTERISTIC_UUID,
                      BLECharacteristic::PROPERTY_READ |
                      BLECharacteristic::PROPERTY_NOTIFY
                    );

  pCharacteristic->addDescriptor(new BLE2902());

  pService->start();

  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();

  pAdvertising->addServiceUUID(SERVICE_UUID);

  pAdvertising->setScanResponse(true);

  BLEDevice::startAdvertising();

  Serial.println("BLE Advertising Started");
  Serial.println("System Ready!");
}

// =========================
// LOOP
// =========================
void loop() {

  // =========================
  // HANDLE BLE RECONNECT
  // =========================
  if (!deviceConnected && oldDeviceConnected) {

    delay(500);

    pServer->startAdvertising();

    oldDeviceConnected = deviceConnected;

    Serial.println("Restart Advertising...");
  }

  if (deviceConnected && !oldDeviceConnected) {

    oldDeviceConnected = deviceConnected;

    Serial.println("Expo App Connected!");
  }

  // =========================
  // READ HX711
  // =========================
  if (scale.is_ready()) {

    delay(10);

    // Average 20 readings
    float currentWeight = scale.get_units(20);

    // Fix tiny noise
    if (abs(currentWeight) < 1.0) {
      currentWeight = 0;
    }

    // Prevent negative readings
    if (currentWeight < 0) {
      currentWeight = 0;
    }

   // =========================
    // TRIGGER LOGIC (SILENT UNTIL DROP)
    // =========================
    
    // ONLY trigger if the weight is heavy enough to be an actual sachet (> 2.0g)
    if (currentWeight > 2.0) {

      // 1. Print to Serial Monitor ONLY when waste is placed
      Serial.print("Waste Detected! Weight: ");
      Serial.print(currentWeight, 1);
      Serial.println(" g");

      // 2. Send to App and Open Trapdoor
      if (deviceConnected) {
        
        // Send the payload to the phone
        String payload = "WT:" + String(currentWeight, 1);
        pCharacteristic->setValue(payload.c_str());
        pCharacteristic->notify();
        Serial.println("Sent to App: " + payload);

        // Open the Trapdoor
        Serial.println("Activating Servo...");
        rewardServo.write(90); // Open door
        delay(2000);           // Wait 2 seconds for it to fall
        rewardServo.write(0);  // Close door

      } else {
        Serial.println("Warning: Dropped, but App is not connected!");
      }

      // 3. Reset the scale back to zero for the next user
      delay(2000); 
      scale.tare(); 
      Serial.println("Scale zeroed. Waiting for next waste...");
      
      // Pause briefly so it doesn't accidentally double-count the same sachet
      delay(1000); 
    }
  }

  delay(20);
}