// fetch weather data from OpenWeatherMap API
async function fetchWeatherData(latitude, longitude, apiKey) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
    );
    if (!response.ok) throw new Error('Weather API request failed');
    return await response.json();
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}
//extract and return the current weather data from the fetched weather data
function getCurrentWeather(weatherData) {
  const current = weatherData.list[0];
  return {
    temperature: Math.round(current.main.temp),//round temperature
    description: current.weather[0].description,
    clouds: current.clouds.all,
    humidity: current.main.humidity,
    windSpeed: Math.round(current.wind.speed * 3.6),
    icon: current.weather[0].icon,
    forecast: weatherData.list.slice(1, 5)//next four forecast entries
  };
}

//update the weather display on the webpage
function updateWeatherDisplay(currentWeather, forecastElement, currentElement) {
  if (!currentElement || !forecastElement) return;
  //current weather status display
  currentElement.innerHTML = `
    <h3 class="text-xl md:text-2xl font-bold mb-4 text-center">Current Local Weather</h3>
    <div class="flex flex-col items-center">
      <img src="https://openweathermap.org/img/wn/${currentWeather.icon}@2x.png" alt="Weather icon">
      <p class="text-xl">${currentWeather.temperature}°C</p>
      <p class="capitalize">${currentWeather.description}</p>
      <p>Cloud Cover: ${currentWeather.clouds}%</p>
      <p>Humidity: ${currentWeather.humidity}%</p>
      <p>Wind: ${currentWeather.windSpeed} km/h</p>
    </div>
  `;

  forecastElement.innerHTML = '';

  //display the forcast
  currentWeather.forecast.forEach((item, i) => {
    const forecast = document.createElement('div');
    forecast.className = 'text-center p-2';
    forecast.innerHTML = `
      <p class="text-sm mb-1">+${(i + 1) * 6}h</p>
      <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="Weather icon" class="mx-auto">
      <p class="text-sm">${Math.round(item.main.temp)}°C</p>
      <p class="text-sm">${item.clouds.all}% clouds</p>
    `;
    forecastElement.appendChild(forecast);
  });
}

//initialize the weather tracking on the page
async function initWeatherTracking() {
  const forecastElement = document.getElementById('forecast-weather');
  const currentElement = document.getElementById('current-weather');
  const errorElement = document.getElementById('weather-error');

  if (!forecastElement || !currentElement) {
    console.error('Weather elements not found');
    return;
  }

  try {
    let weatherData;
    let latitude, longitude;
    
    if (window.location.protocol === 'https:') {
      // use geolocation to get current users position
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
      const apiKey = '6f2f23303708a60e0bba222fbf816d1b';//wasnt able to use .env (idk why) so had to insert key like this :(...
      weatherData = await fetchWeatherData(latitude, longitude, apiKey);
    } else {
      if (errorElement) {
        errorElement.textContent = 'Secure connection have not been estabilished';
      }
    }

    const currentWeather = getCurrentWeather(weatherData);
    updateWeatherDisplay(currentWeather, forecastElement, currentElement);
    
    if (window.location.protocol === 'https:') {
      //update automatically every 30mins
      setInterval(async () => {
        const apiKey = '6f2f23303708a60e0bba222fbf816d1b';
        const newData = await fetchWeatherData(latitude, longitude, apiKey);
        const newCurrent = getCurrentWeather(newData);
        updateWeatherDisplay(newCurrent, forecastElement, currentElement);
      }, 1800000);
    }
    
  } catch (error) {
    console.error('Weather tracking error:', error);
    if (errorElement) {
      errorElement.textContent = 'Unable to fetch weather data. Please enable location services and refresh.';
    }
  }
}
//expose init function to window object and export for use
window.initWeatherTracking = initWeatherTracking;
export { initWeatherTracking };