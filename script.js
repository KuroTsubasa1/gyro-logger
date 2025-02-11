let isRecording = false;
let data = [];
let startTime = null;
let gyroChart;
let isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

// Initialize stats objects
let stats = {
    x: { min: Infinity, max: -Infinity, sum: 0, count: 0 },
    y: { min: Infinity, max: -Infinity, sum: 0, count: 0 },
    z: { min: Infinity, max: -Infinity, sum: 0, count: 0 }
};

// Theme handling
function updateTheme() {
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    updateChartTheme();
}

function updateChartTheme() {
    const textColor = isDarkMode ? '#ffffff' : '#000000';
    gyroChart.options.scales.x.ticks.color = textColor;
    gyroChart.options.scales.y.ticks.color = textColor;
    gyroChart.options.scales.x.title.color = textColor;
    gyroChart.options.scales.y.title.color = textColor;
    gyroChart.options.plugins.legend.labels.color = textColor;
    gyroChart.update();
}

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
    document.getElementById("exportJSON").disabled = true;

    // Reset stats
    stats = {
        x: { min: Infinity, max: -Infinity, sum: 0, count: 0 },
        y: { min: Infinity, max: -Infinity, sum: 0, count: 0 },
        z: { min: Infinity, max: -Infinity, sum: 0, count: 0 }
    };

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

    data.push({ timestamp, x: gyroX, y: gyroY, z: gyroZ });

    // Update statistics
    updateStats('x', gyroX);
    updateStats('y', gyroY);
    updateStats('z', gyroZ);
    displayStats();

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

    gyroChart.update('none');
}

function stopLogging() {
    isRecording = false;
    window.removeEventListener("devicemotion", captureMotion);

    let csvContent = "timestamp,gyro_x,gyro_y,gyro_z\n" + 
        data.map(d => `${d.timestamp},${d.x},${d.y},${d.z}`).join("\n");
    downloadFile(csvContent, "gyro_data.csv");

    document.getElementById("start").disabled = false;
    document.getElementById("stop").disabled = true;
    document.getElementById("exportJSON").disabled = false;
}

function updateStats(axis, value) {
    stats[axis].min = Math.min(stats[axis].min, value);
    stats[axis].max = Math.max(stats[axis].max, value);
    stats[axis].sum += value;
    stats[axis].count++;
}

function displayStats() {
    ['x', 'y', 'z'].forEach(axis => {
        document.getElementById(`${axis}Min`).textContent = stats[axis].min.toFixed(2);
        document.getElementById(`${axis}Max`).textContent = stats[axis].max.toFixed(2);
        document.getElementById(`${axis}Avg`).textContent = (stats[axis].sum / stats[axis].count).toFixed(2);
    });
}

document.getElementById("exportJSON").addEventListener("click", () => {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, "gyro_data.json");
});

document.getElementById("themeToggle").addEventListener("click", () => {
    isDarkMode = !isDarkMode;
    updateTheme();
});

// Initialize theme
updateTheme();

function downloadFile(content, fileName) {
    let blob = new Blob([content], { type: "text/csv" });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
}