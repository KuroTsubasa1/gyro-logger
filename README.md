# Gyro Data Logger

A web-based application for capturing and visualizing gyroscope data from mobile devices in real-time. This tool allows users to record device rotation rates across three axes (X, Y, Z) and export the collected data in CSV format for further analysis.

## Features

- Real-time visualization of gyroscope data using Chart.js
- Live tracking of rotation rates across X, Y, and Z axes
- Data export functionality in CSV format
- Responsive design for mobile devices
- Automatic permission handling for device motion sensors
- Rolling window display of the most recent 100 data points

## Usage

1. Open the application on a mobile device with gyroscope sensors
2. Click "Start Logging" to begin recording gyroscope data
3. Move your device to capture rotation rates
4. Click "Stop & Download" to save the recorded data as a CSV file

## Technical Details

- Built with vanilla JavaScript
- Uses the Device Motion API for sensor data
- Visualizations powered by Chart.js
- Data format: timestamp (ms), gyro_x (deg/s), gyro_y (deg/s), gyro_z (deg/s)

## Getting Started

1. Clone the repository
2. Open index.html in a web browser
3. Access the page from a mobile device to begin logging gyroscope data

## Browser Compatibility

This application requires a device with gyroscope sensors and a browser that supports the Device Motion API. For iOS devices, user permission will be requested before accessing the motion sensors.