// fetch weather data from OpenWeatherMap API
async function fetchWeatherData(latitude, longitude, apiKey) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
    );
    console.log(response);
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
  <div class="flex flex-col items-center rounded-lg p-6">
      <img
        src="https://openweathermap.org/img/wn/${currentWeather.icon}@2x.png"
        alt="Weather icon"
        class="mx-auto w-12 h-12"
      >
      <p class="text-lg font-semibold text-gray-300 my-2">${currentWeather.temperature}°C</p>
      <p class="text-sm text-gray-300 capitalize mb-2">${currentWeather.description}</p>
      <div class="grid grid-cols-3 gap-4 text-sm text-gray-300">
        <p>Cloud Cover: ${currentWeather.clouds}%</p>
        <p>Humidity: ${currentWeather.humidity}%</p>
        <p>Wind: ${currentWeather.windSpeed} km/h</p>
      </div>
  </div>
`;

  forecastElement.innerHTML = '';

  currentWeather.forecast.forEach((item, i) => {
    const forecast = document.createElement('div');
    forecast.className = 'text-center flex flex-col items-center justify-center';
    forecast.innerHTML = `
    <div class="flex flex-col items-center rounded-lg p-2 ">
      <p class="text-sm text-gray-300 font-medium mb-1">+${(i + 1) * 3}h</p>
      <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png"
           alt="Weather icon"
           class="mx-auto w-12 h-12">
      <p class="text-lg font-semibold text-gray-300">${Math.round(item.main.temp)}°C</p>
      <p class="text-sm text-gray-400">${item.clouds.all}% clouds</p>
    </div>
  `;
    forecastElement.appendChild(forecast);
  });
}

//initialize the weather tracking on the page
async function initWeatherTracking() {
  const forecastElement = document.getElementById('forecast-weather');
  const currentElement = document.getElementById('current-weather');
  const errorElement = document.getElementById('weather-error');

  try {
    if (window.location.protocol !== 'https:') {
      throw new Error('Secure connection required');
    }
      // use geolocation to get current users position
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const apiKey = '6f2f23303708a60e0bba222fbf816d1b'; //cant use .env in html..
    
    const weatherData = await fetchWeatherData(latitude, longitude, apiKey);
    const currentWeather = getCurrentWeather(weatherData);
    updateWeatherDisplay(currentWeather, forecastElement, currentElement);

    //update automatically every 30mins
    setInterval(async () => {
      const newData = await fetchWeatherData(latitude, longitude, apiKey);
      const newCurrent = getCurrentWeather(newData);
      updateWeatherDisplay(newCurrent, forecastElement, currentElement);
    }, 1800000);

  } catch (error) {
    console.error('Weather tracking error:', error);
    if (errorElement) {
      errorElement.textContent = error.message === 'Secure connection required'
        ? 'Secure connection has not been established'
        : 'Unable to fetch weather data. Please enable location services and refresh.';
    }
  }
}

//expose init function to window object and export for use
window.initWeatherTracking = initWeatherTracking;
export { initWeatherTracking };