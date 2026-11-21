
"use client";

import { useEffect, useState } from "react";
import {
  CloudSun,
  Search,
  MapPin,
  Sun,
  Cloud,
  CloudRain,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  CalendarDays,
  Thermometer,
  CloudFog,
  LoaderCircle,
} from "lucide-react";

function getWeatherInfo(code) {
  if (code === 0) return { label: "Clear Sky", icon: Sun };
  if ([1, 2].includes(code)) return { label: "Partly Cloudy", icon: CloudSun };
  if (code === 3) return { label: "Overcast", icon: Cloud };
  if ([45, 48].includes(code)) return { label: "Foggy", icon: CloudFog };
  if ([51, 53, 55, 56, 57].includes(code))
    return { label: "Drizzle", icon: CloudRain };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return { label: "Rainy", icon: CloudRain };
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return { label: "Snowy", icon: Cloud };
  if ([95, 96, 99].includes(code))
    return { label: "Thunderstorm", icon: CloudRain };

  return { label: "Unknown", icon: Cloud };
}

function formatTime(value) {
  if (!value) return "--";
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function WeatherStat({ icon: Icon, label, value, description }) {
  return (
    <div className="rounded-2xl border border-emerald-400/10 bg-[#123326]/85 p-5 transition hover:border-emerald-400/30 hover:bg-emerald-900/30">
      <div className="flex items-center gap-3 text-emerald-100/60">
        <Icon size={19} className="text-emerald-400" />
        <span className="text-sm">{label}</span>
      </div>
      <h3 className="mt-4 text-2xl font-semibold text-white">{value}</h3>
      <p className="mt-1 text-xs text-emerald-100/60">{description}</p>
    </div>
  );
}

export default function Home() {
  const [city, setCity] = useState("Kolhapur");
  const [searchInput, setSearchInput] = useState("");
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchWeather(cityName) {
    try {
      setLoading(true);
      setError("");

      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
      );

      if (!geoResponse.ok) throw new Error("Unable to search for this city.");

      const geoData = await geoResponse.json();
      const place = geoData.results?.[0];

      if (!place) throw new Error("City not found. Please try another name.");

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,cloud_cover,pressure_msl,wind_speed_10m&hourly=temperature_2m,weather_code,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=5`
      );

      if (!weatherResponse.ok) throw new Error("Unable to load weather data.");

      const data = await weatherResponse.json();

      setLocation(place);
      setWeather(data);
      setCity(place.name);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWeather("Kolhapur");
  }, []);

  function handleSearch(event) {
    event.preventDefault();

    const value = searchInput.trim();
    if (!value) return;

    fetchWeather(value);
    setSearchInput("");
  }

  const current = weather?.current;
  const hourly = weather?.hourly;
  const daily = weather?.daily;

  const currentInfo = current
    ? getWeatherInfo(current.weather_code)
    : { label: "Loading...", icon: CloudSun };

  const CurrentIcon = currentInfo.icon;

  const currentHourIndex = hourly?.time.findIndex(
    (time) => time === current?.time
  );

  const hourlyItems =
    hourly && currentHourIndex >= 0
      ? hourly.time.slice(currentHourIndex, currentHourIndex + 6).map((time, i) => {
          const index = currentHourIndex + i;
          return {
            time: i === 0 ? "Now" : formatTime(time),
            temp: Math.round(hourly.temperature_2m[index]),
            icon: getWeatherInfo(hourly.weather_code[index]).icon,
          };
        })
      : [];

  const weeklyItems = daily
    ? daily.time.map((date, index) => ({
        day: new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
          weekday: "long",
        }),
        date: new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        }),
        icon: getWeatherInfo(daily.weather_code[index]).icon,
        condition: getWeatherInfo(daily.weather_code[index]).label,
        high: Math.round(daily.temperature_2m_max[index]),
        low: Math.round(daily.temperature_2m_min[index]),
      }))
    : [];

  const visibilityIndex = hourly?.time.findIndex(
    (time) => time === current?.time
  );
  const visibility = visibilityIndex >= 0
    ? `${(hourly.visibility[visibilityIndex] / 1000).toFixed(1)} km`
    : "--";

  return (
    <div className="min-h-screen">
      <header className="border-b border-emerald-400/10 bg-[#071711]/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-2.5 text-emerald-400">
              <CloudSun size={25} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Weatherly<span className="text-emerald-400">.</span>
              </h1>
              <p className="text-[11px] tracking-wide text-emerald-100/50">
                YOUR WEATHER COMPANION
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-sm text-emerald-100/60 sm:flex">
            <CalendarDays size={16} className="text-emerald-400" />
            <span>Weather Dashboard</span>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-medium tracking-widest text-emerald-400">
            WEATHER OVERVIEW
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Good day!
          </h2>
          <p className="mt-2 text-sm text-emerald-100/60">
            Check the weather and plan your day.
          </p>
        </div>

        <form onSubmit={handleSearch} className="mb-8 flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-emerald-400/15 bg-[#123326]/85 px-4 py-3.5 focus-within:border-emerald-400/40">
            <Search size={20} className="text-emerald-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              type="text"
              placeholder="Search for a city..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-emerald-200/40"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-500 disabled:opacity-60"
          >
            {loading ? <LoaderCircle size={17} className="animate-spin" /> : <Search size={17} />}
            Search
          </button>
        </form>

        {error && (
          <div className="mb-6 rounded-xl border border-red-400/30 bg-red-950/30 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading && !weather ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-emerald-300">
            <LoaderCircle className="animate-spin" />
            Loading weather for Kolhapur...
          </div>
        ) : weather && current ? (
          <>
            <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              <div className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-600/25 via-green-800/20 to-[#123326]/95 p-7 shadow-2xl shadow-emerald-950/30 sm:p-9">
                <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
                <div className="relative">
                  <div className="flex items-center gap-2 text-sm text-emerald-200">
                    <MapPin size={17} />
                    <span>{location?.name}, {location?.admin1}, {location?.country}</span>
                  </div>
                  <p className="mt-8 text-sm font-medium tracking-wider text-emerald-100/70">
                    CURRENT WEATHER
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-5">
                    <div>
                      <h3 className="text-7xl font-light tracking-tighter text-white sm:text-8xl">
                        {Math.round(current.temperature_2m)}°
                      </h3>
                      <p className="mt-3 text-xl font-medium text-white">
                        {currentInfo.label}
                      </p>
                      <p className="mt-1 text-sm text-emerald-100/60">
                        Feels like {Math.round(current.apparent_temperature)}°
                      </p>
                    </div>
                    <CurrentIcon size={125} strokeWidth={1} className="text-emerald-200" />
                  </div>
                  <div className="mt-9 flex flex-wrap gap-6 border-t border-emerald-300/15 pt-6 text-sm text-emerald-100/70">
                    <div className="flex items-center gap-2">
                      <Sunrise size={19} className="text-amber-300" />
                      <span>Sunrise {formatTime(daily?.sunrise[0])}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sunset size={19} className="text-orange-300" />
                      <span>Sunset {formatTime(daily?.sunset[0])}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <WeatherStat icon={Thermometer} label="Feels Like" value={`${Math.round(current.apparent_temperature)}°`} description="Perceived temperature" />
                <WeatherStat icon={Droplets} label="Humidity" value={`${current.relative_humidity_2m}%`} description="Relative humidity" />
                <WeatherStat icon={Wind} label="Wind Speed" value={`${current.wind_speed_10m} km/h`} description="Current wind speed" />
                <WeatherStat icon={Gauge} label="Pressure" value={`${Math.round(current.pressure_msl)} hPa`} description="Sea-level pressure" />
                <WeatherStat icon={Eye} label="Visibility" value={visibility} description="Current visibility" />
                <WeatherStat icon={Cloud} label="Cloud Cover" value={`${current.cloud_cover}%`} description="Sky cloud coverage" />
              </div>
            </section>

            <section className="mt-10">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">Hourly Forecast</h3>
                  <p className="mt-1 text-sm text-emerald-100/60">Weather over the next few hours</p>
                </div>
                <span className="text-xs font-medium text-emerald-400">Next 6 hours</span>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {hourlyItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.time} className="flex flex-col items-center rounded-2xl border border-emerald-400/10 bg-[#123326]/75 p-4 transition hover:-translate-y-1 hover:border-emerald-400/30">
                      <p className="text-xs text-emerald-100/60">{item.time}</p>
                      <Icon size={30} className="my-4 text-emerald-300" />
                      <p className="text-xl font-semibold text-white">{item.temp}°</p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="mt-10 pb-10">
              <div className="mb-5">
                <h3 className="text-xl font-semibold text-white">5-Day Forecast</h3>
                <p className="mt-1 text-sm text-emerald-100/60">Upcoming weather conditions</p>
              </div>
              <div className="overflow-hidden rounded-2xl border border-emerald-400/10 bg-[#123326]/65">
                {weeklyItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.date} className="grid grid-cols-[1fr_1fr_1.5fr_1fr] items-center gap-2 border-b border-emerald-400/[0.07] px-4 py-4 transition last:border-0 hover:bg-emerald-900/20 sm:px-6">
                      <div>
                        <p className="text-sm font-medium text-white">{item.day}</p>
                        <p className="mt-1 text-xs text-emerald-100/60">{item.date}</p>
                      </div>
                      <Icon size={25} className="text-emerald-300" />
                      <p className="hidden text-sm text-emerald-100/60 sm:block">{item.condition}</p>
                      <div className="flex justify-end gap-3 text-sm">
                        <span className="font-semibold text-white">{item.high}°</span>
                        <span className="text-emerald-100/40">{item.low}°</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        ) : null}

        <footer className="border-t border-emerald-400/10 py-6 text-center">
          <p className="text-xs text-emerald-100/40">
            Weatherly · Your weather companion · Weather data by Open-Meteo
          </p>
        </footer>
      </main>
    </div>
  );
}
