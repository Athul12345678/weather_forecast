import { DateTime } from "luxon";

const API_KEY = import.meta.env.VITE_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

const getWeatherData = async (infoType, searchParams) => {
  const url = new URL(BASE_URL + "/" + infoType);
  url.search = new URLSearchParams({
    ...searchParams,
    appid: API_KEY,
    units: 'metric'
  }).toString();

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
};

const formatCurrentWeather = (data) => {
  const {
    coord: { lat, lon },
    main: { temp, feels_like, temp_min, temp_max, humidity },
    name,
    dt,
    sys: { country, sunrise, sunset },
    weather,
    wind: { speed }
  } = data;

  const { main: details, icon } = weather[0];

  return {
    lat, lon, temp, feels_like, temp_min, temp_max,
    humidity, name, dt, country, sunrise, sunset,
    details, icon, speed
  };
};

const formatForecastWeather = (data) => {
  let { city, list } = data;
  const timezone = city.timezone;

  // Format daily forecast (every 24 hours)
  const daily = list
    .filter((item, index) => index % 8 === 0) // Every 24 hours (3 hour intervals * 8)
    .slice(0, 5)
    .map(d => ({
      title: formatToLocalTime(d.dt, timezone, 'ccc'),
      temp: d.main.temp,
      icon: d.weather[0].icon
    }));

  // Format hourly forecast (next 5 entries)
  const hourly = list.slice(1, 6).map(d => ({
    title: formatToLocalTime(d.dt, timezone, 'hh:mm a'),
    temp: d.main.temp,
    icon: d.weather[0].icon
  }));

  return { timezone, daily, hourly };
};

const getFormattedWeatherData = async (searchParams) => {
  try {
    const currentWeather = await getWeatherData('weather', searchParams);
    const formattedCurrentWeather = formatCurrentWeather(currentWeather);

    const { lat, lon } = formattedCurrentWeather;

    // Use the 5 day / 3 hour forecast endpoint instead of onecall
    const forecastData = await getWeatherData('forecast', {
      lat, lon,
      units: searchParams.units
    });
    const formattedForecastWeather = formatForecastWeather(forecastData);

    return { ...formattedCurrentWeather, ...formattedForecastWeather };
  } catch (error) {
    console.error("Failed to format weather data:", error);
    throw error;
  }
};

const formatToLocalTime = (
  secs,
  zone,
  format = "cccc, dd LLL yyyy' | Local time: 'hh:mm a"
) => DateTime.fromSeconds(secs).toFormat(format);

const iconUrlFromCode = (code) => 
  `http://openweathermap.org/img/wn/${code}@2x.png`;

export default getFormattedWeatherData;
export { formatToLocalTime, iconUrlFromCode };