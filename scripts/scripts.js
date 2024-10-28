/*async function fetchHourlyKpIndex() {
    try {
      const response = await fetch('https://services.swpc.noaa.gov/json/planetary_k_index_1m.json');
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      
      const kpTableBody = document.getElementById('kpTableBody');
      kpTableBody.innerHTML = ''; // Clear previous entries
  
      // Process and append the data to the table
      data.forEach(entry => {
        const entryDate = new Date(entry.time_tag);
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-600';
        row.innerHTML = `
          <td class="px-4 py-2 border-b border-gray-500">${entryDate.toLocaleString()}</td>
          <td class="px-4 py-2 border-b border-gray-500">${entry.kp_index}</td>
        `;
        kpTableBody.appendChild(row);
      });
    } catch (error) {
      console.error('Error fetching Kp index data:', error);
    }
  }*/






async function fetchKpForecast() {
  try {
    const response = await fetch('https://services.swpc.noaa.gov/text/3-day-forecast.txt');

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const textData = await response.text();
    const lines = textData.split('\n');

    const timeKpMap = {};

    // Filter text file returned by API and put values in timeKpMap
    for (const line of lines) {
      if (line.includes('NOAA Kp index breakdown')) {
        continue; // Skip the header line
      }

      const match = line.match(/(\d{2}-\d{2}UT)\s+([\d.]+)/);
      if (match) {
        const time = match[1].trim();
        const kpIndex = Math.round(parseFloat(match[2].trim()));

        timeKpMap[time] = kpIndex; // Use UTC time as the key
      }
    }

    console.log(timeKpMap);
    renderChart(timeKpMap);

  } catch (error) {
    console.error('Error fetching Kp forecast data:', error);
  }
}

function renderChart(timeKpMap) {

  const ctx = document.getElementById('kpChart').getContext('2d');
  const labels = Object.keys(timeKpMap);
  const data = Object.values(timeKpMap);

  const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Kp Index',
        data: data,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Kp Index'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Time (UTC)'
          }
        }
      }
    }
  });
}
