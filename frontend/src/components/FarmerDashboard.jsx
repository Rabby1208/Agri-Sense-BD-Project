
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Sprout,
  LayoutDashboard,
  UserRound,
  Wheat,
  Plus,
  RefreshCw,
  LogOut,
  LandPlot,
  TrendingUp,
  TrendingDown,
  Wallet,
  Trash2,
  AlertCircle,
  CheckCircle,
  LoaderCircle,
  X,
  ClipboardList,
  MessageSquareText,
  Pencil,
  Save,
  CloudSun,
  Store,
} from "lucide-react";

import {
  getFarmerDashboard,
  getFarmerProfile,
  getAvailableCrops,
  getMyCrops,
  addFarmerCrop,
  deleteFarmerCrop,
  updateFarmerProfile,
} from "../services/farmerApi";

import FarmerDiseaseDetection from "./FarmerDiseaseDetection";
import FarmerDiseaseHistory from "./FarmerDiseaseHistory";
import FarmerExpertAdvice from "./FarmerExpertAdvice";
import FarmerExpertCommunication from "./FarmerExpertCommunication";
import FarmerExpenseTracker from "./FarmerExpenseTracker";
import FarmerWeatherAdvisory from "./FarmerWeatherAdvisory";
import FarmerMarketplaceSales from "./FarmerMarketplaceSales";
import DemoMarketPrices from "./DemoMarketPrices";

import "./FarmerDashboard.css";

const API_BASE_URL = "http://localhost:5000";
const REFRESH_INTERVAL = 5000;

const initialCropForm = {
  crop_id: "",
  land_area: "",
  land_unit: "ACRE",
  planting_date: "",
  notes: "",
};

const initialProfileForm = {
  full_name: "",
  phone: "",
  address: "",
  district: "",
  upazila: "",
};

/* Crop name translations */
const cropNameTranslations = {
  rice: "ধান",
  paddy: "ধান",
  wheat: "গম",
  maize: "ভুট্টা",
  corn: "ভুট্টা",
  potato: "আলু",
  tomato: "টমেটো",
  onion: "পেঁয়াজ",
  garlic: "রসুন",
  chili: "মরিচ",
  chilli: "মরিচ",
  "green chili": "কাঁচা মরিচ",
  brinjal: "বেগুন",
  eggplant: "বেগুন",
  cauliflower: "ফুলকপি",
  cabbage: "বাঁধাকপি",
  carrot: "গাজর",
  radish: "মূলা",
  cucumber: "শসা",
  pumpkin: "মিষ্টি কুমড়া",
  "bottle gourd": "লাউ",
  "bitter gourd": "করলা",
  okra: "ঢেঁড়স",
  "ladies finger": "ঢেঁড়স",
  spinach: "পালং শাক",
  jute: "পাট",
  mustard: "সরিষা",
  lentil: "মসুর ডাল",
  masoor: "মসুর",
  chickpea: "ছোলা",
  gram: "ছোলা",
  "mung bean": "মুগ ডাল",
  "black gram": "মাষকলাই",
  sugarcane: "আখ",
  mango: "আম",
  banana: "কলা",
  papaya: "পেঁপে",
  guava: "পেয়ারা",
  jackfruit: "কাঁঠাল",
  watermelon: "তরমুজ",
  lemon: "লেবু",
  coconut: "নারিকেল",
  "betel nut": "সুপারি",
  groundnut: "চিনাবাদাম",
  peanut: "চিনাবাদাম",
  sesame: "তিল",
  soybean: "সয়াবিন",
  cotton: "তুলা",
  tea: "চা",
  "sweet potato": "মিষ্টি আলু",
  sweetcorn: "মিষ্টি ভুট্টা",
  "dragon fruit": "ড্রাগন ফল",
  strawberry: "স্ট্রবেরি",
};

const extractArray = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.crops)) return response.crops;
  if (Array.isArray(response?.data?.crops)) return response.data.crops;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
};

const extractObject = (response) => {
  if (!response) return {};

  if (response.data && !Array.isArray(response.data)) {
    return response.data;
  }

  return response;
};

const getProfitRows = (data) => {
  if (Array.isArray(data?.profit_loss)) return data.profit_loss;
  if (Array.isArray(data?.crops)) return data.crops;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const getTotalFromRows = (rows, fields) => {
  return rows.reduce((total, row) => {
    for (const field of fields) {
      if (row?.[field] !== undefined && row?.[field] !== null) {
        return total + Number(row[field] || 0);
      }
    }

    return total;
  }, 0);
};

const translateStatus = (status, isBangla) => {
  if (!isBangla) return status;

  const normalized = String(status || "").toUpperCase();

  const translations = {
    ACTIVE: "সক্রিয়",
    INACTIVE: "নিষ্ক্রিয়",
    COMPLETED: "সম্পন্ন",
    PENDING: "অপেক্ষমাণ",
    CANCELLED: "বাতিল",
    APPROVED: "অনুমোদিত",
    REJECTED: "প্রত্যাখ্যাত",
  };

  return translations[normalized] || status;
};

function FarmerDashboard({ user, onLogout }) {
  const { i18n } = useTranslation();

  const isBangla = i18n.language?.startsWith("bn");

  const L = (english, bangla) => (isBangla ? bangla : english);

  const formatMoney = (amount) => {
    const value = Number(amount || 0);

    return `৳${value.toLocaleString(
      isBangla ? "bn-BD" : "en-BD",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const formatNumber = (number) => {
    return Number(number || 0).toLocaleString(
      isBangla ? "bn-BD" : "en-BD"
    );
  };

  const formatDate = (date) => {
    if (!date) return L("N/A", "প্রযোজ্য নয়");

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString(
      isBangla ? "bn-BD" : "en-BD",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const [activeTab, setActiveTab] = useState("overview");

  const [dashboard, setDashboard] = useState({});
  const [profitData, setProfitData] = useState({});
  const [profile, setProfile] = useState({});
  const [availableCrops, setAvailableCrops] = useState([]);
  const [myCrops, setMyCrops] = useState([]);

  const [cropForm, setCropForm] = useState(initialCropForm);
  const [showCropForm, setShowCropForm] = useState(false);

  const [profileForm, setProfileForm] = useState(initialProfileForm);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingCrop, setSavingCrop] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [deletingCropId, setDeletingCropId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  /* Translate crop name without changing backend data */
  function getCropName(crop) {
    const name =
      crop.crop_name ||
      crop.name ||
      crop.crop?.name ||
      crop.crop?.crop_name ||
      crop.crop_name_bn ||
      crop.bangla_name ||
      crop.name_bn ||
      "Unknown Crop";

    if (!isBangla) return name;

    const normalizedName = String(name).trim().toLowerCase();

    return cropNameTranslations[normalizedName] || name;
  }

  const loadDashboard = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setRefreshing(true);
    }

    setError("");

    const token = localStorage.getItem("agrisense_token");

    try {
      const requests = [
        getFarmerDashboard(),
        getFarmerProfile(),
        getAvailableCrops(),
        getMyCrops(),

        fetch(`${API_BASE_URL}/api/crop-sales/profit-loss`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }).then(async (response) => {
          const data = await response.json().catch(() => ({}));

          if (!response.ok) {
            throw new Error(
              data.message ||
                L(
                  "Profit/Loss data load failed",
                  "লাভ/ক্ষতির তথ্য লোড করা যায়নি"
                )
            );
          }

          return data;
        }),
      ];

      const results = await Promise.allSettled(requests);

      if (results[0].status === "fulfilled") {
        setDashboard(extractObject(results[0].value));
      } else {
        console.error("Dashboard Error:", results[0].reason);
      }

      if (results[1].status === "fulfilled") {
        const profileData = extractObject(results[1].value);
        const actualProfile = profileData.profile || profileData;

        setProfile(actualProfile);

        setProfileForm({
          full_name: actualProfile.full_name || "",
          phone: actualProfile.phone || "",
          address: actualProfile.address || "",
          district: actualProfile.district || "",
          upazila: actualProfile.upazila || "",
        });
      } else {
        console.error("Profile Error:", results[1].reason);
      }

      if (results[2].status === "fulfilled") {
        setAvailableCrops(extractArray(results[2].value));
      } else {
        console.error("Available Crops Error:", results[2].reason);
      }

      if (results[3].status === "fulfilled") {
        setMyCrops(extractArray(results[3].value));
      } else {
        console.error("My Crops Error:", results[3].reason);
      }

      if (results[4].status === "fulfilled") {
        setProfitData(extractObject(results[4].value));
      } else {
        console.error("Profit/Loss Error:", results[4].reason);

        setError(
          results[4].reason?.message ||
            L(
              "Unable to load profit/loss information.",
              "লাভ/ক্ষতির হিসাব লোড করা যায়নি।"
            )
        );
      }

      const allFailed = results.every(
        (result) => result.status === "rejected"
      );

      if (allFailed) {
        setError(
          L(
            "Dashboard data could not be loaded. Please try again.",
            "ড্যাশবোর্ডের তথ্য লোড করা যায়নি। আবার চেষ্টা করুন।"
          )
        );
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard Loading Error:", err);

      setError(
        err.message ||
          L(
            "There was a problem loading dashboard data.",
            "ড্যাশবোর্ডের তথ্য লোড করতে সমস্যা হয়েছে।"
          )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isBangla]);

  useEffect(() => {
    loadDashboard(true);

    const interval = setInterval(() => {
      loadDashboard(false);
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [loadDashboard]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadDashboard(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [loadDashboard]);

  const cropCount = myCrops.length;

  const totalLand = useMemo(() => {
    return myCrops.reduce(
      (total, crop) => total + Number(crop.land_area || 0),
      0
    );
  }, [myCrops]);

  const profitRows = useMemo(
    () => getProfitRows(profitData),
    [profitData]
  );

  const rowRevenue = useMemo(
    () =>
      getTotalFromRows(profitRows, [
        "total_revenue",
        "revenue",
        "total_sales",
        "sales_revenue",
      ]),
    [profitRows]
  );

  const rowExpenses = useMemo(
    () =>
      getTotalFromRows(profitRows, [
        "total_expenses",
        "expense",
        "total_cost",
        "total_expense",
        "farming_expense",
      ]),
    [profitRows]
  );

  const apiRevenue = Number(
    profitData.total_revenue ??
      profitData.total_sales ??
      profitData.total_income ??
      0
  );

  const apiExpenses = Number(
    profitData.total_expenses ??
      profitData.total_cost ??
      profitData.total_expense ??
      0
  );

  const totalRevenue = apiRevenue > 0 ? apiRevenue : rowRevenue;

  const totalCost = apiExpenses > 0 ? apiExpenses : rowExpenses;

  const apiProfit =
    profitData.total_profit ??
    profitData.profit ??
    profitData.net_profit;

  const profitLoss =
    apiProfit !== undefined && apiProfit !== null
      ? Number(apiProfit)
      : totalRevenue - totalCost;

  const handleCropFormChange = (event) => {
    const { name, value } = event.target;

    setCropForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleProfileFormChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const startProfileEdit = () => {
    setProfileForm({
      full_name: profile.full_name || "",
      phone: profile.phone || "",
      address: profile.address || "",
      district: profile.district || "",
      upazila: profile.upazila || "",
    });

    setIsEditingProfile(true);
    setError("");
    setSuccess("");
  };

  const cancelProfileEdit = () => {
    setIsEditingProfile(false);

    setProfileForm({
      full_name: profile.full_name || "",
      phone: profile.phone || "",
      address: profile.address || "",
      district: profile.district || "",
      upazila: profile.upazila || "",
    });
  };

  const handleProfileUpdate = async (event) => {
    event.preventDefault();

    if (!profileForm.full_name.trim()) {
      setError(L("Please enter your name.", "আপনার নাম লিখুন।"));
      return;
    }

    if (!/^\+?[0-9]{10,15}$/.test(profileForm.phone.trim())) {
      setError(L("Please enter a valid phone number.", "সঠিক ফোন নম্বর লিখুন।"));
      return;
    }

    setSavingProfile(true);
    setError("");
    setSuccess("");

    try {
      const response = await updateFarmerProfile(profileForm);

      const updatedProfile =
        extractObject(response).profile || extractObject(response);

      setProfile((previous) => ({
        ...previous,
        ...profileForm,
        ...updatedProfile,
      }));

      const savedUser = localStorage.getItem("agrisense_user");

      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);

          localStorage.setItem(
            "agrisense_user",
            JSON.stringify({
              ...parsedUser,
              ...profileForm,
            })
          );
        } catch {
          // Ignore invalid local user data.
        }
      }

      setIsEditingProfile(false);
      setSuccess(
        L(
          "Profile updated successfully.",
          "প্রোফাইল সফলভাবে আপডেট হয়েছে।"
        )
      );

      await loadDashboard(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          L("Could not update profile.", "প্রোফাইল আপডেট করা যায়নি।")
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddCrop = async (event) => {
    event.preventDefault();

    if (
      !cropForm.crop_id ||
      !cropForm.land_area ||
      !cropForm.planting_date
    ) {
      setError(
        L(
          "Please fill in all required information.",
          "সব প্রয়োজনীয় তথ্য পূরণ করুন।"
        )
      );
      return;
    }

    if (Number(cropForm.land_area) <= 0) {
      setError(
        L(
          "Land area must be greater than zero.",
          "জমির পরিমাণ শূন্যের বেশি হতে হবে।"
        )
      );
      return;
    }

    setSavingCrop(true);
    setError("");
    setSuccess("");

    try {
      await addFarmerCrop({
        ...cropForm,
        land_area: Number(cropForm.land_area),
      });

      setCropForm(initialCropForm);
      setShowCropForm(false);
      setSuccess(
        L("New crop added successfully.", "নতুন ফসল সফলভাবে যোগ হয়েছে।")
      );

      await loadDashboard(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          L("Could not add crop.", "ফসল যোগ করা যায়নি।")
      );
    } finally {
      setSavingCrop(false);
    }
  };

  const getCropId = (crop) => {
    return crop.id || crop.farmer_crop_id || crop.crop_record_id;
  };

  const handleDeleteCrop = async (crop) => {
    const cropId = getCropId(crop);

    if (!cropId) {
      setError(L("Crop ID not found.", "ফসলের আইডি পাওয়া যায়নি।"));
      return;
    }

    const confirmed = window.confirm(
      L(
        "Are you sure you want to delete this crop?",
        "আপনি কি এই ফসলটি মুছে ফেলতে চান?"
      )
    );

    if (!confirmed) return;

    setDeletingCropId(cropId);
    setError("");
    setSuccess("");

    try {
      await deleteFarmerCrop(cropId);

      setSuccess(
        L("Crop deleted successfully.", "ফসল সফলভাবে মুছে ফেলা হয়েছে।")
      );

      await loadDashboard(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          L("Could not delete crop.", "ফসল মুছে ফেলা যায়নি।")
      );
    } finally {
      setDeletingCropId(null);
    }
  };

  function getCropStatus(crop) {
    return (
      crop.status ||
      crop.crop_status ||
      crop.farming_status ||
      "ACTIVE"
    );
  }

  function statusClass(status) {
    return String(status).toLowerCase().replace(/\s+/g, "-");
  }

  const pageTitle = {
    overview: L("Dashboard Overview", "ড্যাশবোর্ড"),
    crops: L("My Crops", "আমার ফসল"),
    expenses: L("Expense Tracker", "খরচের হিসাব"),
    marketplace: L("Marketplace & Sales", "বাজার ও বিক্রয়"),
    weather: L("Weather & Advisory", "আবহাওয়া ও পরামর্শ"),
    "disease-detection": L("AI Disease Detection", "এআই রোগ শনাক্তকরণ"),
    "disease-history": L("Disease Detection History", "রোগ শনাক্তকরণের ইতিহাস"),
    advice: L("My Expert Advice", "বিশেষজ্ঞের পরামর্শ"),
    "expert-communication": L(
      "Contact an Agriculture Expert",
      "কৃষি বিশেষজ্ঞের সাথে যোগাযোগ"
    ),
    profile: L("My Profile", "আমার প্রোফাইল"),
  };

  const navigationItems = [
    { id: "overview", label: L("Overview", "সংক্ষিপ্ত বিবরণ"), icon: LayoutDashboard },
    { id: "crops", label: L("My Crops", "আমার ফসল"), icon: Wheat },
    { id: "expenses", label: L("Expense Tracker", "খরচের হিসাব"), icon: Wallet },
    { id: "marketplace", label: L("Marketplace & Sales", "বাজার ও বিক্রয়"), icon: Store },
    { id: "weather", label: L("Weather & Advisory", "আবহাওয়া ও পরামর্শ"), icon: CloudSun },
    { id: "disease-detection", label: L("AI Disease Detection", "এআই রোগ শনাক্তকরণ"), icon: Sprout },
    { id: "disease-history", label: L("Disease History", "রোগের ইতিহাস"), icon: ClipboardList },
    { id: "advice", label: L("My Expert Advice", "বিশেষজ্ঞের পরামর্শ"), icon: MessageSquareText },
    {
      id: "expert-communication",
      label: L("Contact Expert", "বিশেষজ্ঞের সাথে যোগাযোগ"),
      icon: MessageSquareText,
    },
    { id: "profile", label: L("My Profile", "আমার প্রোফাইল"), icon: UserRound },
  ];

  const displayName =
    profile.full_name ||
    user?.full_name ||
    user?.name ||
    L("Farmer", "কৃষক");

  return (
    <div className="farmer-dashboard">
      <aside className="farmer-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Sprout size={25} />
          </div>

          <div>
            <h2>AgriSense BD</h2>
            <span>{L("Farmer Portal", "কৃষক পোর্টাল")}</span>
          </div>
        </div>

        <div className="sidebar-profile">
          <div className="sidebar-avatar">
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div>
            <h4>{displayName}</h4>
            <span>{L("Farmer Account", "কৃষক অ্যাকাউন্ট")}</span>
          </div>
        </div>

        <nav className="sidebar-navigation">
          <span className="sidebar-section-title">
            {L("MAIN MENU", "প্রধান মেনু")}
          </span>

          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                className={activeTab === item.id ? "active" : ""}
                onClick={() => {
                  setActiveTab(item.id);
                  setError("");
                  setSuccess("");

                  if (item.id === "overview") {
                    loadDashboard(false);
                  }
                }}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="logout-button"
            onClick={onLogout}
          >
            <LogOut size={19} />
            <span>{L("Logout", "লগআউট")}</span>
          </button>
        </div>
      </aside>

      <main className="farmer-main">
        <header className="farmer-topbar">
          <div>
            <h1>{pageTitle[activeTab]}</h1>
            <p>
              {L("Welcome back", "আবারও স্বাগতম")}, {displayName}
            </p>
          </div>

          <div className="topbar-actions">
            {lastUpdated && (
              <span className="last-updated">
                {L("Updated:", "সর্বশেষ আপডেট:")}{" "}
                {lastUpdated.toLocaleTimeString(
                  isBangla ? "bn-BD" : "en-BD"
                )}
              </span>
            )}

            <button
              type="button"
              className="refresh-button"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
            >
              <RefreshCw
                size={17}
                className={refreshing ? "spin" : ""}
              />
              {L("Refresh", "রিফ্রেশ")}
            </button>
          </div>
        </header>

        <div className="farmer-content">
          {error && (
            <div className="dashboard-alert error-alert">
              <AlertCircle size={18} />
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
                aria-label={L("Close alert", "বার্তা বন্ধ করুন")}
              >
                <X size={17} />
              </button>
            </div>
          )}

          {success && (
            <div className="dashboard-alert success-alert">
              <CheckCircle size={18} />
              <span>{success}</span>

              <button
                type="button"
                onClick={() => setSuccess("")}
                aria-label={L("Close alert", "বার্তা বন্ধ করুন")}
              >
                <X size={17} />
              </button>
            </div>
          )}

          {loading ? (
            <div className="dashboard-loading">
              <LoaderCircle size={35} className="spin" />
              <p>
                {L(
                  "Loading your dashboard...",
                  "আপনার ড্যাশবোর্ড লোড হচ্ছে..."
                )}
              </p>
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <section className="overview-section">
                  <div className="welcome-card">
                    <div>
                      <span className="welcome-label">
                        {L("FARMER DASHBOARD", "কৃষক ড্যাশবোর্ড")}
                      </span>

                      <h2>
                        {L("Welcome back", "আবারও স্বাগতম")}, {displayName}!
                      </h2>

                      <p>
                        {L(
                          "Manage your crops, track farming expenses and monitor crop health from one place.",
                          "এক জায়গা থেকেই আপনার ফসল পরিচালনা করুন, কৃষি খরচের হিসাব রাখুন এবং ফসলের স্বাস্থ্য পর্যবেক্ষণ করুন।"
                        )}
                      </p>

                      <button
                        type="button"
                        onClick={() => setActiveTab("crops")}
                      >
                        {L("Manage My Crops", "আমার ফসল পরিচালনা করুন")}
                      </button>
                    </div>

                    <div className="welcome-icon">
                      <Sprout size={75} />
                    </div>
                  </div>

                  <div className="dashboard-stats">
                    <div className="stat-card">
                      <div className="stat-icon green">
                        <Wheat size={23} />
                      </div>
                      <div>
                        <span>{L("Total Crops", "মোট ফসল")}</span>
                        <h3>{formatNumber(cropCount)}</h3>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon blue">
                        <LandPlot size={23} />
                      </div>
                      <div>
                        <span>{L("Total Land", "মোট জমি")}</span>
                        <h3>
                          {formatNumber(totalLand)}{" "}
                          <small>{L("acres", "একর")}</small>
                        </h3>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon green">
                        <TrendingUp size={23} />
                      </div>
                      <div>
                        <span>{L("Total Revenue", "মোট আয়")}</span>
                        <h3>{formatMoney(totalRevenue)}</h3>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon orange">
                        <Wallet size={23} />
                      </div>
                      <div>
                        <span>{L("Total Expenses", "মোট খরচ")}</span>
                        <h3>{formatMoney(totalCost)}</h3>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div
                        className={`stat-icon ${
                          profitLoss >= 0 ? "green" : "red"
                        }`}
                      >
                        {profitLoss >= 0 ? (
                          <TrendingUp size={23} />
                        ) : (
                          <TrendingDown size={23} />
                        )}
                      </div>
                      <div>
                        <span>{L("Profit / Loss", "লাভ / ক্ষতি")}</span>
                        <h3>{formatMoney(profitLoss)}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-panel">
                    <div className="panel-heading">
                      <div>
                        <h3>{L("My Recent Crops", "আমার সাম্প্রতিক ফসল")}</h3>
                        <p>
                          {L(
                            "Your recently added crops",
                            "আপনার সম্প্রতি যোগ করা ফসল"
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveTab("crops")}
                      >
                        {L("View All", "সব দেখুন")}
                      </button>
                    </div>

                    {myCrops.length === 0 ? (
                      <div className="empty-state">
                        <Wheat size={38} />
                        <h4>
                          {L(
                            "No crops added yet",
                            "এখনো কোনো ফসল যোগ করা হয়নি"
                          )}
                        </h4>
                        <p>
                          {L(
                            "Add your first crop to manage your farming activities.",
                            "আপনার কৃষিকাজ পরিচালনা করতে প্রথম ফসলটি যোগ করুন।"
                          )}
                        </p>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab("crops");
                            setShowCropForm(true);
                          }}
                        >
                          <Plus size={17} />
                          {L("Add Crop", "ফসল যোগ করুন")}
                        </button>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="dashboard-table">
                          <thead>
                            <tr>
                              <th>{L("Crop Name", "ফসলের নাম")}</th>
                              <th>{L("Land Area", "জমির পরিমাণ")}</th>
                              <th>{L("Planting Date", "রোপণের তারিখ")}</th>
                              <th>{L("Status", "অবস্থা")}</th>
                            </tr>
                          </thead>

                          <tbody>
                            {myCrops.slice(0, 5).map((crop, index) => (
                              <tr key={getCropId(crop) || index}>
                                <td>{getCropName(crop)}</td>
                                <td>
                                  {formatNumber(crop.land_area || 0)}{" "}
                                  {crop.land_unit === "DECIMAL"
                                    ? L("Decimal", "শতাংশ")
                                    : crop.land_unit === "HECTARE"
                                    ? L("Hectare", "হেক্টর")
                                    : L("Acre", "একর")}
                                </td>
                                <td>{formatDate(crop.planting_date)}</td>
                                <td>
                                  <span
                                    className={`status-badge ${statusClass(
                                      getCropStatus(crop)
                                    )}`}
                                  >
                                    {translateStatus(
                                      getCropStatus(crop),
                                      isBangla
                                    )}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <DemoMarketPrices />

                  <div className="quick-actions">
                    <h3>{L("Quick Actions", "দ্রুত কাজ")}</h3>

                    <div className="quick-action-grid">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("crops");
                          setShowCropForm(true);
                        }}
                      >
                        <Plus size={21} />
                        <span>{L("Add New Crop", "নতুন ফসল যোগ করুন")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab("expenses")}
                      >
                        <Wallet size={21} />
                        <span>{L("Track Expenses", "খরচের হিসাব রাখুন")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab("marketplace")}
                      >
                        <Store size={21} />
                        <span>{L("Marketplace & Sales", "বাজার ও বিক্রয়")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab("weather")}
                      >
                        <CloudSun size={21} />
                        <span>{L("Check Weather", "আবহাওয়া দেখুন")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab("disease-detection")}
                      >
                        <Sprout size={21} />
                        <span>{L("Detect Disease", "রোগ শনাক্ত করুন")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab("advice")}
                      >
                        <MessageSquareText size={21} />
                        <span>{L("Get Expert Advice", "বিশেষজ্ঞের পরামর্শ নিন")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab("expert-communication")}
                      >
                        <MessageSquareText size={21} />
                        <span>
                          {L("Contact an Expert", "বিশেষজ্ঞের সাথে যোগাযোগ করুন")}
                        </span>
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {activeTab === "crops" && (
                <section className="crops-section">
                  <div className="section-heading">
                    <div>
                      <h2>{L("My Crops", "আমার ফসল")}</h2>
                      <p>
                        {L(
                          "Manage your planted crops and land information.",
                          "আপনার রোপণ করা ফসল ও জমির তথ্য পরিচালনা করুন।"
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => setShowCropForm(!showCropForm)}
                    >
                      {showCropForm ? <X size={18} /> : <Plus size={18} />}
                      {showCropForm
                        ? L("Cancel", "বাতিল")
                        : L("Add New Crop", "নতুন ফসল যোগ করুন")}
                    </button>
                  </div>

                  {showCropForm && (
                    <form
                      className="dashboard-form crop-form"
                      onSubmit={handleAddCrop}
                    >
                      <h3>{L("Add New Crop", "নতুন ফসল যোগ করুন")}</h3>

                      <div className="form-grid">
                        <div className="form-group">
                          <label>
                            {L("Select Crop *", "ফসল নির্বাচন করুন *")}
                          </label>
                          <select
                            name="crop_id"
                            value={cropForm.crop_id}
                            onChange={handleCropFormChange}
                            required
                          >
                            <option value="">
                              {L("Select a crop", "একটি ফসল নির্বাচন করুন")}
                            </option>

                            {availableCrops.map((crop, index) => (
                              <option
                                key={crop.id || index}
                                value={crop.id}
                              >
                                {getCropName(crop)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>{L("Land Area *", "জমির পরিমাণ *")}</label>
                          <input
                            type="number"
                            name="land_area"
                            min="0.01"
                            step="0.01"
                            value={cropForm.land_area}
                            onChange={handleCropFormChange}
                            placeholder={L(
                              "Enter land area",
                              "জমির পরিমাণ লিখুন"
                            )}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>{L("Land Unit", "জমির একক")}</label>
                          <select
                            name="land_unit"
                            value={cropForm.land_unit}
                            onChange={handleCropFormChange}
                          >
                            <option value="ACRE">{L("Acre", "একর")}</option>
                            <option value="DECIMAL">
                              {L("Decimal", "শতাংশ")}
                            </option>
                            <option value="HECTARE">
                              {L("Hectare", "হেক্টর")}
                            </option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>
                            {L("Planting Date *", "রোপণের তারিখ *")}
                          </label>
                          <input
                            type="date"
                            name="planting_date"
                            value={cropForm.planting_date}
                            onChange={handleCropFormChange}
                            required
                          />
                        </div>

                        <div className="form-group full-width">
                          <label>{L("Notes", "অতিরিক্ত তথ্য")}</label>
                          <textarea
                            name="notes"
                            value={cropForm.notes}
                            onChange={handleCropFormChange}
                            placeholder={L(
                              "Additional information...",
                              "অতিরিক্ত তথ্য লিখুন..."
                            )}
                            rows="3"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="primary-button"
                        disabled={savingCrop}
                      >
                        {savingCrop ? (
                          <LoaderCircle size={18} className="spin" />
                        ) : (
                          <Save size={18} />
                        )}
                        {savingCrop
                          ? L("Saving...", "সংরক্ষণ হচ্ছে...")
                          : L("Save Crop", "ফসল সংরক্ষণ করুন")}
                      </button>
                    </form>
                  )}

                  <div className="dashboard-panel">
                    {myCrops.length === 0 ? (
                      <div className="empty-state">
                        <Wheat size={40} />
                        <h3>{L("No crops found", "কোনো ফসল পাওয়া যায়নি")}</h3>
                        <p>
                          {L(
                            "Click Add New Crop to add your first crop.",
                            "প্রথম ফসল যোগ করতে নতুন ফসল যোগ করুন বাটনে ক্লিক করুন।"
                          )}
                        </p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="dashboard-table">
                          <thead>
                            <tr>
                              <th>{L("Crop Name", "ফসলের নাম")}</th>
                              <th>{L("Land Area", "জমির পরিমাণ")}</th>
                              <th>{L("Planting Date", "রোপণের তারিখ")}</th>
                              <th>{L("Status", "অবস্থা")}</th>
                              <th>{L("Action", "কার্যক্রম")}</th>
                            </tr>
                          </thead>

                          <tbody>
                            {myCrops.map((crop, index) => {
                              const cropId = getCropId(crop);

                              return (
                                <tr key={cropId || index}>
                                  <td>{getCropName(crop)}</td>
                                  <td>
                                    {formatNumber(crop.land_area || 0)}{" "}
                                    {crop.land_unit === "DECIMAL"
                                      ? L("Decimal", "শতাংশ")
                                      : crop.land_unit === "HECTARE"
                                      ? L("Hectare", "হেক্টর")
                                      : L("Acre", "একর")}
                                  </td>
                                  <td>{formatDate(crop.planting_date)}</td>
                                  <td>
                                    <span
                                      className={`status-badge ${statusClass(
                                        getCropStatus(crop)
                                      )}`}
                                    >
                                      {translateStatus(
                                        getCropStatus(crop),
                                        isBangla
                                      )}
                                    </span>
                                  </td>
                                  <td>
                                    <button
                                      type="button"
                                      className="icon-button danger"
                                      onClick={() => handleDeleteCrop(crop)}
                                      disabled={deletingCropId === cropId}
                                      title={L(
                                        "Delete crop",
                                        "ফসল মুছে ফেলুন"
                                      )}
                                      aria-label={L(
                                        "Delete crop",
                                        "ফসল মুছে ফেলুন"
                                      )}
                                    >
                                      {deletingCropId === cropId ? (
                                        <LoaderCircle
                                          size={17}
                                          className="spin"
                                        />
                                      ) : (
                                        <Trash2 size={17} />
                                      )}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {activeTab === "expenses" && (
                <section className="expenses-section">
                  <FarmerExpenseTracker />
                </section>
              )}

              {activeTab === "marketplace" && (
                <section className="marketplace-sales-section">
                  <FarmerMarketplaceSales myCrops={myCrops} />
                </section>
              )}

              {activeTab === "weather" && (
                <section className="weather-section">
                  <FarmerWeatherAdvisory
                    myCrops={myCrops}
                    profile={profile}
                  />
                </section>
              )}

              {activeTab === "disease-detection" && (
                <section className="disease-section">
                  <FarmerDiseaseDetection />
                </section>
              )}

              {activeTab === "disease-history" && (
                <section className="disease-history-section">
                  <FarmerDiseaseHistory />
                </section>
              )}

              {activeTab === "advice" && (
                <section className="expert-advice-section">
                  <FarmerExpertAdvice />
                </section>
              )}

              {activeTab === "expert-communication" && (
                <section className="expert-communication-section">
                  <FarmerExpertCommunication />
                </section>
              )}

              {activeTab === "profile" && (
                <section className="profile-section">
                  <div className="section-heading">
                    <div>
                      <h2>{L("My Profile", "আমার প্রোফাইল")}</h2>
                      <p>
                        {L(
                          "View and manage your personal information.",
                          "আপনার ব্যক্তিগত তথ্য দেখুন ও পরিচালনা করুন।"
                        )}
                      </p>
                    </div>

                    {!isEditingProfile && (
                      <button
                        type="button"
                        className="primary-button"
                        onClick={startProfileEdit}
                      >
                        <Pencil size={17} />
                        {L("Edit Profile", "প্রোফাইল সম্পাদনা")}
                      </button>
                    )}
                  </div>

                  <div className="dashboard-panel profile-panel">
                    {isEditingProfile ? (
                      <form onSubmit={handleProfileUpdate}>
                        <h3>
                          {L(
                            "Edit Personal Information",
                            "ব্যক্তিগত তথ্য সম্পাদনা"
                          )}
                        </h3>

                        <div className="form-grid">
                          <div className="form-group">
                            <label>{L("Full Name *", "পুরো নাম *")}</label>
                            <input
                              type="text"
                              name="full_name"
                              value={profileForm.full_name}
                              onChange={handleProfileFormChange}
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label>{L("Phone Number *", "ফোন নম্বর *")}</label>
                            <input
                              type="tel"
                              name="phone"
                              value={profileForm.phone}
                              onChange={handleProfileFormChange}
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label>{L("District", "জেলা")}</label>
                            <input
                              type="text"
                              name="district"
                              value={profileForm.district}
                              onChange={handleProfileFormChange}
                            />
                          </div>

                          <div className="form-group">
                            <label>{L("Upazila", "উপজেলা")}</label>
                            <input
                              type="text"
                              name="upazila"
                              value={profileForm.upazila}
                              onChange={handleProfileFormChange}
                            />
                          </div>

                          <div className="form-group full-width">
                            <label>{L("Address", "ঠিকানা")}</label>
                            <textarea
                              name="address"
                              value={profileForm.address}
                              onChange={handleProfileFormChange}
                              rows="3"
                            />
                          </div>
                        </div>

                        <div className="form-actions">
                          <button
                            type="submit"
                            className="primary-button"
                            disabled={savingProfile}
                          >
                            {savingProfile ? (
                              <LoaderCircle
                                size={17}
                                className="spin"
                              />
                            ) : (
                              <Save size={17} />
                            )}
                            {savingProfile
                              ? L("Saving...", "সংরক্ষণ হচ্ছে...")
                              : L(
                                  "Save Changes",
                                  "পরিবর্তন সংরক্ষণ করুন"
                                )}
                          </button>

                          <button
                            type="button"
                            className="secondary-button"
                            onClick={cancelProfileEdit}
                          >
                            {L("Cancel", "বাতিল")}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="profile-header">
                          <div className="profile-avatar">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3>{displayName}</h3>
                            <p>
                              {L(
                                "AgriSense BD Farmer",
                                "AgriSense BD কৃষক"
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="profile-details">
                          <div className="profile-detail">
                            <span>{L("Full Name", "পুরো নাম")}</span>
                            <strong>
                              {profile.full_name ||
                                L("Not provided", "দেওয়া হয়নি")}
                            </strong>
                          </div>

                          <div className="profile-detail">
                            <span>{L("Phone Number", "ফোন নম্বর")}</span>
                            <strong>
                              {profile.phone ||
                                L("Not provided", "দেওয়া হয়নি")}
                            </strong>
                          </div>

                          <div className="profile-detail">
                            <span>{L("District", "জেলা")}</span>
                            <strong>
                              {profile.district ||
                                L("Not provided", "দেওয়া হয়নি")}
                            </strong>
                          </div>

                          <div className="profile-detail">
                            <span>{L("Upazila", "উপজেলা")}</span>
                            <strong>
                              {profile.upazila ||
                                L("Not provided", "দেওয়া হয়নি")}
                            </strong>
                          </div>

                          <div className="profile-detail full-width">
                            <span>{L("Address", "ঠিকানা")}</span>
                            <strong>
                              {profile.address ||
                                L("Not provided", "দেওয়া হয়নি")}
                            </strong>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default FarmerDashboard;
