# Weigh & Earn

## Purpose

The module converts recyclable material weight into reward points and stores the transaction offline.

## Materials And Formula

Points are calculated as `weightGrams * materialMultiplier`, rounded to the nearest integer.

| Material | Multiplier |
| --- | --- |
| Sachet | 2 |
| Plastic Bottle | 3 |
| Aluminum | 4 |
| Mixed Waste | 1 |

## Manual Input

- Users can type gram values directly.
- Weight must be greater than 0.
- The points preview updates as weight or material changes.
- Saving creates a transaction and updates the user's points and total recycled weight.

## ESP32 BLE Contract

- Android is the first supported platform.
- Device name: `WasteScale`.
- Service UUID: `7e400001-b5a3-f393-e0a9-e50e24dcca9e`.
- Weight characteristic UUID: `7e400003-b5a3-f393-e0a9-e50e24dcca9e`.
- The characteristic should notify ASCII payloads such as `WT:150.0` or `150.0`.
- Payload values are interpreted as grams and copied into the weight input.

## Failure States

- Non-Android platforms show unsupported messaging.
- Missing Bluetooth permissions show permission messaging.
- Missing native BLE module asks for an Android development build.
- Invalid ESP32 payloads are ignored.
- Dropped scale connection shows reconnect messaging.

## Test Cases

- Confirm `150g Sachet` previews and saves `300` points.
- Confirm zero, negative, and empty weights cannot be saved.
- Confirm BLE parser accepts `WT:150.0` and `150.0`.
- Confirm BLE parser rejects non-numeric payloads.
- Confirm manual input still works without an ESP32 connected.
