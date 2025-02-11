let isRecording = false;
let data = [];
let startTime = null;
let gyroChart;

// Initialize the chart
const ctx = document.getElementById('gyroChart').getContext('2d');
gyroChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            { label: 'X-axis', data: [], borderColor: 'rgb(255, 99, 132)', tension: 0.1 },
            { label: 'Y-axis', data: [], borderColor: 'rgb(75, 192, 192)', tension: 0.1 },
            { label: 'Z-axis', data: [], borderColor: 'rgb(153, 102, 255)', tension: 0.1 }
        ]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Time (ms)'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Rotation Rate (deg/s)'
                }
            }
        },
        animation: false
    }
});

document.getElementById("start").addEventListener("click", () => {
    if (typeof DeviceMotionEvent.requestPermission === "function") {
        DeviceMotionEvent.requestPermission()
            .then((response) => {
                if (response === "granted") {
                    startLogging();
                }
            })
            .catch(console.error);
    } else {
        startLogging();
    }
});

document.getElementById("stop").addEventListener("click", stopLogging);

function startLogging() {
    isRecording = true;
    startTime = Date.now();
    data = [];
    document.getElementById("start").disabled = true;
    document.getElementById("stop").disabled = false;

    // Reset chart data
    gyroChart.data.labels = [];
    gyroChart.data.datasets[0].data = [];
    gyroChart.data.datasets[1].data = [];
    gyroChart.data.datasets[2].data = [];
    gyroChart.update();

    window.addEventListener("devicemotion", captureMotion, true);
}

function captureMotion(event) {
    if (!isRecording) return;

    let timestamp = Date.now() - startTime;
    let gyroX = event.rotationRate?.alpha || 0;
    let gyroY = event.rotationRate?.beta || 0;
    let gyroZ = event.rotationRate?.gamma || 0;

    data.push(`${timestamp},${gyroX},${gyroY},${gyroZ}`);

    // Update chart
    gyroChart.data.labels.push(timestamp);
    gyroChart.data.datasets[0].data.push(gyroX);
    gyroChart.data.datasets[1].data.push(gyroY);
    gyroChart.data.datasets[2].data.push(gyroZ);

    // Remove old data points if there are too many
    const maxDataPoints = 100;
    if (gyroChart.data.labels.length > maxDataPoints) {
        gyroChart.data.labels.shift();
        gyroChart.data.datasets.forEach(dataset => dataset.data.shift());
    }

    gyroChart.update();
}

function stopLogging() {
    isRecording = false;
    window.removeEventListener("devicemotion", captureMotion);

    let csvContent = "timestamp,gyro_x,gyro_y,gyro_z\n" + data.join("\n");
    downloadFile(csvContent, "gyro_data.csv");

    document.getElementById("start").disabled = false;
    document.getElementById("stop").disabled = true;
}

function downloadFile(content, fileName) {
    let blob = new Blob([content], { type: "text/csv" });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
}
