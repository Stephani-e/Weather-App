# React Weather App with Dynamic Backgrounds

A simple and visually responsive weather forecast application using the OpenWeatherMap API, built with React. It supports temperature unit conversion, handles errors, shows dynamic background images based on weather conditions, and remembers your last searched city.

## Demo

🔗 **Live Demo:** https://weather-app-pink-ten-56.vercel.app/

## Features

- Search weather by city name
- Toggle between Celsius and Fahrenheit
- Dynamic background based on weather condition or temperature
- Persists the last searched city using localStorage
- Displays user-friendly error messages
- Reset button to start a new search

## Backgrounds

The background changes depending on:
- Clear weather: Warm background
- Rain: Rainy background
- Snow: Snowy background
- Hot (>30°C): Hot background
- Cold (<0°C): Cold background

## Tech Stack
- React – Component-based UI and state management for search, loading, errors, and weather display. 
- JavaScript (ES6+) – Async fetch, hooks, and modern language features for API calls and logic. 
- CSS3 – Custom responsive layout and glassmorphism-style weather card design. 
- OpenWeatherMap API – Current weather data by city name, with dynamic icons and background changes. 
- LocalStorage – Persisting the last searched city across page reloads.

## Project Structure

- `src/`
    - `assets/`
       - `images`
    - `App.jsx`
    - `index.css`
    - `main.jsx`

## Getting Started

1. Clone the repository:
   ```bash
   https://github.com/Stephani-e/Weather-App.git
   cd ToDo-List
2. Install Dependencies:
   ```bash
   npm install
3. Start the development server
   ```bash
   npm run dev


