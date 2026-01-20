import React, { useState, useEffect, useCallback } from 'react';
import warmBg from './assets/images/warm-bg.jpg';
import rainyBg from './assets/images/rainy-bg.png';
import snowyBg from './assets/images/snowy-bg.png';
import hotBg from './assets/images/hot-bg.png';
import coldBg from './assets/images/cold-bg.jpg';

// API Setup
const api = {
  key: '810eb748de8c0f460f0084404722b16a',
  base: 'https://api.openweathermap.org/data/2.5/',
};

export default function App() {
  const [weather, setWeather] = useState(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [originalTemp, setOriginalTemp] = useState(null);
  const [originalFeelsLike, setOriginalFeelsLike] = useState(null);
  const [tempUnit, setTempUnit] = useState('metric'); // 'metric' | 'imperial'
  const [backgroundImage, setBackgroundImage] = useState('');

  const backgroundImages = {
    clear: `url(${warmBg})`,
    rain: `url(${rainyBg})`,
    snow: `url(${snowyBg})`,
    hot: `url(${hotBg})`,
    cold: `url(${coldBg})`,
  };

  const dateBuilder = (d) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const day = days[d.getDay()];
    const month = months[d.getMonth()];
    const date = d.getDate();
    const year = d.getFullYear();

    return `${day} ${date} ${month} ${year}`;
  };

  const getWeatherBackground = (weatherData) => {
    const mainWeather = weatherData.weather?.[0]?.main?.toLowerCase() || '';
    if (mainWeather === 'clear') return backgroundImages.clear;
    if (mainWeather === 'rain') return backgroundImages.rain;
    if (mainWeather === 'snow') return backgroundImages.snow;
    if (weatherData.main.temp > 30) return backgroundImages.hot;
    if (weatherData.main.temp < 0) return backgroundImages.cold;
    return backgroundImages.clear;
  };

  const convertTemperature = (temp, unit) => {
    if (unit === 'imperial') {
      return (temp * 9) / 5 + 32; // C → F
    }
    return temp;
  };

  const fetchWeather = useCallback((city) => {
    if (!city) return;

    setLoading(true);
    setError(null);

    fetch(`${api.base}weather?q=${encodeURIComponent(city)}&units=metric&appid=${api.key}`)
        .then((res) => res.json())
        .then((result) => {
          const code = result.cod;

          if (code === 200 || code === '200') {
            setWeather(result);
            setBackgroundImage(getWeatherBackground(result));
            setOriginalTemp(result.main.temp);
            setOriginalFeelsLike(result.main.feels_like);
            localStorage.setItem('lastCity', city);
            setError(null);
          } else if (code === 404 || code === '404') {
            setError('City not found. Please try again.');
            setWeather(null);
          } else {
            setError('Failed to fetch data. Please check your connection.');
            setWeather(null);
          }
          setLoading(false);
        })
        .catch(() => {
          setError('An error occurred while fetching the weather data.');
          setWeather(null);
          setLoading(false);
        });

    setSearched(true);
  }, []);

  const search = (evt) => {
    if (evt.key === 'Enter') {
      fetchWeather(query.trim());
      // Remove this line if you want to keep the text in the input:
      setQuery('');
    }
  };

  const toggleUnit = () => {
    const newUnit = tempUnit === 'metric' ? 'imperial' : 'metric';
    setTempUnit(newUnit);

    if (originalTemp !== null && originalFeelsLike !== null && weather) {
      const newTemp =
          newUnit === 'imperial'
              ? convertTemperature(originalTemp, 'imperial')
              : originalTemp;
      const convertedFeelsLike =
          newUnit === 'imperial'
              ? convertTemperature(originalFeelsLike, 'imperial')
              : originalFeelsLike;

      setWeather((prev) =>
          prev
              ? {
                ...prev,
                main: {
                  ...prev.main,
                  temp: newTemp,
                  feels_like: convertedFeelsLike,
                },
              }
              : prev
      );
    }
  };

  const resetSearch = () => {
    setQuery('');
    setWeather(null);
    setError(null);
    setSearched(false);
    setBackgroundImage('');
    setTempUnit('metric');
  };

  useEffect(() => {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
      fetchWeather(lastCity);
    }
  }, [fetchWeather]);

  return (
      <div
          style={{
            backgroundImage: backgroundImage,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            minHeight: '100vh',
          }}
      >
        <main className="container">
          {/* Search bar */}
          <header className="search-box">
            <input
                type="text"
                className="search-bar"
                placeholder="Search..."
                onChange={(e) => setQuery(e.target.value)}
                value={query}
                onKeyDown={search}
                aria-label="Search city"
            />
          </header>

          {/* Loading */}
          {loading && (
              <section className="loading">
                <div id="loading-spinner">Loading...</div>
              </section>
          )}

          {/* Error */}
          {searched && error && !loading && (
              <section className="error">
                <div id="error-message">{error}</div>
              </section>
          )}

          {/* Weather data */}
          {weather && !loading && !error && (
              <section className='weather-card'>
                <header className="location-box">
                  <h1 className="location">
                    {weather.name}
                    {weather.sys?.country ? `, ${weather.sys.country}` : ''}
                  </h1>
                  <p className="date">{dateBuilder(new Date())}</p>
                </header>

                <article className="weather-box">
                  <p className="temp">
                    {Math.round(weather.main.temp)}°
                    {tempUnit === 'metric' ? 'C' : 'F'}
                  </p>

                  {weather.weather && weather.weather[0] && (
                      <div className="weather-box-">
                        <img
                            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                            alt={weather.weather[0].description}
                            className="weather-icon"
                        />
                        <p className="weather">{weather.weather[0].description}</p>
                      </div>
                  )}

                  <p className="feels-like">
                    Feels like: {Math.round(weather.main.feels_like)}°
                    {tempUnit === 'metric' ? 'C' : 'F'}
                  </p>

                  <div className="weather-details">
                    <p>Humidity: {weather.main.humidity ?? '--'}%</p>
                    <p>
                      Wind:{' '}
                      {weather.wind && weather.wind.speed !== undefined
                          ? Math.round(weather.wind.speed)
                          : '--'}{' '}
                      m/s
                    </p>
                    <p>Pressure: {weather.main.pressure ?? '--'} hPa</p>
                  </div>
                </article>

                <div className="unit-toggle">
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
