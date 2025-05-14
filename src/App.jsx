import React, { useState, useEffect } from 'react';
import warmBg from './assets/images/warm-bg.jpg';
import rainyBg from './assets/images/rainy-bg.png';
import snowyBg from './assets/images/snowy-bg.png';
import hotBg from './assets/images/hot-bg.png';
import coldBg from './assets/images/cold-bg.jpg';


// API Setup
const api = {
  key: '88a9b5e4883943b2c4b38f82a28f4a9b',
  base: 'https://api.openweathermap.org/data/2.5/',
};

export default function App() {
  // State variables
  const [weather, setWeather] = useState(null);    // For storing weather data
  const [query, setQuery] = useState('');          // For storing the city input
  const [error, setError] = useState(null);         // For storing error messages
  const [loading, setLoading] = useState(false);    // For managing loading state
  const [searched, setSearched] = useState(false);  // For managing whether a search has been made
  const [originalTemp, setOriginalTemp] = useState(null);
  const [originalFeelsLike, setOriginalFeelsLike] = useState(null);
  const [tempUnit, setTempUnit] = useState('metric'); // For storing temperature unit (metric = Celsius, imperial = Fahrenheit)
  const [backgroundImage, setBackgroundImage] = useState(''); // For storing background image

  const backgroundImages = {
    clear: `url(${warmBg})`,
    rain: `url(${rainyBg})`,
    snow: `url(${snowyBg})`,
    hot: `url(${hotBg})`,
    cold: `url(${coldBg})`,
  };

  // Helper function to build date
  const dateBuilder = (d) => {
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    let day = days[d.getDay()];
    let month = months[d.getMonth()];
    let date = d.getDate();
    let year = d.getFullYear();

    return `${day} ${date} ${month} ${year}`;
  };

  // Function to fetch weather based on city name
  const fetchWeather = (city) => {
    if (!city) return;

    setLoading(true);  // Start loading
    setError(null);    // Reset error before fetching

    fetch(`${api.base}weather?q=${city}&units=metric&appid=${api.key}`)
      .then(res => res.json())
      .then(result => {
        if (result.cod === 200) {
          console.log('Weather API result:', result)
          setWeather(result);
          setBackgroundImage(getWeatherBackground(result));  // Set dynamic background
          setOriginalTemp(result.main.temp); // Save original Celsius
          setOriginalFeelsLike(result.main.feels_like);
          localStorage.setItem('lastCity', city)
          setError(null);  // Clear previous errors
        } else if (result.cod === "404") {
          setError("City not found. Please try again.");
          setWeather(null);  // Reset weather data if city not found
        } else {
          setError("Failed to fetch data. Please check your connection.");
          setWeather(null);  // Reset weather data on general failure
        }
        setLoading(false);  // End loading
      })
      .catch(() => {
        setError("An error occurred while fetching the weather data.");
        setWeather(null);  // Reset weather data on error
        setLoading(false);  // End loading
      });

    setSearched(true);  // Mark search as done
  };

  // Helper function to get background image based on weather
  const getWeatherBackground = (weatherData) => {
    const mainWeather = weatherData.weather[0].main.toLowerCase();
    if (mainWeather === "clear") {
      return backgroundImages.clear;
    } else if (mainWeather === "rain") {
      return backgroundImages.rain;
    } else if (mainWeather === "snow") {
      return backgroundImages.snow;
    } else if (weatherData.main.temp > 30) {
      return backgroundImages.hot;
    } else if (weatherData.main.temp < 0) {
      return backgroundImages.cold;
    }
    return backgroundImages.clear;  // Default
  };

  // Event handler for search input
  const search = (evt) => {
    if (evt.key === "Enter") {
      fetchWeather(query.trim());  // Fetch weather on Enter key press
      setQuery('');
    }
  };

  // Temperature conversion logic
  const convertTemperature = (temp, unit) => {
    if (unit === 'imperial') {
      return (temp * 9 / 5) + 32; // Convert Celsius to Fahrenheit
    }
    return temp;
  };

  // Handle toggle between Celsius and Fahrenheit
  const toggleUnit = () => {
    const newUnit = tempUnit === 'metric' ? 'imperial' : 'metric';
    setTempUnit(newUnit);
    if (originalTemp !== null && originalFeelsLike !== null) {
      const newTemp = newUnit === 'imperial' ? convertTemperature(originalTemp, 'imperial') : originalTemp;

      const convertedFeelsLike = newUnit === 'imperial' ? convertTemperature(originalFeelsLike, 'imperial') : originalFeelsLike;

      setWeather(prev => ({
        ...prev,
        main: { ...prev.main, temp: newTemp, feels_like: convertedFeelsLike },
      }));
    }
  };

  // Reset the search to search again
  const resetSearch = () => {
    setQuery('');
    setWeather(null);
    setError(null);
    setSearched(false);
    setBackgroundImage('');
  };

  useEffect(() => {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) fetchWeather(lastCity);
  }, []);

  return (
    <div style={{ backgroundImage: backgroundImage, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' , minHeight: '100vh' }}>

      <main className="container">
        {/* Search bar */}
        <header className='search-box'>
          <input
            type="text"
            className='search-bar'
            placeholder='Search...'
            onChange={e => setQuery(e.target.value)}  // Update query state
            value={query}
            onKeyDown={search}  // Trigger search on Enter key press
            aria-label="Search city"
          />
        </header>

        {/* Loading Spinner */}
        {loading && (
          <section className="loading">
            <div id="loading-spinner">Loading...</div>
          </section>
        )}

        {/* Error Message */}
        {searched && error && !loading && (
          <section className="error">
            <div id="error-message">{error}</div>
          </section>
        )}

        {/* Weather data */}
        {weather && !loading && !error && (
          <section>
            <header className='location-box'>
              <h1 className='location'>{weather.name}, {weather.sys.country}</h1>
              <p className='date'>{dateBuilder(new Date())}</p>
            </header>

            <article className='weather-box'>
              <p className='temp'>{Math.round(weather.main.temp)}°C</p>
              <div className='weather-box-'>
                <img
                  src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                  alt={weather.weather[0].description}
                  className="weather-icon"
                />
                <p className='weather'>{weather.weather[0].description}</p>
              </div>
              <p className='feels-like'>Feels like: {Math.round(weather.main.feels_like)}°C</p>

              <div className="weather-details">
                <p>Humidity: {weather.main.humidity}%</p> 
                <p> Wind: {Math.round(weather.wind.speed)} m/s</p>
                <p> Pressure: {weather.main.pressure} hPa</p>
              </div>
            </article>

            {/* Temperature Unit Toggle */}
            <div className='unit-toggle'>
              <button onClick={toggleUnit}>
                Switch to °{tempUnit === 'metric' ? 'F' : 'C'}
              </button>
            </div>

            <button onClick={resetSearch}>Reset</button>
          </section>
        )}
      </main>
    </div>
  );
}
