
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      // Common
      language: "Language",
      english: "English",
      bangla: "বাংলা",
      home: "Home",
      crops: "Crops",
      diseaseDetection: "Disease Detection",
      marketplace: "Marketplace",
      weather: "Weather",
      farmTools: "Farm Tools",
      about: "About",
      loginRegister: "Login / Register",
      logout: "Logout",
      selectCrop: "Select your crop",
      uploadImage: "Upload leaf image",
      analyzePlant: "Analyze Plant",
      analyzing: "Analyzing...",
      analysisResult: "Analysis Result",
      readyToAnalyze: "Ready to analyze",
      selectedCrop: "Selected crop",
      detectedCrop: "Detected crop",
      possibleCondition: "Possible condition",
      healthy: "Healthy",
      modelConfidence: "Model confidence",
      refresh: "Refresh",
      searchWeather: "Search Weather",
      currentWeather: "Current weather",
      feelsLike: "Feels like",
      humidity: "Humidity",
      windSpeed: "Wind speed",
      rainNext24Hours: "Rain next 24h",
      fiveDayForecast: "5-Day Weather Forecast",
      farmerOnly: "FARMER ONLY",
      fertilizerCalculator: "Fertilizer Calculator",
      costProfitCalculator: "Cost & Profit/Loss",
      landArea: "Land area (acre)",
      fertilizerRate: "Fertilizer rate (kg/acre)",
      estimatedFertilizer: "Estimated fertilizer",
      totalFarmingCost: "Total farming cost",
      expectedRevenue: "Expected revenue",
      estimatedProfit: "Estimated profit",
      estimatedLoss: "Estimated loss",
      allRightsReserved: "All rights reserved.",
      loading: "Loading...",
      remove: "Remove",
      search: "Search",
      save: "Save",
      cancel: "Cancel",
      submit: "Submit",
      noData: "No data available.",
      error: "Something went wrong.",

      // Navigation
      navHome: "Home",
      navCrops: "Crops",
      navDiseaseDetection: "Disease Detection",
      navMarketplace: "Marketplace",
      navWeather: "Weather",
      navFarmTools: "Farm Tools",
      navAbout: "About",

      // Hero
      heroEyebrow: "SMART AGRICULTURE PLATFORM",
      heroTitleFirst: "Grow Smarter.",
      heroTitleSecond: "Farm Better.",
      heroDescription:
        "Empowering farmers with smart crop information, AI-powered plant disease estimation and practical farming tools.",
      heroDetectButton: "Detect Plant Disease",
      heroMarketplaceButton: "Explore Marketplace",
      smartFarmingSupport: "Smart farming support",
      supportedCrops: "supported crops",
      weatherTitle: "Weather",
      smartFarmPlanning: "Smart farm planning",
      healthyCrops: "Healthy Crops",
      betterDecisions: "Better decisions",

      // Stats
      supportedCropsLabel: "Supported Crops",
      plantAnalysis: "Plant Analysis",
      digitalAccess: "Digital Access",
      builtForAgriculture: "Built for Agriculture",

      // Crop section
      cropSelection: "CROP SELECTION",
      exploreYourCrops: "Explore Your Crops",
      cropSectionDescription:
        "Select a crop to explore its information or start disease detection.",
      selectCropAction: "Select crop",
      rice: "Rice",
      potato: "Potato",
      tomato: "Tomato",
      maize: "Maize",

      // Disease detection
      aiPlantAnalysis: "AI PLANT ANALYSIS",
      plantDiseaseDetection: "Plant Disease Detection",
      diseaseSectionDescription:
        "Upload a clear leaf image and select the crop. Our AI model will estimate its possible condition.",
      uploadImageClick: "Click to upload an image",
      allowedImageFormats: "JPG, PNG or WEBP · Maximum 5 MB",
      predictionReadyDescription:
        "Choose a crop, upload a leaf image and click Analyze Plant.",
      analyzingImage: "Analyzing your image...",
      waitForModel: "Please wait while the AI model processes the image.",
      plantCondition: "Plant condition",
      predictionCompleted: "Prediction completed.",
      diseaseIdentified: "A possible disease condition was identified.",
      plantAppearsHealthy:
        "The plant appears healthy according to the model.",
      uncertainPrediction:
        "The model is uncertain. Please upload a clearer image.",
      cropMismatch:
        "The uploaded image may not match your selected crop.",
      unknownCrop:
        "The selected crop could not be reliably confirmed.",
      uploadImageFirst: "Please upload a plant leaf image first.",
      invalidImageFormat: "Please upload a JPG, PNG or WEBP image.",
      imageTooLarge: "Image size must be less than 5 MB.",
      removeImage: "Remove",
      possibleDisease: "Possible condition",
      aiDisclaimer:
        "AI-generated estimate only. This is not a confirmed plant diagnosis. Consult an agricultural expert before treatment decisions.",

      // Weather
      liveWeatherService: "LIVE WEATHER SERVICE",
      liveWeatherForecast: "Live Weather & Forecast",
      weatherSectionDescription:
        "Search Dhaka, Savar, Bogura or any city in Bangladesh.",
      weatherLocationPlaceholder:
        "Enter your area, e.g. Dhaka, Savar, Bogura",
      weatherLocationLabel: "Weather location",
      refreshWeather: "Refresh weather",
      weatherInformationLoading: "Loading weather information...",
      gettingWeather: "Getting current weather and forecast.",
      enterLocationError: "Please enter your city or location.",
      locationSearchError: "Unable to search for this location.",
      locationNotFound:
        "Location not found in Bangladesh. Please check the spelling and try again.",
      weatherLoadError: "Unable to load weather information.",
      weatherUnavailable: "Weather data is temporarily unavailable.",
      clearSky: "Clear sky",
      partlyCloudy: "Partly cloudy",
      overcast: "Overcast",
      foggy: "Foggy",
      drizzle: "Drizzle",
      freezingDrizzle: "Freezing drizzle",
      rain: "Rain",
      freezingRain: "Freezing rain",
      snow: "Snow",
      rainShowers: "Rain showers",
      snowShowers: "Snow showers",
      thunderstorm: "Thunderstorm",
      weatherInformation: "Weather information",
      rainChance: "Rain chance",
      rainfallForecast: "Rainfall Forecast — Next 24 Hours",
      maxRainProbability: "Maximum hourly rain probability",
      lastRetrieved: "Last retrieved",
      source: "Source",
      automaticRefresh: "Automatic refresh every 15 minutes",
      weatherNote:
        "Note: Current temperature is a weather-model estimate. It may differ from your phone's weather provider or a local weather station.",

      // Farmer weather advisory
      weatherBasedSuggestions: "Weather-Based Farming Suggestions",
      chooseYourCrop: "Choose your crop",
      waitBeforeIrrigation: "Wait before irrigation today",
      waitBeforeIrrigationDescription:
        "Rain is possible in the next 24 hours. Check soil moisture. If the soil is already wet, additional irrigation may not be necessary.",
      checkSoilBeforeIrrigation: "Check the soil before irrigation",
      checkSoilBeforeIrrigationDescription:
        "Light rain is possible. Consider soil moisture, crop age and field conditions before deciding to irrigate.",
      irrigationIfNeeded: "Irrigate if needed",
      irrigationIfNeededDescription:
        "No significant rainfall is forecast in the next 24 hours. Check whether the soil is dry and irrigate according to crop needs.",
      avoidFertilizerToday: "Avoid fertilizer application today if possible",
      avoidFertilizerDescription:
        "Heavy rain is possible and may wash fertilizer away. Plan application when rainfall decreases and field conditions are suitable.",
      checkWeatherBeforeFertilizer: "Check the weather before fertilizing",
      checkWeatherBeforeFertilizerDescription:
        "Rain is possible. Consider soil moisture and the crop growth stage when planning fertilizer application.",
      planFertilizerIfNeeded: "Plan fertilizer application if needed",
      planFertilizerDescription:
        "The chance of rain is relatively low. Follow crop stage, soil condition and recommended application rates.",
      highTemperatureAdvice:
        "The temperature is high, so monitor the water needs of plants and soil carefully.",
      advisoryOnly:
        "Advisory only: weather data cannot determine exact irrigation or fertilizer requirements. Check soil moisture, crop growth stage, soil test results and local agricultural recommendations before acting.",

      // Farmer calculators
      farmerManagement: "FARMER MANAGEMENT",
      practicalFarmingTools: "Practical Farming Tools",
      farmingToolsDescription:
        "Exclusive farming calculators for logged-in farmers.",
      fertilizerDescription:
        "Estimate fertilizer quantity based on land area and application rate.",
      landAreaAcre: "Land area (acre)",
      fertilizerRateAcre: "Fertilizer rate (kg/acre)",
      illustrativeCalculation:
        "Illustrative calculation. Follow crop-specific expert recommendations.",
      costProfitDescription:
        "Estimate your farming outcome by entering cost and expected revenue.",
      totalFarmingCostCurrency: "Total farming cost (৳)",
      expectedRevenueCurrency: "Expected revenue (৳)",
      estimateBasedOnInput:
        "This is an estimate based on the values you enter.",

      // About
      aboutAgriSense: "ABOUT AGRISENSE BD",
      technologyForAgriculture: "Technology for Better Agriculture",
      aboutDescription:
        "AgriSense BD is a smart agriculture platform designed to provide farmers with crop information, plant disease estimation, a public crop marketplace and useful farming management tools.",
      aiPoweredAnalysis: "AI-powered plant analysis",
      cropFocusedInformation: "Crop-focused information",
      publicMarketplace: "Public crop marketplace",
      practicalCalculators: "Practical farm calculators",

      // Footer
      footerTagline: "Smart Agriculture. Better Decisions.",

      // Authentication / errors
      aiServiceError: "Unable to connect to the ML service.",
      lastUpdated: "Last updated"
    }
  },

  bn: {
    translation: {
      // Common
      language: "ভাষা",
      english: "English",
      bangla: "বাংলা",
      home: "হোম",
      crops: "ফসল",
      diseaseDetection: "রোগ শনাক্তকরণ",
      marketplace: "কৃষি বাজার",
      weather: "আবহাওয়া",
      farmTools: "কৃষি সরঞ্জাম",
      about: "আমাদের সম্পর্কে",
      loginRegister: "লগইন / নিবন্ধন",
      logout: "লগআউট",
      selectCrop: "আপনার ফসল নির্বাচন করুন",
      uploadImage: "পাতার ছবি আপলোড করুন",
      analyzePlant: "ফসল বিশ্লেষণ করুন",
      analyzing: "বিশ্লেষণ করা হচ্ছে...",
      analysisResult: "বিশ্লেষণের ফলাফল",
      readyToAnalyze: "বিশ্লেষণের জন্য প্রস্তুত",
      selectedCrop: "নির্বাচিত ফসল",
      detectedCrop: "শনাক্ত করা ফসল",
      possibleCondition: "সম্ভাব্য অবস্থা",
      healthy: "সুস্থ",
      modelConfidence: "মডেলের নির্ভরযোগ্যতা",
      refresh: "রিফ্রেশ",
      searchWeather: "আবহাওয়া খুঁজুন",
      currentWeather: "বর্তমান আবহাওয়া",
      feelsLike: "অনুভূত তাপমাত্রা",
      humidity: "আর্দ্রতা",
      windSpeed: "বাতাসের গতি",
      rainNext24Hours: "আগামী ২৪ ঘণ্টার বৃষ্টি",
      fiveDayForecast: "৫ দিনের আবহাওয়ার পূর্বাভাস",
      farmerOnly: "শুধুমাত্র কৃষকদের জন্য",
      fertilizerCalculator: "সার হিসাব ক্যালকুলেটর",
      costProfitCalculator: "খরচ ও লাভ-ক্ষতির হিসাব",
      landArea: "জমির পরিমাণ (একর)",
      fertilizerRate: "সারের পরিমাণ (কেজি/একর)",
      estimatedFertilizer: "আনুমানিক সারের পরিমাণ",
      totalFarmingCost: "মোট কৃষি খরচ",
      expectedRevenue: "সম্ভাব্য আয়",
      estimatedProfit: "আনুমানিক লাভ",
      estimatedLoss: "আনুমানিক ক্ষতি",
      allRightsReserved: "সর্বস্বত্ব সংরক্ষিত।",
      loading: "লোড হচ্ছে...",
      remove: "সরান",
      search: "খুঁজুন",
      save: "সংরক্ষণ করুন",
      cancel: "বাতিল",
      submit: "জমা দিন",
      noData: "কোনো তথ্য পাওয়া যায়নি।",
      error: "একটি সমস্যা হয়েছে।",

      // Navigation
      navHome: "হোম",
      navCrops: "ফসল",
      navDiseaseDetection: "রোগ শনাক্তকরণ",
      navMarketplace: "কৃষি বাজার",
      navWeather: "আবহাওয়া",
      navFarmTools: "কৃষি সরঞ্জাম",
      navAbout: "আমাদের সম্পর্কে",

      // Hero
      heroEyebrow: "স্মার্ট কৃষি প্ল্যাটফর্ম",
      heroTitleFirst: "আরও বুদ্ধিমত্তার সঙ্গে চাষ করুন।",
      heroTitleSecond: "গড়ে তুলুন উন্নত কৃষি।",
      heroDescription:
        "স্মার্ট ফসলের তথ্য, AI-ভিত্তিক উদ্ভিদের রোগের সম্ভাব্য বিশ্লেষণ এবং প্রয়োজনীয় কৃষি সরঞ্জামের মাধ্যমে কৃষকদের সহায়তা করা।",
      heroDetectButton: "উদ্ভিদের রোগ শনাক্ত করুন",
      heroMarketplaceButton: "কৃষি বাজার দেখুন",
      smartFarmingSupport: "স্মার্ট কৃষি সহায়তা",
      supportedCrops: "টি ফসল সমর্থিত",
      weatherTitle: "আবহাওয়া",
      smartFarmPlanning: "স্মার্ট কৃষি পরিকল্পনা",
      healthyCrops: "সুস্থ ফসল",
      betterDecisions: "উন্নত সিদ্ধান্ত",

      // Stats
      supportedCropsLabel: "সমর্থিত ফসল",
      plantAnalysis: "উদ্ভিদ বিশ্লেষণ",
      digitalAccess: "২৪/৭ ডিজিটাল সুবিধা",
      builtForAgriculture: "কৃষির জন্য তৈরি",

      // Crop section
      cropSelection: "ফসল নির্বাচন",
      exploreYourCrops: "আপনার ফসল সম্পর্কে জানুন",
      cropSectionDescription:
        "ফসলের তথ্য দেখতে অথবা রোগ শনাক্তকরণ শুরু করতে একটি ফসল নির্বাচন করুন।",
      selectCropAction: "ফসল নির্বাচন করুন",
      rice: "ধান",
      potato: "আলু",
      tomato: "টমেটো",
      maize: "ভুট্টা",

      // Disease detection
      aiPlantAnalysis: "AI-ভিত্তিক উদ্ভিদ বিশ্লেষণ",
      plantDiseaseDetection: "উদ্ভিদের রোগ শনাক্তকরণ",
      diseaseSectionDescription:
        "পাতার একটি পরিষ্কার ছবি আপলোড করুন এবং ফসল নির্বাচন করুন। আমাদের AI মডেল ফসলের সম্ভাব্য অবস্থা বিশ্লেষণ করবে।",
      uploadImageClick: "ছবি আপলোড করতে ক্লিক করুন",
      allowedImageFormats: "JPG, PNG অথবা WEBP · সর্বোচ্চ ৫ MB",
      predictionReadyDescription:
        "একটি ফসল নির্বাচন করুন, পাতার ছবি আপলোড করুন এবং বিশ্লেষণ বাটনে ক্লিক করুন।",
      analyzingImage: "আপনার ছবি বিশ্লেষণ করা হচ্ছে...",
      waitForModel: "AI মডেল ছবিটি বিশ্লেষণ করছে। অনুগ্রহ করে অপেক্ষা করুন।",
      plantCondition: "উদ্ভিদের অবস্থা",
      predictionCompleted: "বিশ্লেষণ সম্পন্ন হয়েছে।",
      diseaseIdentified: "সম্ভাব্য রোগের লক্ষণ শনাক্ত হয়েছে।",
      plantAppearsHealthy: "মডেল অনুযায়ী উদ্ভিদটি সুস্থ বলে মনে হচ্ছে।",
      uncertainPrediction:
        "মডেলটি নিশ্চিত হতে পারেনি। অনুগ্রহ করে আরও পরিষ্কার ছবি আপলোড করুন।",
      cropMismatch:
        "আপলোড করা ছবিটি নির্বাচিত ফসলের সঙ্গে নাও মিলতে পারে।",
      unknownCrop:
        "নির্বাচিত ফসলটি নির্ভরযোগ্যভাবে নিশ্চিত করা যায়নি।",
      uploadImageFirst: "প্রথমে উদ্ভিদের পাতার ছবি আপলোড করুন।",
      invalidImageFormat: "JPG, PNG অথবা WEBP ছবি আপলোড করুন।",
      imageTooLarge: "ছবির আকার ৫ MB-এর কম হতে হবে।",
      removeImage: "সরান",
      possibleDisease: "সম্ভাব্য অবস্থা",
      aiDisclaimer:
        "এটি AI-নির্ভর একটি সম্ভাব্য বিশ্লেষণ, নিশ্চিত রোগ নির্ণয় নয়। চিকিৎসার সিদ্ধান্ত নেওয়ার আগে কৃষি বিশেষজ্ঞের পরামর্শ নিন।",

      // Weather
      liveWeatherService: "লাইভ আবহাওয়া সেবা",
      liveWeatherForecast: "বর্তমান আবহাওয়া ও পূর্বাভাস",
      weatherSectionDescription:
        "ঢাকা, সাভার, বগুড়া অথবা বাংলাদেশের যেকোনো শহরের আবহাওয়া খুঁজুন।",
      weatherLocationPlaceholder:
        "আপনার এলাকার নাম লিখুন, যেমন: ঢাকা, সাভার, বগুড়া",
      weatherLocationLabel: "আবহাওয়ার অবস্থান",
      refreshWeather: "আবহাওয়া রিফ্রেশ করুন",
      weatherInformationLoading: "আবহাওয়ার তথ্য লোড হচ্ছে...",
      gettingWeather: "বর্তমান আবহাওয়া ও পূর্বাভাস সংগ্রহ করা হচ্ছে।",
      enterLocationError: "আপনার শহর বা এলাকার নাম লিখুন।",
      locationSearchError: "এই অবস্থানটি খুঁজে পাওয়া যায়নি।",
      locationNotFound:
        "বাংলাদেশে এই অবস্থানটি পাওয়া যায়নি। বানান পরীক্ষা করে আবার চেষ্টা করুন।",
      weatherLoadError: "আবহাওয়ার তথ্য লোড করা যায়নি।",
      weatherUnavailable: "আবহাওয়ার তথ্য সাময়িকভাবে পাওয়া যাচ্ছে না।",
      clearSky: "পরিষ্কার আকাশ",
      partlyCloudy: "আংশিক মেঘলা",
      overcast: "মেঘাচ্ছন্ন",
      foggy: "কুয়াশাচ্ছন্ন",
      drizzle: "গুঁড়ি গুঁড়ি বৃষ্টি",
      freezingDrizzle: "জমাট বাঁধা গুঁড়ি বৃষ্টি",
      rain: "বৃষ্টি",
      freezingRain: "জমাট বাঁধা বৃষ্টি",
      snow: "তুষারপাত",
      rainShowers: "বৃষ্টির ঝাপটা",
      snowShowers: "তুষারপাতের ঝাপটা",
      thunderstorm: "বজ্রঝড়",
      weatherInformation: "আবহাওয়ার তথ্য",
      rainChance: "বৃষ্টির সম্ভাবনা",
      rainfallForecast: "আগামী ২৪ ঘণ্টার বৃষ্টির পূর্বাভাস",
      maxRainProbability: "ঘণ্টাভিত্তিক সর্বোচ্চ বৃষ্টির সম্ভাবনা",
      lastRetrieved: "সর্বশেষ তথ্য সংগ্রহ",
      source: "তথ্যসূত্র",
      automaticRefresh: "প্রতি ১৫ মিনিটে স্বয়ংক্রিয় আপডেট",
      weatherNote:
        "নোট: বর্তমান তাপমাত্রা আবহাওয়া মডেলের আনুমানিক হিসাব। এটি আপনার ফোনের আবহাওয়া সেবা বা স্থানীয় আবহাওয়া কেন্দ্রের তথ্য থেকে ভিন্ন হতে পারে।",

      // Farmer weather advisory
      weatherBasedSuggestions: "আবহাওয়াভিত্তিক কৃষি পরামর্শ",
      chooseYourCrop: "আপনার ফসল নির্বাচন করুন",
      waitBeforeIrrigation: "আজ সেচ দেওয়ার আগে অপেক্ষা করুন",
      waitBeforeIrrigationDescription:
        "আগামী ২৪ ঘণ্টায় বৃষ্টির সম্ভাবনা রয়েছে। জমির মাটির আর্দ্রতা পরীক্ষা করুন। মাটি ভেজা থাকলে অতিরিক্ত সেচের প্রয়োজন নাও হতে পারে।",
      checkSoilBeforeIrrigation: "সেচ দেওয়ার আগে মাটি পরীক্ষা করুন",
      checkSoilBeforeIrrigationDescription:
        "হালকা বৃষ্টির সম্ভাবনা রয়েছে। সেচের সিদ্ধান্ত নেওয়ার আগে মাটির আর্দ্রতা, ফসলের বয়স এবং জমির অবস্থা বিবেচনা করুন।",
      irrigationIfNeeded: "প্রয়োজন অনুযায়ী সেচ দিন",
      irrigationIfNeededDescription:
        "আগামী ২৪ ঘণ্টায় উল্লেখযোগ্য বৃষ্টির পূর্বাভাস নেই। মাটি শুকনো কি না পরীক্ষা করে ফসলের প্রয়োজন অনুযায়ী সেচ দিন।",
      avoidFertilizerToday: "সম্ভব হলে আজ সার প্রয়োগ এড়িয়ে চলুন",
      avoidFertilizerDescription:
        "ভারী বৃষ্টির সম্ভাবনা থাকলে সার ধুয়ে যেতে পারে। বৃষ্টি কমে গেলে এবং জমির অবস্থা উপযুক্ত হলে সার প্রয়োগের পরিকল্পনা করুন।",
      checkWeatherBeforeFertilizer: "সার প্রয়োগের আগে আবহাওয়া দেখুন",
      checkWeatherBeforeFertilizerDescription:
        "বৃষ্টির সম্ভাবনা রয়েছে। সার প্রয়োগের সময় মাটির আর্দ্রতা এবং ফসলের বৃদ্ধির পর্যায় বিবেচনা করুন।",
      planFertilizerIfNeeded: "প্রয়োজনে সার প্রয়োগের পরিকল্পনা করুন",
      planFertilizerDescription:
        "বৃষ্টির সম্ভাবনা তুলনামূলক কম। ফসলের পর্যায়, মাটির অবস্থা এবং সুপারিশকৃত মাত্রা অনুসরণ করুন।",
      highTemperatureAdvice:
        "তাপমাত্রা বেশি। তাই গাছ ও মাটির পানির প্রয়োজন বিশেষভাবে পর্যবেক্ষণ করুন।",
      advisoryOnly:
        "এটি কেবল পরামর্শ। আবহাওয়ার তথ্য দিয়ে সঠিক সেচ বা সারের প্রয়োজন নির্ধারণ করা যায় না। সিদ্ধান্ত নেওয়ার আগে মাটির আর্দ্রতা, ফসলের বৃদ্ধির পর্যায়, মাটি পরীক্ষার ফলাফল এবং স্থানীয় কৃষি পরামর্শ বিবেচনা করুন।",

      // Farmer calculators
      farmerManagement: "কৃষক ব্যবস্থাপনা",
      practicalFarmingTools: "ব্যবহারিক কৃষি সরঞ্জাম",
      farmingToolsDescription:
        "লগইন করা কৃষকদের জন্য বিশেষ কৃষি ক্যালকুলেটর।",
      fertilizerDescription:
        "জমির পরিমাণ এবং সারের প্রয়োগের মাত্রা অনুযায়ী প্রয়োজনীয় সারের পরিমাণ হিসাব করুন।",
      landAreaAcre: "জমির পরিমাণ (একর)",
      fertilizerRateAcre: "সারের প্রয়োগের হার (কেজি/একর)",
      illustrativeCalculation:
        "এটি একটি উদাহরণভিত্তিক হিসাব। ফসল অনুযায়ী কৃষি বিশেষজ্ঞের সুপারিশ অনুসরণ করুন।",
      costProfitDescription:
        "মোট খরচ এবং সম্ভাব্য আয় লিখে কৃষিকাজের লাভ-ক্ষতি হিসাব করুন।",
      totalFarmingCostCurrency: "মোট কৃষি খরচ (৳)",
      expectedRevenueCurrency: "সম্ভাব্য আয় (৳)",
      estimateBasedOnInput:
        "আপনার দেওয়া তথ্যের ভিত্তিতে এই হিসাবটি করা হয়েছে।",

      // About
      aboutAgriSense: "এগ্রিসেন্স বিডি সম্পর্কে",
      technologyForAgriculture: "উন্নত কৃষির জন্য প্রযুক্তি",
      aboutDescription:
        "AgriSense BD একটি স্মার্ট কৃষি প্ল্যাটফর্ম। এখানে কৃষকদের জন্য ফসলের তথ্য, উদ্ভিদের রোগের সম্ভাব্য বিশ্লেষণ, উন্মুক্ত কৃষি বাজার এবং প্রয়োজনীয় কৃষি ব্যবস্থাপনার সরঞ্জাম দেওয়া হয়।",
      aiPoweredAnalysis: "AI-ভিত্তিক উদ্ভিদ বিশ্লেষণ",
      cropFocusedInformation: "ফসলভিত্তিক তথ্য",
      publicMarketplace: "উন্মুক্ত কৃষি বাজার",
      practicalCalculators: "ব্যবহারিক কৃষি ক্যালকুলেটর",

      // Footer
      footerTagline: "স্মার্ট কৃষি। উন্নত সিদ্ধান্ত।",

      // Authentication / errors
      aiServiceError: "ML সেবার সঙ্গে সংযোগ করা যাচ্ছে না।",
      lastUpdated: "সর্বশেষ আপডেট"
    }
  }
};

const savedLanguage = localStorage.getItem("agrisense_language");

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage === "bn" ? "bn" : "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

i18n.on("languageChanged", (language) => {
  localStorage.setItem("agrisense_language", language);
  document.documentElement.lang = language;
});

document.documentElement.lang = i18n.language;

export default i18n;
