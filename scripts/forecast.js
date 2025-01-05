// fetch the Kp forecast for tomorrow and render the chart
async function fetchKpForecastTomorrow() {
  try {
    //fetch data from NOAAs
    const response = await fetch('https://services.swpc.noaa.gov/text/3-day-forecast.txt');
    if (!response.ok) {
      throw new Error('Network connection was not established');
    }
    const textData = await response.text();
    const lines = textData.split('\n');
    const timeKpMap2 = {};

    for (const line of lines) {
      if (line.includes('NOAA Kp index breakdown')) continue; //skip header line
      const cleanLine = line.replace(/\(G\d\)/g, '');//remove (Gx)
      const values = cleanLine.trim().split(/\s+/);
      if (values.length >= 4) {
        const time = values[0];//time
        const kpValue = values[2];//kp value
        if (time.includes('UT') && !isNaN(parseFloat(kpValue))) {
          const kpIndex = Math.round(parseFloat(kpValue));//convert and round kp value
          timeKpMap2[time.slice(0, -2)] = kpIndex;//map time to kp index
        }
      }
    }
    renderChart2(timeKpMap2);//render chart
  } catch (error) {
    console.error('Error fetching tomorrows Kp forecast data:', error);
  }
}

async function fetchKpForecastToday() {
  try {
    const response = await fetch('https://services.swpc.noaa.gov/text/3-day-forecast.txt');
    if (!response.ok) {
      throw new Error('Network connection was not established');
    }
    const textData = await response.text();
    const lines = textData.split('\n');
    const timeKpMap1 = {};

    for (const line of lines) {
      if (line.includes('NOAA Kp index breakdown')) continue;
      const match = line.match(/(\d{2}-\d{2}UT)\s+([\d.]+)/);//match  time and kp value
      if (match) {
        const time = match[1].trim();
        const kpIndex = Math.round(parseFloat(match[2].trim()));
        timeKpMap1[time.slice(0, -2)] = kpIndex; //map time to kp index
      }
    }
    renderChart1(timeKpMap1);
  } catch (error) {
    console.error('Error fetching todays Kp forecast data:', error);
  }
}
//color for chart depending on kp index value
function getColor(kpIndex) {
  if (kpIndex <= 3) return 'rgba(0, 255, 0, 0.8)';
  if (kpIndex == 4) return 'rgba(255, 255, 0, 0.8)';
  if (kpIndex <= 6) return 'rgba(255, 165, 0, 0.8)';
  if (kpIndex <= 9) return 'rgba(255, 0, 0, 0.8)';
  return 'rgba(0, 0, 0, 0.8)';
}

//render chart
function renderChart1(timeKpMap1) {
  const ctx = document.getElementById('kpChart1').getContext('2d');
  const labels = Object.keys(timeKpMap1);
  const data = Object.values(timeKpMap1);
  const backgroundColors = data.map(kpIndex => getColor(kpIndex));
  const currentDate = new Date().toLocaleDateString('en-CZ', {
    year: 'numeric', //
    month: 'short', //current date
    day: 'numeric' //
  });

  // Set canvas height based on viewport width
  ctx.canvas.height = window.innerWidth < 768 ? 300 : 500;
  //chart settings
  const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Kp Index',
        data: data,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          align: 'end',
          text: currentDate,
          color: 'grey',
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          },
          padding: {
            top: 10,
            bottom: 30
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 9,
          title: {
            display: true,
            text: 'Kp Index'
          },
          ticks: {
            font: {
              size: window.innerWidth < 768 ? 10 : 12
            }
          }
        },
        x: {
          title: {
            display: true,
            text: 'Time (UTC)'
          },
          ticks: {
            font: {
              size: window.innerWidth < 768 ? 10 : 12
            },
            maxRotation: 45,
            minRotation: 45
          }
        }
      }
    }
  });

}
//render chart for tomorrow
function renderChart2(timeKpMap2) {
  const ctx = document.getElementById('kpChart2').getContext('2d');
  const labels = Object.keys(timeKpMap2);
  const data = Object.values(timeKpMap2);
  const backgroundColors = data.map(kpIndex => getColor(kpIndex));

  // Set canvas height based on viewport
  ctx.canvas.height = window.innerWidth < 768 ? 300 : 500;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toLocaleDateString('en-CZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Kp Index',
        data: data,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          align: 'end',
          text: tomorrowDate,
          color: 'grey',
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          },
          padding: {
            top: 10,
            bottom: 30
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 9,
          title: {
            display: true,
            text: 'Kp Index'
          },
          ticks: {
            font: {
              size: window.innerWidth < 768 ? 10 : 12
            }
          }
        },
        x: {
          title: {
            display: true,
            text: 'Time (UTC)'
          },
          ticks: {
            font: {
              size: window.innerWidth < 768 ? 10 : 12
            },
            maxRotation: 45,
            minRotation: 45
          }
        }
      }
    }
  });
}
//expose fetch functions to window object and export for use
window.fetchKpForecastToday = fetchKpForecastToday;
window.fetchKpForecastTomorrow = fetchKpForecastTomorrow;
export { fetchKpForecastToday, fetchKpForecastTomorrow };