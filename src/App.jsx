import { useEffect, useState } from 'react';
import './App.css';
import TopButtons from './components/TopButtons';
import Inputs from './components/Inputs';
import TimeandLocation from './components/TimeandLocation';
import Temperature from './components/Temperature';
import Forecast from './components/Forecast';
import getformatweatherdata from './services/Weatherservices';

function App() {
  const [query, setQuery] = useState({ q: 'berlin' });
  const [units, setUnits] = useState('metric');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      // Add this temporarily to your App.jsx useEffect
console.log("API Key being used:", import.meta.env.VITE_API_KEY);
      try {
        setLoading(true);
        setError(null);
        const data = await getformatweatherdata({ ...query, units });
        setWeather(data);
      } catch (err) {
        setError(err.message || "Failed to fetch weather data");
        console.error("Error fetching weather:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [query, units]);

  const formatbackground=()=>{
    if(!weather) return 'from-cyan-700 to-blue-700'
    const threshold=units === 'metric' ?20:60
    if (weather.temp<threshold) return 'from-cyan-700 to-blue-700'
    return 'from-yellow-700 to-orange-700'
  }

  return (
    <div className={`mx-auto max-w-screen-md mt-4 py-5 px-32 bg-gradient-to-br from-cyan-700 to-blue-700 h-fit shadow-xl shadow-gray-400 ${formatbackground()}`}>
      <TopButtons setQuery={setQuery} />
      <Inputs setQuery={setQuery} setUnits={setUnits} />
      
      {loading && <p className="text-white text-center">Loading...</p>}
      {error && <p className="text-red-300 text-center">{error}</p>}
      
      {weather && (
        <div>
          <TimeandLocation weather={weather} />
          <Temperature weather={weather} />
          <Forecast title="hourly forecast" items={weather.hourly} />
          <Forecast title="daily forecast" items={weather.daily} />
        </div>
      )}
    </div>
  );
}

export default App;