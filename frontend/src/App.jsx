
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Leaf, Sprout, CloudSun, ScanSearch, Calculator, TrendingUp,
  Menu, X, Upload, Image as ImageIcon, ArrowRight, ShieldCheck,
  Droplets, Sun, CheckCircle2, AlertCircle, LoaderCircle,
  CloudRain, MapPin, RefreshCw, Wind, Thermometer, Cloud,
  CloudLightning, CloudDrizzle,
} from "lucide-react";

import { predictPlantDisease } from "./services/mlApi";
import Marketplace from "./components/Marketplace";
import DemoMarketPrices from "./components/DemoMarketPrices";
import LanguageSwitcher from "./components/LanguageSwitcher";
import "./App.css";

const crops = [
  { id: "rice", name: "Rice", bn: "ধান", emoji: "🌾", color: "rice" },
  { id: "potato", name: "Potato", bn: "আলু", emoji: "🥔", color: "potato" },
  { id: "tomato", name: "Tomato", bn: "টমেটো", emoji: "🍅", color: "tomato" },
  { id: "maize", name: "Maize", bn: "ভুট্টা", emoji: "🌽", color: "maize" },
];

const weatherIcon = (code) => {
  if ([0, 1].includes(code)) return Sun;
  if ([2, 3].includes(code)) return CloudSun;
  if ([45, 48].includes(code)) return Cloud;

  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return CloudRain;
  }

  if ([95, 96, 99].includes(code)) return CloudLightning;

  return CloudDrizzle;
};

const checkFarmerAuthentication = () => {
  try {
    const token = localStorage.getItem("agrisense_token");
    if (!token) return false;

    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) return false;

    let payloadString = tokenParts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    payloadString += "=".repeat(
      (4 - (payloadString.length % 4)) % 4
    );

    const payload = JSON.parse(atob(payloadString));

    if (String(payload.role || "").toUpperCase() !== "FARMER") {
      return false;
    }

    if (!payload.exp || payload.exp * 1000 <= Date.now()) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

function App() {
  const { i18n } = useTranslation();
  const isBangla = i18n.language?.startsWith("bn");

  // UI translation helper. API and database values remain unchanged.
  const tx = (english, bangla) => isBangla ? bangla : english;

  const weatherDescription = (code) => {
    if (code === 0) return tx("Clear sky", "পরিষ্কার আকাশ");
    if ([1, 2].includes(code)) return tx("Partly cloudy", "আংশিক মেঘলা");
    if (code === 3) return tx("Overcast", "মেঘাচ্ছন্ন");
    if ([45, 48].includes(code)) return tx("Foggy", "কুয়াশাচ্ছন্ন");
    if ([51, 53, 55].includes(code)) return tx("Drizzle", "গুঁড়ি গুঁড়ি বৃষ্টি");
    if ([56, 57].includes(code)) return tx("Freezing drizzle", "হিমশীতল গুঁড়ি বৃষ্টি");
    if ([61, 63, 65].includes(code)) return tx("Rain", "বৃষ্টি");
    if ([66, 67].includes(code)) return tx("Freezing rain", "হিমশীতল বৃষ্টি");
    if ([71, 73, 75, 77].includes(code)) return tx("Snow", "তুষারপাত");
    if ([80, 81, 82].includes(code)) return tx("Rain showers", "বৃষ্টির ঝাপটা");
    if ([85, 86].includes(code)) return tx("Snow showers", "তুষারপাতের ঝাপটা");
    if ([95, 96, 99].includes(code)) return tx("Thunderstorm", "বজ্রঝড়");
    return tx("Weather information", "আবহাওয়ার তথ্য");
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState("rice");

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fileInput = useRef(null);

  // Farmer-only calculator states.
  const [landArea, setLandArea] = useState(1);
  const [fertilizerRate, setFertilizerRate] = useState(20);
  const [totalCost, setTotalCost] = useState(10000);
  const [expectedRevenue, setExpectedRevenue] = useState(15000);

  // Authentication.
  const [isLoggedInFarmer, setIsLoggedInFarmer] = useState(
    checkFarmerAuthentication
  );

  // Public weather states.
  const [weatherLocation, setWeatherLocation] = useState("Dhaka");
  const weatherLocationRef = useRef("Dhaka");
  const weatherRequestRef = useRef(0);

  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const closeMenu = () => setMenuOpen(false);

  // Keep Farmer access updated after login/logout.
  useEffect(() => {
    const updateAuthentication = () => {
      setIsLoggedInFarmer(checkFarmerAuthentication());
    };

    updateAuthentication();

    window.addEventListener("storage", updateAuthentication);
    window.addEventListener("focus", updateAuthentication);
    window.addEventListener("agrisense-auth-changed", updateAuthentication);

    const authInterval = setInterval(updateAuthentication, 3000);

    return () => {
      window.removeEventListener("storage", updateAuthentication);
      window.removeEventListener("focus", updateAuthentication);
      window.removeEventListener("agrisense-auth-changed", updateAuthentication);
      clearInterval(authInterval);
    };
  }, []);

  // Public weather loader.
  const loadWeather = async (
    location = weatherLocationRef.current
  ) => {
    const searchLocation = String(location || "").trim();

    if (!searchLocation) {
      setWeatherError(tx(
        "Please enter your city or location.",
        "আপনার শহর বা এলাকার নাম লিখুন।"
      ));
      return;
    }

    const requestId = ++weatherRequestRef.current;

    setWeatherLoading(true);
    setWeatherError("");

    try {
      const geoUrl = new URL(
        "https://geocoding-api.open-meteo.com/v1/search"
      );

      geoUrl.searchParams.set("name", searchLocation);
      geoUrl.searchParams.set("count", "10");
      geoUrl.searchParams.set("language", "en");
      geoUrl.searchParams.set("format", "json");
      geoUrl.searchParams.set("countryCode", "BD");

      const geoResponse = await fetch(geoUrl.toString());

      if (!geoResponse.ok) {
        throw new Error(tx(
          "Unable to search for this location.",
          "এই এলাকার তথ্য খুঁজে পাওয়া যাচ্ছে না।"
        ));
      }

      const geoData = await geoResponse.json();
      const results = geoData.results || [];

      if (!results.length) {
        throw new Error(tx(
          "Location not found in Bangladesh. Please check the spelling and try again.",
          "বাংলাদেশে এই এলাকার তথ্য পাওয়া যায়নি। বানান পরীক্ষা করে আবার চেষ্টা করুন।"
        ));
      }

      const normalizedSearch = searchLocation.toLowerCase();

      const place =
        results.find(
          (item) =>
            item.name?.toLowerCase() === normalizedSearch &&
            item.country_code === "BD"
        ) ||
        results.find((item) => item.country_code === "BD") ||
        results[0];

      const forecastUrl = new URL(
        "https://api.open-meteo.com/v1/forecast"
      );

      forecastUrl.searchParams.set("latitude", place.latitude);
      forecastUrl.searchParams.set("longitude", place.longitude);

      forecastUrl.searchParams.set(
        "current",
        [
          "temperature_2m",
          "relative_humidity_2m",
          "apparent_temperature",
          "precipitation",
          "weather_code",
          "wind_speed_10m",
        ].join(",")
      );

      forecastUrl.searchParams.set(
        "hourly",
        "precipitation,precipitation_probability,temperature_2m"
      );

      forecastUrl.searchParams.set(
        "daily",
        "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max"
      );

      forecastUrl.searchParams.set("forecast_days", "5");
      forecastUrl.searchParams.set("timezone", "auto");
      forecastUrl.searchParams.set("cell_selection", "nearest");
      forecastUrl.searchParams.set("temperature_unit", "celsius");
      forecastUrl.searchParams.set("wind_speed_unit", "kmh");
      forecastUrl.searchParams.set("precipitation_unit", "mm");

      const forecastResponse = await fetch(forecastUrl.toString());

      if (!forecastResponse.ok) {
        throw new Error(tx(
          "Unable to load weather information.",
          "আবহাওয়ার তথ্য লোড করা যাচ্ছে না।"
        ));
      }

      const forecastData = await forecastResponse.json();

      if (!forecastData.current || !forecastData.hourly) {
        throw new Error(tx(
          "Weather data is temporarily unavailable.",
          "আবহাওয়ার তথ্য সাময়িকভাবে পাওয়া যাচ্ছে না।"
        ));
      }

      if (requestId !== weatherRequestRef.current) return;

      const currentTime = forecastData.current.time;
      const hourly = forecastData.hourly;

      const upcomingHours = hourly.time
        .map((time, index) => ({
          time,
          precipitation: Number(hourly.precipitation[index] || 0),
          probability: Number(hourly.precipitation_probability[index] || 0),
          temperature: hourly.temperature_2m[index],
        }))
        .filter((item) => item.time >= currentTime)
        .slice(0, 24);

      const rainfallNext24Hours = upcomingHours.reduce(
        (total, item) => total + item.precipitation,
        0
      );

      const maxRainProbability = Math.max(
        0,
        ...upcomingHours.map((item) => item.probability)
      );

      setWeather({
        location: place.name,
        district: place.admin1 || "",
        country: place.country || "",
        latitude: place.latitude,
        longitude: place.longitude,
        timezone: forecastData.timezone || "",
        current: forecastData.current,
        daily: forecastData.daily,
        rainfallNext24Hours,
        maxRainProbability,
        upcomingHours,
        description: weatherDescription(
          forecastData.current.weather_code
        ),
      });

      setLastUpdated(new Date());
    } catch (err) {
      if (requestId === weatherRequestRef.current) {
        setWeatherError(
          err.message ||
          tx(
            "Unable to load weather information.",
            "আবহাওয়ার তথ্য লোড করা যাচ্ছে না।"
          )
        );
      }
    } finally {
      if (requestId === weatherRequestRef.current) {
        setWeatherLoading(false);
      }
    }
  };

  // Automatically load Dhaka weather and refresh every 15 minutes.
  useEffect(() => {
    loadWeather("Dhaka");

    const refreshInterval = setInterval(() => {
      loadWeather(weatherLocationRef.current);
    }, 15 * 60 * 1000);

    return () => {
      clearInterval(refreshInterval);
      weatherRequestRef.current += 1;
    };
  }, []);

  // Plant image upload.
  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError(tx(
        "Please upload a JPG, PNG or WEBP image.",
        "JPG, PNG অথবা WEBP ছবি আপলোড করুন।"
      ));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(tx(
        "Image size must be less than 5 MB.",
        "ছবির সাইজ ৫ MB-এর কম হতে হবে।"
      ));
      return;
    }

    if (preview) URL.revokeObjectURL(preview);

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setPrediction(null);
    setError("");
  };

  const handlePrediction = async () => {
    if (!image) {
      setError(tx(
        "Please upload a plant leaf image first.",
        "প্রথমে গাছের পাতার একটি ছবি আপলোড করুন।"
      ));
      return;
    }

    setLoading(true);
    setError("");
    setPrediction(null);

    try {
      const result = await predictPlantDisease(selectedCrop, image);
      setPrediction(result);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        tx(
          "Unable to connect to the ML service.",
          "ML সার্ভিসের সঙ্গে সংযোগ করা যাচ্ছে না।"
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = (result) => {
    switch (result?.detection_status) {
      case "success":
        return result.disease_detected
          ? tx(
              "A possible disease condition was identified.",
              "সম্ভাব্য রোগের লক্ষণ শনাক্ত হয়েছে।"
            )
          : tx(
              "The plant appears healthy according to the model.",
              "মডেল অনুযায়ী গাছটি সুস্থ বলে মনে হচ্ছে।"
            );

      case "uncertain":
        return tx(
          "The model is uncertain. Please upload a clearer image.",
          "মডেল নিশ্চিত হতে পারেনি। আরও পরিষ্কার ছবি আপলোড করুন।"
        );

      case "crop_mismatch":
        return tx(
          "The uploaded image may not match your selected crop.",
          "আপলোড করা ছবিটি নির্বাচিত ফসলের সঙ্গে নাও মিলতে পারে।"
        );

      case "unknown":
        return tx(
          "The selected crop could not be reliably confirmed.",
          "নির্বাচিত ফসলটি নির্ভরযোগ্যভাবে শনাক্ত করা যায়নি।"
        );

      default:
        return result?.message || tx(
          "Prediction completed.",
          "বিশ্লেষণ সম্পন্ন হয়েছে।"
        );
    }
  };

  const fertilizerTotal =
    Math.max(0, Number(landArea) || 0) *
    Math.max(0, Number(fertilizerRate) || 0);

  const profitLoss =
    (Number(expectedRevenue) || 0) -
    (Number(totalCost) || 0);

  // Weather-based farming suggestions.
  const getFarmingAdvice = () => {
    if (!weather) return null;

    const rain = weather.rainfallNext24Hours;
    const probability = weather.maxRainProbability;
    const temperature = weather.current.temperature_2m;

    let irrigation;
    let fertilizer;

    if (rain >= 5 || probability >= 80) {
      irrigation = {
        title: tx(
          "Wait before irrigating today",
          "আজ সেচ দেওয়ার আগে অপেক্ষা করুন"
        ),
        description: tx(
          "Rain is possible in the next 24 hours. Check soil moisture. If the soil is already wet, additional irrigation may not be necessary.",
          "আগামী ২৪ ঘণ্টায় বৃষ্টির সম্ভাবনা রয়েছে। জমির মাটির আর্দ্রতা পরীক্ষা করুন। মাটি ভেজা থাকলে অতিরিক্ত সেচের প্রয়োজন নাও হতে পারে।"
        ),
      };
    } else if (rain >= 2 || probability >= 50) {
      irrigation = {
        title: tx(
          "Check the soil before irrigation",
          "সেচ দেওয়ার আগে মাটি পরীক্ষা করুন"
        ),
        description: tx(
          "Light rain is possible. Consider soil moisture, crop age and field condition before deciding to irrigate.",
          "হালকা বৃষ্টির সম্ভাবনা রয়েছে। মাটির আর্দ্রতা, ফসলের বয়স এবং জমির অবস্থা দেখে সেচের সিদ্ধান্ত নিন।"
        ),
      };
    } else {
      irrigation = {
        title: tx(
          "Irrigate if necessary",
          "প্রয়োজন হলে সেচ দিন"
        ),
        description: tx(
          "No significant rainfall is forecast in the next 24 hours. Check whether the soil is dry and irrigate according to crop needs.",
          "আগামী ২৪ ঘণ্টায় উল্লেখযোগ্য বৃষ্টির পূর্বাভাস নেই। মাটি শুকনো কি না পরীক্ষা করে ফসলের প্রয়োজন অনুযায়ী সেচ দিন।"
        ),
      };
    }

    if (rain >= 10 || probability >= 85) {
      fertilizer = {
        title: tx(
          "Consider postponing fertilizer application",
          "আজ সার প্রয়োগ পিছিয়ে দেওয়ার কথা বিবেচনা করুন"
        ),
        description: tx(
          "Heavy rain may wash fertilizer away. Plan application after rainfall decreases and field conditions are suitable.",
          "ভারী বৃষ্টির সম্ভাবনা থাকলে সার ধুয়ে যেতে পারে। বৃষ্টি কমে গেলে এবং জমির অবস্থা উপযুক্ত হলে সার প্রয়োগের পরিকল্পনা করুন।"
        ),
      };
    } else if (rain >= 3 || probability >= 60) {
      fertilizer = {
        title: tx(
          "Check the weather before applying fertilizer",
          "সার দেওয়ার আগে আবহাওয়া দেখুন"
        ),
        description: tx(
          "Rain is possible. Consider soil moisture and the crop's growth stage when planning fertilizer application.",
          "বৃষ্টির সম্ভাবনা রয়েছে। সার প্রয়োগের সময় মাটির আর্দ্রতা এবং ফসলের বৃদ্ধির পর্যায় বিবেচনা করুন।"
        ),
      };
    } else {
      fertilizer = {
        title: tx(
          "Plan fertilizer application if needed",
          "প্রয়োজন হলে সার প্রয়োগের পরিকল্পনা করুন"
        ),
        description: tx(
          "Rain probability is relatively low. Follow the crop stage, soil condition and recommended application rate.",
          "বৃষ্টির সম্ভাবনা তুলনামূলক কম। ফসলের পর্যায়, মাটির অবস্থা এবং সুপারিশকৃত মাত্রা অনুসরণ করুন।"
        ),
      };
    }

    if (temperature >= 35) {
      irrigation.description += tx(
        " Temperatures are high, so monitor plant and soil water needs carefully.",
        " তাপমাত্রা বেশি, তাই গাছ ও মাটির পানির প্রয়োজন বিশেষভাবে পর্যবেক্ষণ করুন।"
      );
    }

    return { irrigation, fertilizer };
  };

  const advice = getFarmingAdvice();

  const CurrentWeatherIcon = weather
    ? weatherIcon(weather.current.weather_code)
    : CloudSun;

  const displayCropName = (crop) =>
    isBangla ? crop.bn : crop.name;

  return (
    <div className="app">
      <header className="navbar">
        <a href="#home" className="brand" onClick={closeMenu}>
          <span className="brand-icon">
            <Sprout size={25} />
          </span>

          <span>
            AgriSense<span className="brand-highlight">BD</span>
          </span>
        </a>

        <button
          className="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={tx("Toggle navigation", "মেনু খুলুন বা বন্ধ করুন")}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          <a href="#home" onClick={closeMenu}>{tx("Home", "হোম")}</a>
          <a href="#crops" onClick={closeMenu}>{tx("Crops", "ফসল")}</a>
          <a href="#detection" onClick={closeMenu}>
            {tx("Disease Detection", "রোগ শনাক্তকরণ")}
          </a>
          <a href="#marketplace" onClick={closeMenu}>
            {tx("Marketplace", "বাজার")}
          </a>
          <a href="#weather" onClick={closeMenu}>{tx("Weather", "আবহাওয়া")}</a>

          {isLoggedInFarmer && (
            <a href="#tools" onClick={closeMenu}>
              {tx("Farm Tools", "কৃষি সরঞ্জাম")}
            </a>
          )}

          <a href="#about" onClick={closeMenu}>{tx("About", "আমাদের সম্পর্কে")}</a>

          <LanguageSwitcher />

          <a href="#login" className="nav-login" onClick={closeMenu}>
            {tx("Login / Register", "লগইন / নিবন্ধন")}
          </a>
        </nav>
      </header>

      <main>
        {/* HERO */}
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="eyebrow">
              <Leaf size={15} />
              {tx("SMART AGRICULTURE PLATFORM", "স্মার্ট কৃষি প্ল্যাটফর্ম")}
            </div>

            <h1>
              {tx("Grow Smarter.", "স্মার্টভাবে চাষ করুন।")}
              <br />
              <span>{tx("Farm Better.", "উন্নত কৃষি গড়ুন।")}</span>
            </h1>

            <p>
              {tx(
                "Empowering farmers with smart crop information, AI-powered plant disease estimation and practical farming tools.",
                "স্মার্ট ফসলের তথ্য, AI-ভিত্তিক উদ্ভিদের রোগের সম্ভাব্য বিশ্লেষণ এবং প্রয়োজনীয় কৃষি সরঞ্জামের মাধ্যমে কৃষকদের সহায়তা করা।"
              )}
            </p>

            <div className="hero-actions">
              <a href="#detection" className="btn-primary">
                {tx("Detect Plant Disease", "উদ্ভিদের রোগ শনাক্ত করুন")}
                <ArrowRight size={18} />
              </a>

              <a href="#marketplace" className="btn-outline">
                {tx("Explore Marketplace", "কৃষি বাজার দেখুন")}
              </a>
            </div>

            <div className="hero-trust">
              <span>
                <ShieldCheck size={17} />
                {tx("Smart farming support", "স্মার্ট কৃষি সহায়তা")}
              </span>

              <span>
                <Sprout size={17} />
                {tx("4 supported crops", "৪টি ফসল সমর্থিত")}
              </span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-card">
              <img
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1000"
                alt={tx("Green agricultural field", "সবুজ কৃষি ক্ষেত")}
              />

              <div className="floating-card weather-card">
                <CloudSun size={25} />
                <div>
                  <strong>{tx("Weather", "আবহাওয়া")}</strong>
                  <small>{tx("Smart farm planning", "স্মার্ট কৃষি পরিকল্পনা")}</small>
                </div>
              </div>

              <div className="floating-card crop-card">
                <Sprout size={24} />
                <div>
                  <strong>{tx("Healthy Crops", "সুস্থ ফসল")}</strong>
                  <small>{tx("Better decisions", "উন্নত সিদ্ধান্ত")}</small>
                </div>
              </div>
            </div>

            <div className="hero-decoration"></div>
          </div>
        </section>

        {/* STATS */}
        <section className="stats-strip">
          <div>
            <strong>04</strong>
            <span>{tx("Supported Crops", "সমর্থিত ফসল")}</span>
          </div>
          <div>
            <strong>AI</strong>
            <span>{tx("Plant Analysis", "উদ্ভিদ বিশ্লেষণ")}</span>
          </div>
          <div>
            <strong>24/7</strong>
            <span>{tx("Digital Access", "ডিজিটাল সুবিধা")}</span>
          </div>
          <div>
            <strong>BD</strong>
            <span>{tx("Built for Agriculture", "কৃষির জন্য তৈরি")}</span>
          </div>
        </section>

        {/* CROPS */}
        <section className="section crops-section" id="crops">
          <div className="section-heading">
            <span className="section-tag">
              {tx("CROP SELECTION", "ফসল নির্বাচন")}
            </span>
            <h2>{tx("Explore Your Crops", "আপনার ফসল সম্পর্কে জানুন")}</h2>
            <p>
              {tx(
                "Select a crop to explore its information or start disease detection.",
                "ফসলের তথ্য দেখতে অথবা রোগ শনাক্তকরণ শুরু করতে একটি ফসল নির্বাচন করুন।"
              )}
            </p>
          </div>

          <div className="crop-grid">
            {crops.map((crop) => (
              <button
                className={`crop-card ${crop.color}`}
                key={crop.id}
                onClick={() => {
                  setSelectedCrop(crop.id);
                  document.getElementById("detection")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              >
                <span className="crop-emoji">{crop.emoji}</span>
                <span className="crop-name">{displayCropName(crop)}</span>
                <span className="crop-subtitle">
                  {isBangla ? crop.name : crop.bn}
                </span>
                <span className="crop-action">
                  {tx("Select crop", "ফসল নির্বাচন করুন")}
                  <ArrowRight size={15} />
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* DISEASE DETECTION */}
        <section className="section detection-section" id="detection">
          <div className="section-heading">
            <span className="section-tag">
              {tx("AI PLANT ANALYSIS", "AI উদ্ভিদ বিশ্লেষণ")}
            </span>

            <h2>{tx("Plant Disease Detection", "উদ্ভিদের রোগ শনাক্তকরণ")}</h2>

            <p>
              {tx(
                "Upload a clear leaf image and select the crop. Our AI model will estimate its possible condition.",
                "পাতার একটি পরিষ্কার ছবি আপলোড করুন এবং ফসল নির্বাচন করুন। আমাদের AI মডেল সম্ভাব্য অবস্থা বিশ্লেষণ করবে।"
              )}
            </p>
          </div>

          <div className="detection-layout">
            <div className="detection-form">
              <label className="field-label">
                {tx("Select your crop", "আপনার ফসল নির্বাচন করুন")}
              </label>

              <div className="crop-select-grid">
                {crops.map((crop) => (
                  <button
                    key={crop.id}
                    className={
                      selectedCrop === crop.id
                        ? "crop-option active"
                        : "crop-option"
                    }
                    onClick={() => {
                      setSelectedCrop(crop.id);
                      setPrediction(null);
                    }}
                  >
                    <span>{crop.emoji}</span>
                    {displayCropName(crop)}
                  </button>
                ))}
              </div>

              <label className="field-label upload-label">
                {tx("Upload leaf image", "পাতার ছবি আপলোড করুন")}
              </label>

              <button
                type="button"
                className="upload-box"
                onClick={() => fileInput.current?.click()}
              >
                {preview ? (
                  <img src={preview} alt={tx("Selected plant leaf preview", "নির্বাচিত পাতার ছবির প্রিভিউ")} />
                ) : (
                  <>
                    <span className="upload-icon">
                      <Upload size={27} />
                    </span>
                    <strong>
                      {tx("Click to upload an image", "ছবি আপলোড করতে ক্লিক করুন")}
                    </strong>
                    <small>
                      {tx("JPG, PNG or WEBP · Maximum 5 MB", "JPG, PNG অথবা WEBP · সর্বোচ্চ ৫ MB")}
                    </small>
                  </>
                )}
              </button>

              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={handleImage}
              />

              {image && (
                <div className="file-info">
                  <ImageIcon size={16} />
                  <span>{image.name}</span>
                  <button
                    onClick={() => {
                      if (preview) URL.revokeObjectURL(preview);
                      setImage(null);
                      setPreview("");
                      setPrediction(null);
                      setError("");
                      if (fileInput.current) fileInput.current.value = "";
                    }}
                  >
                    {tx("Remove", "সরান")}
                  </button>
                </div>
              )}

              <button
                className="btn-primary predict-button"
                onClick={handlePrediction}
                disabled={loading || !image}
              >
                {loading ? (
                  <>
                    <LoaderCircle className="spin" size={19} />
                    {tx("Analyzing...", "বিশ্লেষণ হচ্ছে...")}
                  </>
                ) : (
                  <>
                    <ScanSearch size={19} />
                    {tx("Analyze Plant", "উদ্ভিদ বিশ্লেষণ করুন")}
                  </>
                )}
              </button>

              {error && (
                <div className="alert error-alert">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}
            </div>

            <div className="result-panel">
              <div className="result-header">
                <div className="result-icon">
                  <ScanSearch size={23} />
                </div>
                <div>
                  <h3>{tx("Analysis Result", "বিশ্লেষণের ফলাফল")}</h3>
                  <p>{tx("Your prediction will appear here", "বিশ্লেষণের ফলাফল এখানে দেখা যাবে")}</p>
                </div>
              </div>

              {!prediction && !loading && (
                <div className="empty-result">
                  <div className="empty-illustration">🌿</div>
                  <h3>{tx("Ready to analyze", "বিশ্লেষণের জন্য প্রস্তুত")}</h3>
                  <p>
                    {tx(
                      "Choose a crop, upload a leaf image and click Analyze Plant.",
                      "একটি ফসল নির্বাচন করুন, পাতার ছবি আপলোড করুন এবং বিশ্লেষণ বাটনে ক্লিক করুন।"
                    )}
                  </p>
                </div>
              )}

              {loading && (
                <div className="empty-result">
                  <LoaderCircle className="spin loading-icon" size={40} />
                  <h3>{tx("Analyzing your image...", "আপনার ছবি বিশ্লেষণ হচ্ছে...")}</h3>
                  <p>
                    {tx(
                      "Please wait while the AI model processes the image.",
                      "AI মডেল ছবিটি বিশ্লেষণ করা পর্যন্ত অপেক্ষা করুন।"
                    )}
                  </p>
                </div>
              )}

              {prediction && (
                <div className="prediction-result">
                  <div className="result-status">
                    {prediction.detection_status === "success"
                      ? <CheckCircle2 size={19} />
                      : <AlertCircle size={19} />}

                    {tx(
                      prediction.detection_status?.replaceAll("_", " ").toUpperCase() || "RESULT",
                      ({
                        success: "সফল",
                        uncertain: "অনিশ্চিত",
                        crop_mismatch: "ফসলের অমিল",
                        unknown: "অজানা",
                      })[prediction.detection_status] || "ফলাফল"
                    )}
                  </div>

                  <div className="result-data">
                    <span>{tx("Selected crop", "নির্বাচিত ফসল")}</span>
                    <strong>{prediction.selected_crop || selectedCrop}</strong>
                  </div>

                  {prediction.crop && (
                    <div className="result-data">
                      <span>{tx("Detected crop", "শনাক্ত করা ফসল")}</span>
                      <strong>{prediction.crop}</strong>
                    </div>
                  )}

                  {prediction.disease && (
                    <div className="disease-name">
                      <small>{tx("Possible condition", "সম্ভাব্য অবস্থা")}</small>
                      <h2>{prediction.disease}</h2>
                    </div>
                  )}

                  {prediction.disease_detected === false &&
                    prediction.detection_status === "success" && (
                      <div className="disease-name">
                        <small>{tx("Plant condition", "উদ্ভিদের অবস্থা")}</small>
                        <h2>{tx("Healthy", "সুস্থ")}</h2>
                      </div>
                    )}

                  {typeof prediction.confidence === "number" && (
                    <div className="confidence">
                      <div>
                        <span>{tx("Model confidence", "মডেলের নির্ভরযোগ্যতার মাত্রা")}</span>
                        <strong>{(prediction.confidence * 100).toFixed(2)}%</strong>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${Math.min(100, prediction.confidence * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <p className="result-message">
                    {getStatusMessage(prediction)}
                  </p>

                  {/* Backend-generated message is intentionally unchanged. */}
                  {prediction.message && (
                    <p className="result-message">{prediction.message}</p>
                  )}

                  <p className="disclaimer">
                    {prediction.disclaimer ||
                      tx(
                        "AI-generated estimate only. This is not a confirmed plant diagnosis. Consult an agricultural expert before treatment decisions.",
                        "এটি AI-নির্ভর একটি সম্ভাব্য বিশ্লেষণ, নিশ্চিত রোগ নির্ণয় নয়। চিকিৎসার সিদ্ধান্ত নেওয়ার আগে কৃষি বিশেষজ্ঞের পরামর্শ নিন।"
                      )}
                  </p>

                  {prediction.model_version && (
                    <small className="model-version">
                      Model: {prediction.model_version}
                    </small>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* PUBLIC MARKETPLACE */}
        <Marketplace />

        {/* PUBLIC DEMO MARKET PRICES */}
        <DemoMarketPrices />

        {/* PUBLIC WEATHER */}
        <section className="section tools-section" id="weather">
          <div className="section-heading">
            <span className="section-tag">
              {tx("LIVE WEATHER SERVICE", "লাইভ আবহাওয়া সেবা")}
            </span>
            <h2>{tx("Live Weather & Forecast", "লাইভ আবহাওয়া ও পূর্বাভাস")}</h2>
            <p>
              {tx(
                "Search Dhaka, Savar, Bogura or any city in Bangladesh.",
                "ঢাকা, সাভার, বগুড়া অথবা বাংলাদেশের যেকোনো শহরের আবহাওয়া খুঁজুন।"
              )}
            </p>
          </div>

          <div className="weather-tool" style={{ maxWidth: "900px", margin: "0 auto" }}>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                loadWeather(weatherLocationRef.current);
              }}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <input
                type="text"
                value={weatherLocation}
                onChange={(event) => {
                  setWeatherLocation(event.target.value);
                  weatherLocationRef.current = event.target.value;
                }}
                placeholder={tx(
                  "Enter your area, e.g. Dhaka, Savar, Bogura",
                  "আপনার এলাকার নাম লিখুন, যেমন ঢাকা, সাভার, বগুড়া"
                )}
                aria-label={tx("Weather location", "আবহাওয়ার এলাকার নাম")}
                style={{
                  flex: "1",
                  minWidth: "180px",
                  padding: "13px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                }}
              />

              <button type="submit" className="btn-primary" disabled={weatherLoading}>
                {weatherLoading
                  ? <LoaderCircle className="spin" size={18} />
                  : <MapPin size={18} />}
                {tx("Search Weather", "আবহাওয়া খুঁজুন")}
              </button>

              <button
                type="button"
                className="btn-outline"
                onClick={() => loadWeather(weatherLocationRef.current)}
                disabled={weatherLoading}
                title={tx("Refresh weather", "আবহাওয়া রিফ্রেশ করুন")}
              >
                <RefreshCw size={18} />
                {tx("Refresh", "রিফ্রেশ")}
              </button>
            </form>

            {weatherError && (
              <div className="alert error-alert">
                <AlertCircle size={18} />
                {weatherError}
              </div>
            )}

            {weatherLoading && !weather && (
              <div className="empty-result">
                <LoaderCircle className="spin loading-icon" size={40} />
                <h3>{tx("Loading weather information...", "আবহাওয়ার তথ্য লোড হচ্ছে...")}</h3>
                <p>{tx("Getting current weather and forecast.", "বর্তমান আবহাওয়া ও পূর্বাভাস সংগ্রহ করা হচ্ছে।")}</p>
              </div>
            )}

            {weather && (
              <>
                <div
                  style={{
                    background: "linear-gradient(135deg, #e8f7ed, #eff8ff)",
                    borderRadius: "14px",
                    padding: "24px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "15px",
                    }}
                  >
                    <div>
                      <p style={{ margin: "0 0 8px", color: "#42634c" }}>
                        <MapPin size={15} style={{ verticalAlign: "middle" }} />
                        {" "}{weather.location}
                        {weather.district ? `, ${weather.district}` : ""}
                        {weather.country ? `, ${weather.country}` : ""}
                      </p>

                      <h3 style={{ margin: "0 0 8px" }}>
                        {weatherDescription(weather.current.weather_code)}
                      </h3>

                      <p style={{ margin: 0, color: "#52665a" }}>
                        {tx("Current weather", "বর্তমান আবহাওয়া")}
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <CurrentWeatherIcon size={48} />
                      <strong style={{ fontSize: "42px" }}>
                        {Math.round(weather.current.temperature_2m)}°C
                      </strong>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                      gap: "12px",
                      marginTop: "24px",
                    }}
                  >
                    <div className="calculation-result">
                      <Thermometer size={20} />
                      <span>{tx("Feels like", "অনুভূত তাপমাত্রা")}</span>
                      <strong>{weather.current.apparent_temperature}°C</strong>
                    </div>

                    <div className="calculation-result">
                      <Droplets size={20} />
                      <span>{tx("Humidity", "আর্দ্রতা")}</span>
                      <strong>{weather.current.relative_humidity_2m}%</strong>
                    </div>

                    <div className="calculation-result">
                      <Wind size={20} />
                      <span>{tx("Wind speed", "বাতাসের গতি")}</span>
                      <strong>{weather.current.wind_speed_10m} km/h</strong>
                    </div>

                    <div className="calculation-result">
                      <CloudRain size={20} />
                      <span>{tx("Rain next 24h", "পরবর্তী ২৪ ঘণ্টার বৃষ্টি")}</span>
                      <strong>{weather.rainfallNext24Hours.toFixed(1)} mm</strong>
                    </div>
                  </div>
                </div>

                {/* Five-day forecast */}
                {weather.daily && (
                  <div className="tool-card" style={{ marginBottom: "20px" }}>
                    <h3>{tx("5-Day Weather Forecast", "৫ দিনের আবহাওয়ার পূর্বাভাস")}</h3>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                        gap: "10px",
                      }}
                    >
                      {weather.daily.time.map((day, index) => {
                        const DayIcon = weatherIcon(weather.daily.weather_code[index]);

                        return (
                          <div
                            key={day}
                            style={{
                              padding: "14px 8px",
                              background: "#f1f7f3",
                              borderRadius: "10px",
                              textAlign: "center",
                            }}
                          >
                            <strong>
                              {new Date(`${day}T12:00:00`).toLocaleDateString(
                                isBangla ? "bn-BD" : "en-BD",
                                {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                }
                              )}
                            </strong>

                            <div style={{ margin: "12px 0" }}>
                              <DayIcon size={27} />
                            </div>

                            <div>
                              <strong>
                                {Math.round(weather.daily.temperature_2m_max[index])}°
                              </strong>
                              {" / "}
                              {Math.round(weather.daily.temperature_2m_min[index])}°
                            </div>

                            <small style={{ display: "block", marginTop: "7px" }}>
                              {tx("Rain chance", "বৃষ্টির সম্ভাবনা")}:{" "}
                              {weather.daily.precipitation_probability_max[index]}%
                            </small>

                            <small style={{ display: "block", marginTop: "5px" }}>
                              {weatherDescription(weather.daily.weather_code[index])}
                            </small>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Hourly rainfall forecast */}
                <div className="tool-card" style={{ marginBottom: "20px" }}>
                  <h3>{tx("Rainfall Forecast — Next 24 Hours", "বৃষ্টির পূর্বাভাস — পরবর্তী ২৪ ঘণ্টা")}</h3>

                  <p>
                    {tx("Maximum hourly rain probability", "সর্বোচ্চ ঘণ্টাভিত্তিক বৃষ্টির সম্ভাবনা")}:{" "}
                    <strong>{weather.maxRainProbability}%</strong>
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(75px, 1fr))",
                      gap: "8px",
                    }}
                  >
                    {weather.upcomingHours
                      .filter((_, index) => index % 3 === 0)
                      .slice(0, 8)
                      .map((hour) => (
                        <div
                          key={hour.time}
                          style={{
                            padding: "10px 5px",
                            background: "#f1f7f3",
                            borderRadius: "8px",
                            textAlign: "center",
                          }}
                        >
                          <small>
                            {new Date(hour.time).toLocaleTimeString(
                              isBangla ? "bn-BD" : "en-BD",
                              { hour: "numeric" }
                            )}
                          </small>

                          <div style={{ margin: "8px 0" }}>
                            <CloudRain size={20} />
                          </div>

                          <strong>{hour.precipitation.toFixed(1)} mm</strong>
                          <small style={{ display: "block" }}>{hour.probability}%</small>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Farmer-only weather advisory */}
                {isLoggedInFarmer && (
                  <div className="tool-card">
                    <div className="section-tag">
                      {tx("FARMER ONLY", "শুধুমাত্র কৃষকদের জন্য")}
                    </div>

                    <h3>
                      <Sprout size={22} style={{ verticalAlign: "middle" }} />
                      {" "}{tx("Weather-Based Farming Suggestions", "আবহাওয়াভিত্তিক কৃষি পরামর্শ")}
                    </h3>

                    <p>
                      {tx("Selected crop", "নির্বাচিত ফসল")}:{" "}
                      <strong>
                        {displayCropName(crops.find((crop) => crop.id === selectedCrop))}
                      </strong>
                    </p>

                    <label className="field-label">
                      {tx("Choose your crop", "আপনার ফসল নির্বাচন করুন")}
                    </label>

                    <div className="crop-select-grid">
                      {crops.map((crop) => (
                        <button
                          key={crop.id}
                          className={selectedCrop === crop.id ? "crop-option active" : "crop-option"}
                          onClick={() => setSelectedCrop(crop.id)}
                        >
                          <span>{crop.emoji}</span>
                          {displayCropName(crop)}
                        </button>
                      ))}
                    </div>

                    {advice && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                          gap: "16px",
                          marginTop: "20px",
                        }}
                      >
                        <div className="calculation-result">
                          <Droplets size={24} />
                          <h4>{advice.irrigation.title}</h4>
                          <p>{advice.irrigation.description}</p>
                        </div>

                        <div className="calculation-result">
                          <Leaf size={24} />
                          <h4>{advice.fertilizer.title}</h4>
                          <p>{advice.fertilizer.description}</p>
                        </div>
                      </div>
                    )}

                    <div
                      className="alert"
                      style={{
                        marginTop: "18px",
                        padding: "14px",
                        background: "#fff8e7",
                        color: "#755414",
                        borderRadius: "8px",
                      }}
                    >
                      <AlertCircle size={18} />
                      <span>
                        {tx(
                          "Advisory only: weather data cannot determine exact irrigation or fertilizer requirements. Check soil moisture, crop growth stage, soil test results and local agricultural recommendations before acting.",
                          "এটি শুধুমাত্র পরামর্শ: আবহাওয়ার তথ্য দিয়ে সঠিক সেচ বা সার প্রয়োগের পরিমাণ নির্ধারণ করা যায় না। সিদ্ধান্ত নেওয়ার আগে মাটির আর্দ্রতা, ফসলের বৃদ্ধির পর্যায়, মাটি পরীক্ষার ফলাফল এবং স্থানীয় কৃষি পরামর্শ যাচাই করুন।"
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {lastUpdated && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginTop: "16px",
                      color: "#64748b",
                    }}
                  >
                    <small>
                      {tx("Last retrieved", "সর্বশেষ তথ্য সংগ্রহ")}:{" "}
                      {lastUpdated.toLocaleString(isBangla ? "bn-BD" : "en-BD")}
                    </small>
                    <small>·</small>
                    <small>Source: Open-Meteo</small>
                    <small>·</small>
                    <small>
                      {tx("Automatic refresh every 15 minutes", "প্রতি ১৫ মিনিটে স্বয়ংক্রিয় আপডেট")}
                    </small>
                  </div>
                )}

                <small style={{ display: "block", marginTop: "8px", color: "#64748b" }}>
                  {tx(
                    "Note: Current temperature is a weather-model estimate. It may differ from your phone's weather provider or a local weather station.",
                    "নোট: বর্তমান তাপমাত্রা আবহাওয়া মডেলের একটি আনুমানিক হিসাব। এটি আপনার ফোনের আবহাওয়া অ্যাপ বা স্থানীয় আবহাওয়া স্টেশনের তথ্য থেকে আলাদা হতে পারে।"
                  )}
                </small>
              </>
            )}
          </div>
        </section>

        {/* FARMER-ONLY CALCULATORS */}
        {isLoggedInFarmer && (
          <section className="section tools-section" id="tools">
            <div className="section-heading">
              <span className="section-tag">
                {tx("FARMER MANAGEMENT", "কৃষক ব্যবস্থাপনা")}
              </span>
              <h2>{tx("Practical Farming Tools", "প্রয়োজনীয় কৃষি সরঞ্জাম")}</h2>
              <p>
                {tx(
                  "Exclusive farming calculators for logged-in farmers.",
                  "লগইন করা কৃষকদের জন্য বিশেষ কৃষি ক্যালকুলেটর।"
                )}
              </p>
            </div>

            <div className="tools-grid">
              {/* Fertilizer Calculator */}
              <div className="tool-card">
                <div className="tool-icon">
                  <Calculator size={24} />
                </div>

                <h3>{tx("Fertilizer Calculator", "সার ক্যালকুলেটর")}</h3>
                <p>
                  {tx(
                    "Estimate fertilizer quantity based on land area and application rate.",
                    "জমির পরিমাণ ও সার প্রয়োগের হার অনুযায়ী প্রয়োজনীয় সারের পরিমাণ হিসাব করুন।"
                  )}
                </p>

                <label>{tx("Land area (acre)", "জমির পরিমাণ (একর)")}</label>
                <input
                  type="number"
                  min="0"
                  value={landArea}
                  onChange={(event) => setLandArea(event.target.value)}
                />

                <label>{tx("Fertilizer rate (kg/acre)", "সার প্রয়োগের হার (কেজি/একর)")}</label>
                <input
                  type="number"
                  min="0"
                  value={fertilizerRate}
                  onChange={(event) => setFertilizerRate(event.target.value)}
                />

                <div className="calculation-result">
                  <span>{tx("Estimated fertilizer", "আনুমানিক সারের পরিমাণ")}</span>
                  <strong>{fertilizerTotal.toFixed(2)} kg</strong>
                </div>

                <small className="tool-note">
                  {tx(
                    "Illustrative calculation. Follow crop-specific expert recommendations.",
                    "এটি একটি আনুমানিক হিসাব। ফসল অনুযায়ী কৃষি বিশেষজ্ঞের পরামর্শ অনুসরণ করুন।"
                  )}
                </small>
              </div>

              {/* Cost and Profit/Loss Calculator */}
              <div className="tool-card">
                <div className="tool-icon">
                  <TrendingUp size={24} />
                </div>

                <h3>{tx("Cost & Profit/Loss", "খরচ ও লাভ-ক্ষতি")}</h3>
                <p>
                  {tx(
                    "Estimate your farming outcome by entering cost and expected revenue.",
                    "মোট খরচ ও সম্ভাব্য আয় লিখে আপনার কৃষিকাজের লাভ-ক্ষতি হিসাব করুন।"
                  )}
                </p>

                <label>{tx("Total farming cost (৳)", "মোট কৃষি খরচ (৳)")}</label>
                <input
                  type="number"
                  min="0"
                  value={totalCost}
                  onChange={(event) => setTotalCost(event.target.value)}
                />

                <label>{tx("Expected revenue (৳)", "সম্ভাব্য আয় (৳)")}</label>
                <input
                  type="number"
                  min="0"
                  value={expectedRevenue}
                  onChange={(event) => setExpectedRevenue(event.target.value)}
                />

                <div className="calculation-result">
                  <span>
                    {profitLoss >= 0
                      ? tx("Estimated profit", "আনুমানিক লাভ")
                      : tx("Estimated loss", "আনুমানিক ক্ষতি")}
                  </span>

                  <strong className={profitLoss >= 0 ? "positive" : "negative"}>
                    ৳{Math.abs(profitLoss).toLocaleString(isBangla ? "bn-BD" : "en-BD")}
                  </strong>
                </div>

                <small className="tool-note">
                  {tx(
                    "This is an estimate based on the values you enter.",
                    "আপনার দেওয়া তথ্যের ভিত্তিতে এই আনুমানিক হিসাব করা হয়েছে।"
                  )}
                </small>
              </div>
            </div>
          </section>
        )}

        {/* ABOUT */}
        <section className="section about-section" id="about">
          <div className="about-content">
            <span className="section-tag">
              {tx("ABOUT AGRISENSE BD", "এগ্রিসেন্স বিডি সম্পর্কে")}
            </span>

            <h2>{tx("Technology for Better Agriculture", "উন্নত কৃষির জন্য প্রযুক্তি")}</h2>

            <p>
              {tx(
                "AgriSense BD is a smart agriculture platform designed to provide farmers with crop information, plant disease estimation, a public crop marketplace and useful farming management tools.",
                "AgriSense BD একটি স্মার্ট কৃষি প্ল্যাটফর্ম। এটি কৃষকদের ফসলের তথ্য, উদ্ভিদের রোগের সম্ভাব্য বিশ্লেষণ, উন্মুক্ত কৃষি বাজার এবং প্রয়োজনীয় কৃষি ব্যবস্থাপনা সরঞ্জাম প্রদান করার জন্য তৈরি।"
              )}
            </p>

            <div className="about-points">
              <span>
                <CheckCircle2 size={18} />
                {tx("AI-powered plant analysis", "AI-ভিত্তিক উদ্ভিদ বিশ্লেষণ")}
              </span>
              <span>
                <CheckCircle2 size={18} />
                {tx("Crop-focused information", "ফসলভিত্তিক তথ্য")}
              </span>
              <span>
                <CheckCircle2 size={18} />
                {tx("Public crop marketplace", "উন্মুক্ত কৃষি বাজার")}
              </span>
              <span>
                <CheckCircle2 size={18} />
                {tx("Practical farm calculators", "প্রয়োজনীয় কৃষি ক্যালকুলেটর")}
              </span>
            </div>
          </div>

          <div className="about-visual">
            <img
              src="https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?w=900"
              alt={tx("Agricultural green plants", "সবুজ কৃষি গাছপালা")}
            />
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <a href="#home" className="brand footer-brand">
          <span className="brand-icon">
            <Sprout size={23} />
          </span>
          <span>
            AgriSense<span className="brand-highlight">BD</span>
          </span>
        </a>

        <p>
          {tx(
            "Smart Agriculture. Better Decisions.",
            "স্মার্ট কৃষি। উন্নত সিদ্ধান্ত।"
          )}
        </p>

        <small>
          © {new Date().getFullYear()} AgriSense BD.{" "}
          {tx("All rights reserved.", "সর্বস্বত্ব সংরক্ষিত।")}
        </small>
      </footer>
    </div>
  );
}

export default App;
