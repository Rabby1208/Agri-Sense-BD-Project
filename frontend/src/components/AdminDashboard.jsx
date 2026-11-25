
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ShieldCheck, LayoutDashboard, Users, GraduationCap, Sprout,
  UserRound, RefreshCw, LogOut, Plus, X, Phone, Lock,
  CheckCircle, AlertCircle, LoaderCircle, UserPlus, Activity,
  Microscope, Search, ChevronLeft, ChevronRight, Leaf, Bug,
  ClipboardList,
} from "lucide-react";

import {
  getAdminProfile,
  getAdminDashboard,
  getAdminExperts,
  createAgriExpert,
  getAdminDiseaseDetectionStats,
  getAdminDiseaseDetectionHistory,
} from "../services/adminApi";

import AdminExpertManagement from "./AdminExpertManagement";
import "./AdminDashboard.css";

const initialExpertForm = {
  full_name: "",
  phone: "",
  password: "",
};

const PAGE_SIZE = 10;

function unwrapObject(result) {
  if (!result) return {};
  if (result.data && !Array.isArray(result.data)) return result.data;
  return result;
}

function unwrapArray(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.data)) return result.data.data;
  if (Array.isArray(result?.records)) return result.records;
  if (Array.isArray(result?.history)) return result.history;
  if (Array.isArray(result?.data?.records)) return result.data.records;
  if (Array.isArray(result?.data?.history)) return result.data.history;
  return [];
}

function getPayload(result) {
  let value = result || {};
  if (value.data && !Array.isArray(value.data)) value = value.data;
  if (value.data && !Array.isArray(value.data)) value = value.data;
  return value || {};
}

function formatDate(value, isBangla = false) {
  if (!value) return isBangla ? "তথ্য নেই" : "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString(
    isBangla ? "bn-BD" : "en-US"
  );
}

function formatPercent(value, isBangla = false) {
  if (value === null || value === undefined || value === "") return "—";

  const number = Number(value);
  if (!Number.isFinite(number)) return "—";

  const formatted = (number <= 1 ? number * 100 : number).toFixed(1);
  return `${isBangla ? Number(formatted).toLocaleString("bn-BD") : formatted}%`;
}

function getDetectionStatus(record, isBangla = false) {
  const status = String(record?.detection_status || "").toLowerCase();

  if (status === "crop_mismatch") {
    return isBangla ? "ফসলের অমিল" : "Crop Mismatch";
  }

  if (
    status === "disease_detected" ||
    record?.disease_detected === 1 ||
    record?.disease_detected === true
  ) {
    return isBangla ? "রোগ শনাক্ত" : "Disease Detected";
  }

  if (
    status === "no_disease" ||
    record?.disease_detected === 0 ||
    record?.disease_detected === false
  ) {
    return isBangla ? "রোগ নেই" : "No Disease";
  }

  return status
    ? status.replaceAll("_", " ")
    : isBangla ? "অজানা" : "Unknown";
}

function getStatusClass(record) {
  const status = String(record?.detection_status || "").toLowerCase();

  if (status === "crop_mismatch") return "mismatch";

  if (
    status === "disease_detected" ||
    record?.disease_detected === 1 ||
    record?.disease_detected === true
  ) {
    return "detected";
  }

  if (
    status === "no_disease" ||
    record?.disease_detected === 0 ||
    record?.disease_detected === false
  ) {
    return "clear";
  }

  return "unknown";
}

function getDiseaseName(record) {
  if (record?.disease_name) return record.disease_name;

  const result = record?.prediction_result;
  if (!result) return "—";

  if (typeof result === "string") {
    try {
      const parsed = JSON.parse(result);

      return (
        parsed.disease_name ||
        parsed.predicted_disease ||
        parsed.predicted_class ||
        parsed.class_name ||
        parsed.label ||
        "—"
      );
    } catch {
      return "—";
    }
  }

  return (
    result.disease_name ||
    result.predicted_disease ||
    result.predicted_class ||
    result.class_name ||
    result.label ||
    result.prediction?.disease_name ||
    "—"
  );
}

const cropTranslations = {
  Rice: "ধান",
  Potato: "আলু",
  Tomato: "টমেটো",
  Maize: "ভুট্টা",
  Wheat: "গম",
  "Chili": "মরিচ",
  "Brinjal": "বেগুন",
  "Onion": "পেঁয়াজ",
  "Garlic": "রসুন",
  "Cucumber": "শসা",
};

function AdminDashboard({ user, onLogout }) {
  const { i18n } = useTranslation();
  const isBangla = i18n.language?.startsWith("bn");

  const tx = (english, bangla) => isBangla ? bangla : english;

  const [activeTab, setActiveTab] = useState("overview");

  const [profile, setProfile] = useState({});
  const [dashboard, setDashboard] = useState({});
  const [experts, setExperts] = useState([]);
  const [diseaseStats, setDiseaseStats] = useState({});
  const [diseaseHistory, setDiseaseHistory] = useState([]);

  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historySearch, setHistorySearch] = useState("");
  const [historyCrop, setHistoryCrop] = useState("");
  const [historyStatus, setHistoryStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialExpertForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [diseaseError, setDiseaseError] = useState("");

  const adminName =
    profile.full_name ||
    profile.name ||
    user?.full_name ||
    tx("Administrator", "অ্যাডমিনিস্ট্রেটর");

  const getErrorMessage = (requestError, fallback) => {
    const message =
      requestError?.response?.data?.message ||
      requestError?.message ||
      fallback;

    if (!isBangla) return message;

    const translations = {
      "All fields are required.": "সবগুলো তথ্য পূরণ করতে হবে।",
      "Please enter a valid phone number.": "সঠিক ফোন নম্বর দিন।",
      "Password must contain at least 8 characters.": "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।",
      "Could not create expert.": "এক্সপার্ট অ্যাকাউন্ট তৈরি করা যায়নি।",
      "Failed to create Agri Expert account.": "কৃষি বিশেষজ্ঞের অ্যাকাউন্ট তৈরি করা যায়নি।",
      "Disease detection history could not be loaded.": "রোগ শনাক্তকরণের ইতিহাস লোড করা যায়নি।",
      "Disease detection statistics could not be loaded.": "রোগ শনাক্তকরণের পরিসংখ্যান লোড করা যায়নি।",
      "Some admin information could not be loaded.": "কিছু অ্যাডমিন তথ্য লোড করা যায়নি।",
      "Your admin session is invalid or expired. Please log in again.": "অ্যাডমিন সেশনের মেয়াদ শেষ হয়েছে। আবার লগইন করুন।",
    };

    return translations[message] || message;
  };

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError("");

    const results = await Promise.allSettled([
      getAdminProfile(),
      getAdminDashboard(),
      getAdminExperts(),
      getAdminDiseaseDetectionStats(),
    ]);

    const [
      profileResult,
      dashboardResult,
      expertsResult,
      diseaseResult,
    ] = results;

    if (profileResult.status === "fulfilled") {
      setProfile(unwrapObject(profileResult.value));
    }

    if (dashboardResult.status === "fulfilled") {
      setDashboard(unwrapObject(dashboardResult.value));
    }

    if (expertsResult.status === "fulfilled") {
      setExperts(unwrapArray(expertsResult.value));
    }

    if (diseaseResult.status === "fulfilled") {
      setDiseaseStats(getPayload(diseaseResult.value));
      setDiseaseError("");
    } else {
      setDiseaseError(
        getErrorMessage(
          diseaseResult.reason,
          "Disease detection statistics could not be loaded."
        )
      );
    }

    const failed = results
      .slice(0, 3)
      .find((result) => result.status === "rejected");

    if (failed) {
      const status = failed.reason?.response?.status;

      if (status === 401 || status === 403) {
        setError(
          tx(
            "Your admin session is invalid or expired. Please log in again.",
            "অ্যাডমিন সেশনের মেয়াদ শেষ হয়েছে। আবার লগইন করুন।"
          )
        );
      } else {
        setError(
          getErrorMessage(
            failed.reason,
            "Some admin information could not be loaded."
          )
        );
      }
    }

    setLoading(false);
  }, [isBangla]);

  const loadDiseaseHistory = useCallback(async () => {
    setHistoryLoading(true);
    setDiseaseError("");

    try {
      const params = {
        limit: PAGE_SIZE,
        offset: (historyPage - 1) * PAGE_SIZE,
      };

      if (historyCrop) params.cropName = historyCrop;
      if (historyStatus) params.status = historyStatus;

      const response = await getAdminDiseaseDetectionHistory(params);
      const payload = getPayload(response);
      const records = unwrapArray(response);

      setDiseaseHistory(records);

      setHistoryTotal(
        Number(
          payload.total ??
          payload.total_records ??
          payload.count ??
          records.length
        )
      );
    } catch (requestError) {
      setDiseaseError(
        getErrorMessage(
          requestError,
          "Disease detection history could not be loaded."
        )
      );

      setDiseaseHistory([]);
      setHistoryTotal(0);
    } finally {
      setHistoryLoading(false);
    }
  }, [historyPage, historyCrop, historyStatus, isBangla]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  useEffect(() => {
    if (activeTab === "disease") {
      loadDiseaseHistory();
    }
  }, [activeTab, loadDiseaseHistory]);

  const stats = dashboard.data || dashboard;

  const totalFarmers = Number(stats.total_farmers || 0);
  const activeExperts = Number(stats.total_active_experts || 0);
  const activeCrops = Number(stats.total_active_crops || 0);
  const inactiveAccounts = Number(stats.inactive_accounts || 0);

  const diseaseSummary =
    diseaseStats.summary ||
    diseaseStats.statistics ||
    diseaseStats;

  const totalDetections = Number(
    diseaseSummary.total_detections ||
    diseaseSummary.total ||
    0
  );

  const mismatchCount = Number(
    diseaseSummary.crop_mismatch ||
    diseaseSummary.total_crop_mismatch ||
    0
  );

  const detectedCount = Number(
    diseaseSummary.disease_detected ||
    diseaseSummary.total_disease_detected ||
    0
  );

  const noDiseaseCount = Number(
    diseaseSummary.no_disease ||
    diseaseSummary.total_no_disease ||
    0
  );

  const cropStatistics =
    diseaseStats.crop_statistics ||
    diseaseStats.cropStatistics ||
    [];

  const topDiseases =
    diseaseStats.top_diseases ||
    diseaseStats.topDiseases ||
    [];

  const recentDetections =
    diseaseStats.recent_detections ||
    diseaseStats.recentDetections ||
    [];

  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return diseaseHistory;

    const query = historySearch.toLowerCase();

    return diseaseHistory.filter((record) =>
      [
        record.farmer_name,
        record.farmer_phone,
        record.crop_name,
        getDiseaseName(record),
        getDetectionStatus(record),
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        )
    );
  }, [diseaseHistory, historySearch]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleCreateExpert = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = formData.full_name.trim();
    const cleanPhone = formData.phone.trim();

    if (!cleanName || !cleanPhone || !formData.password) {
      setError(tx("All fields are required.", "সবগুলো তথ্য পূরণ করতে হবে।"));
      return;
    }

    if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
      setError(tx("Please enter a valid phone number.", "সঠিক ফোন নম্বর দিন।"));
      return;
    }

    if (formData.password.length < 8) {
      setError(
        tx(
          "Password must contain at least 8 characters.",
          "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।"
        )
      );
      return;
    }

    setSaving(true);

    try {
      const result = await createAgriExpert({
        full_name: cleanName,
        phone: cleanPhone,
        password: formData.password,
      });

      if (result.success === false) {
        throw new Error(result.message || "Could not create expert.");
      }

      setSuccess(
        result.message ||
        tx(
          "Agri Expert account created successfully.",
          "কৃষি বিশেষজ্ঞের অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।"
        )
      );

      setFormData(initialExpertForm);
      setShowForm(false);

      await loadAdminData();
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Failed to create Agri Expert account."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const getExpertName = (expert) =>
    expert.full_name || expert.name || tx("Agri Expert", "কৃষি বিশেষজ্ঞ");

  const getExpertPhone = (expert) =>
    expert.phone || tx("Not available", "তথ্য নেই");

  const isExpertActive = (expert) =>
    expert.is_active === 1 ||
    expert.is_active === true ||
    expert.is_active === "1";

  const totalPages = Math.max(
    1,
    Math.ceil(historyTotal / PAGE_SIZE)
  );

  const changeHistoryFilter = (setter, value) => {
    setter(value);
    setHistoryPage(1);
  };

  const displayCropName = (name) => {
    if (!isBangla) return name || "—";
    return cropTranslations[name] || name || "—";
  };

  const renderExpertStatus = (expert) => (
    <span
      className={`admin-status ${
        isExpertActive(expert) ? "active" : "inactive"
      }`}
    >
      {isExpertActive(expert)
        ? tx("Active", "সক্রিয়")
        : tx("Inactive", "নিষ্ক্রিয়")}
    </span>
  );

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <Sprout size={27} />
          </div>

          <div>
            <h2>AgriSense BD</h2>
            <span>{tx("Administration", "প্রশাসন")}</span>
          </div>
        </div>

        <div className="admin-menu-label">
          {tx("ADMIN MENU", "অ্যাডমিন মেনু")}
        </div>

        <nav className="admin-navigation">
          <button
            className={activeTab === "overview" ? "active" : ""}
            onClick={() => setActiveTab("overview")}
          >
            <LayoutDashboard size={19} />
            {tx("Overview", "সারসংক্ষেপ")}
          </button>

          <button
            className={activeTab === "experts" ? "active" : ""}
            onClick={() => setActiveTab("experts")}
          >
            <GraduationCap size={19} />
            {tx("Agri Experts", "কৃষি বিশেষজ্ঞ")}
          </button>

          <button
            className={activeTab === "disease" ? "active" : ""}
            onClick={() => setActiveTab("disease")}
          >
            <Microscope size={19} />
            {tx("Disease Monitoring", "রোগ পর্যবেক্ষণ")}
          </button>

          <button
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => setActiveTab("profile")}
          >
            <UserRound size={19} />
            {tx("Admin Profile", "অ্যাডমিন প্রোফাইল")}
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <div className="admin-avatar">
              {adminName.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{adminName}</strong>
              <span>{tx("Administrator", "অ্যাডমিনিস্ট্রেটর")}</span>
            </div>
          </div>

          <button className="admin-logout" onClick={onLogout}>
            <LogOut size={18} />
            {tx("Logout", "লগআউট")}
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-breadcrumb">
              AGRISENSE BD / {tx("ADMIN PANEL", "অ্যাডমিন প্যানেল")}
            </span>

            <h1>
              {activeTab === "overview"
                ? tx("System Overview", "সিস্টেম সারসংক্ষেপ")
                : activeTab === "experts"
                  ? tx("Agri Expert Management", "কৃষি বিশেষজ্ঞ ব্যবস্থাপনা")
                  : activeTab === "disease"
                    ? tx("Disease Detection Monitoring", "রোগ শনাক্তকরণ পর্যবেক্ষণ")
                    : tx("Admin Profile", "অ্যাডমিন প্রোফাইল")}
            </h1>
          </div>

          <button
            className="admin-refresh"
            onClick={loadAdminData}
            disabled={loading}
          >
            <RefreshCw size={17} />
            {tx("Refresh", "রিফ্রেশ")}
          </button>
        </header>

        <div className="admin-content">
          {error && (
            <div className="admin-alert error">
              <AlertCircle size={19} />
              <span>{error}</span>
              <button onClick={() => setError("")} aria-label="Close">
                <X size={17} />
              </button>
            </div>
          )}

          {success && (
            <div className="admin-alert success">
              <CheckCircle size={19} />
              <span>{success}</span>
              <button onClick={() => setSuccess("")} aria-label="Close">
                <X size={17} />
              </button>
            </div>
          )}

          {loading ? (
            <div className="admin-loading">
              <LoaderCircle className="admin-spinner" size={34} />
              <p>{tx("Loading administration data...", "অ্যাডমিন তথ্য লোড হচ্ছে...")}</p>
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <>
                  <section className="admin-welcome">
                    <div>
                      <span>{tx("ADMINISTRATION CENTER", "প্রশাসন কেন্দ্র")}</span>
                      <h2>
                        {tx("Welcome", "স্বাগতম")}, {adminName}
                      </h2>
                      <p>
                        {tx(
                          "Manage the AgriSense BD platform and monitor its agricultural community.",
                          "AgriSense BD প্ল্যাটফর্ম পরিচালনা করুন এবং কৃষি কমিউনিটির কার্যক্রম পর্যবেক্ষণ করুন।"
                        )}
                      </p>
                    </div>

                    <div className="admin-welcome-icon">
                      <ShieldCheck size={66} />
                    </div>
                  </section>

                  <section className="admin-stat-grid">
                    <article className="admin-stat-card">
                      <div className="admin-stat-icon blue">
                        <Users size={23} />
                      </div>
                      <span>{tx("Total Farmers", "মোট কৃষক")}</span>
                      <strong>{totalFarmers}</strong>
                      <small>{tx("Registered farmer accounts", "নিবন্ধিত কৃষক অ্যাকাউন্ট")}</small>
                    </article>

                    <article className="admin-stat-card">
                      <div className="admin-stat-icon green">
                        <GraduationCap size={23} />
                      </div>
                      <span>{tx("Active Experts", "সক্রিয় বিশেষজ্ঞ")}</span>
                      <strong>{activeExperts}</strong>
                      <small>{tx("Active expert accounts", "সক্রিয় বিশেষজ্ঞ অ্যাকাউন্ট")}</small>
                    </article>

                    <article className="admin-stat-card">
                      <div className="admin-stat-icon orange">
                        <Sprout size={23} />
                      </div>
                      <span>{tx("Active Crops", "সক্রিয় ফসল")}</span>
                      <strong>{activeCrops}</strong>
                      <small>{tx("Farmer crop records", "কৃষকদের ফসলের রেকর্ড")}</small>
                    </article>

                    <article className="admin-stat-card">
                      <div className="admin-stat-icon red">
                        <Activity size={23} />
                      </div>
                      <span>{tx("Inactive Accounts", "নিষ্ক্রিয় অ্যাকাউন্ট")}</span>
                      <strong>{inactiveAccounts}</strong>
                      <small>{tx("Currently inactive accounts", "বর্তমানে নিষ্ক্রিয় অ্যাকাউন্ট")}</small>
                    </article>
                  </section>

                  <section className="admin-panel">
                    <div className="admin-panel-heading">
                      <div>
                        <h3>{tx("Agri Expert Directory", "কৃষি বিশেষজ্ঞ তালিকা")}</h3>
                        <p>{tx("Recently available expert accounts", "সাম্প্রতিক বিশেষজ্ঞ অ্যাকাউন্ট")}</p>
                      </div>

                      <button
                        className="admin-outline-button"
                        onClick={() => setActiveTab("experts")}
                      >
                        {tx("Manage Experts", "বিশেষজ্ঞ পরিচালনা")}
                      </button>
                    </div>

                    {experts.length === 0 ? (
                      <div className="admin-empty">
                        <GraduationCap size={38} />
                        <h4>{tx("No Agri Experts found", "কোনো কৃষি বিশেষজ্ঞ পাওয়া যায়নি")}</h4>
                        <p>{tx("Create an expert account to get started.", "শুরু করতে একটি বিশেষজ্ঞ অ্যাকাউন্ট তৈরি করুন।")}</p>
                      </div>
                    ) : (
                      <div className="admin-table-wrap">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>{tx("Expert Name", "বিশেষজ্ঞের নাম")}</th>
                              <th>{tx("Phone Number", "ফোন নম্বর")}</th>
                              <th>{tx("Account Status", "অ্যাকাউন্টের অবস্থা")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {experts.slice(0, 5).map((expert, index) => (
                              <tr key={expert.id ?? index}>
                                <td><strong>{getExpertName(expert)}</strong></td>
                                <td>{getExpertPhone(expert)}</td>
                                <td>{renderExpertStatus(expert)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>

                  <section className="admin-panel">
                    <div className="admin-panel-heading">
                      <div>
                        <h3>{tx("Disease Detection Snapshot", "রোগ শনাক্তকরণের সংক্ষিপ্ত চিত্র")}</h3>
                        <p>{tx("AI leaf analysis activity across the platform", "প্ল্যাটফর্মে AI-এর মাধ্যমে পাতার রোগ বিশ্লেষণের কার্যক্রম")}</p>
                      </div>

                      <button
                        className="admin-outline-button"
                        onClick={() => setActiveTab("disease")}
                      >
                        {tx("View Monitoring", "পর্যবেক্ষণ দেখুন")}
                      </button>
                    </div>

                    <div className="admin-disease-mini-grid">
                      <div>
                        <span>{tx("Total Detections", "মোট শনাক্তকরণ")}</span>
                        <strong>{totalDetections}</strong>
                      </div>
                      <div>
                        <span>{tx("Disease Detected", "রোগ শনাক্ত")}</span>
                        <strong>{detectedCount}</strong>
                      </div>
                      <div>
                        <span>{tx("Crop Mismatch", "ফসলের অমিল")}</span>
                        <strong>{mismatchCount}</strong>
                      </div>
                    </div>

                    {diseaseError && (
                      <p className="admin-muted-message">{diseaseError}</p>
                    )}
                  </section>
                </>
              )}

              {activeTab === "experts" && (
                <>
                  <section className="admin-panel">
                    <div className="admin-panel-heading">
                      <div>
                        <h3>{tx("Agri Expert Management", "কৃষি বিশেষজ্ঞ ব্যবস্থাপনা")}</h3>
                        <p>{tx("View expert accounts and create new experts.", "বিশেষজ্ঞ অ্যাকাউন্ট দেখুন এবং নতুন বিশেষজ্ঞ তৈরি করুন।")}</p>
                      </div>

                      <button
                        className="admin-primary-button"
                        onClick={() => setShowForm((previous) => !previous)}
                      >
                        {showForm ? <X size={18} /> : <UserPlus size={18} />}
                        {showForm ? tx("Close Form", "ফর্ম বন্ধ করুন") : tx("Create Expert", "বিশেষজ্ঞ তৈরি করুন")}
                      </button>
                    </div>

                    {showForm && (
                      <form className="admin-expert-form" onSubmit={handleCreateExpert}>
                        <h4>{tx("Create New Agri Expert", "নতুন কৃষি বিশেষজ্ঞ তৈরি করুন")}</h4>

                        <div className="admin-form-grid">
                          <div className="admin-field">
                            <label htmlFor="expert-name">{tx("Full Name *", "পূর্ণ নাম *")}</label>
                            <div className="admin-input-wrap">
                              <Users size={18} />
                              <input
                                id="expert-name"
                                name="full_name"
                                type="text"
                                placeholder={tx("Enter expert name", "বিশেষজ্ঞের নাম লিখুন")}
                                value={formData.full_name}
                                onChange={handleFormChange}
                                required
                              />
                            </div>
                          </div>

                          <div className="admin-field">
                            <label htmlFor="expert-phone">{tx("Phone Number *", "ফোন নম্বর *")}</label>
                            <div className="admin-input-wrap">
                              <Phone size={18} />
                              <input
                                id="expert-phone"
                                name="phone"
                                type="tel"
                                inputMode="tel"
                                placeholder={tx("Enter phone number", "ফোন নম্বর লিখুন")}
                                value={formData.phone}
                                onChange={handleFormChange}
                                required
                              />
                            </div>
                          </div>

                          <div className="admin-field full">
                            <label htmlFor="expert-password">{tx("Initial Password *", "প্রাথমিক পাসওয়ার্ড *")}</label>
                            <div className="admin-input-wrap">
                              <Lock size={18} />
                              <input
                                id="expert-password"
                                name="password"
                                type="password"
                                placeholder={tx("At least 8 characters", "কমপক্ষে ৮ অক্ষর")}
                                value={formData.password}
                                onChange={handleFormChange}
                                autoComplete="new-password"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="admin-primary-button"
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <LoaderCircle className="admin-spinner" size={18} />
                              {tx("Creating...", "তৈরি হচ্ছে...")}
                            </>
                          ) : (
                            <>
                              <Plus size={18} />
                              {tx("Create Agri Expert", "কৃষি বিশেষজ্ঞ তৈরি করুন")}
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    {experts.length === 0 ? (
                      <div className="admin-empty">
                        <GraduationCap size={38} />
                        <h4>{tx("No Agri Experts found", "কোনো কৃষি বিশেষজ্ঞ পাওয়া যায়নি")}</h4>
                        <p>{tx("Use Create Expert to add an expert account.", "বিশেষজ্ঞ অ্যাকাউন্ট যোগ করতে বিশেষজ্ঞ তৈরি করুন বাটন ব্যবহার করুন।")}</p>
                      </div>
                    ) : (
                      <div className="admin-table-wrap">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>{tx("Expert Name", "বিশেষজ্ঞের নাম")}</th>
                              <th>{tx("Phone Number", "ফোন নম্বর")}</th>
                              <th>{tx("Status", "অবস্থা")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {experts.map((expert, index) => (
                              <tr key={expert.id ?? index}>
                                <td><strong>{getExpertName(expert)}</strong></td>
                                <td>{getExpertPhone(expert)}</td>
                                <td>{renderExpertStatus(expert)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>

                  <section className="admin-panel">
                    <AdminExpertManagement />
                  </section>
                </>
              )}

              {activeTab === "disease" && (
                <>
                  <section className="admin-welcome admin-disease-welcome">
                    <div>
                      <span>{tx("AI HEALTH MONITORING", "AI স্বাস্থ্য পর্যবেক্ষণ")}</span>
                      <h2>{tx("Crop Disease Insights", "ফসলের রোগ বিশ্লেষণ")}</h2>
                      <p>
                        {tx(
                          "Monitor farmer leaf-image checks, crop mismatches, and detected disease results.",
                          "কৃষকদের পাতার ছবি পরীক্ষা, ফসলের অমিল এবং শনাক্ত হওয়া রোগের ফলাফল পর্যবেক্ষণ করুন।"
                        )}
                      </p>
                    </div>
                    <div className="admin-welcome-icon">
                      <Microscope size={66} />
                    </div>
                  </section>

                  {diseaseError && (
                    <div className="admin-alert error">
                      <AlertCircle size={19} />
                      <span>{diseaseError}</span>
                      <button onClick={() => setDiseaseError("")}>
                        <X size={17} />
                      </button>
                    </div>
                  )}

                  <section className="admin-stat-grid admin-disease-stat-grid">
                    <article className="admin-stat-card">
                      <div className="admin-stat-icon blue"><ClipboardList size={23} /></div>
                      <span>{tx("Total Detections", "মোট শনাক্তকরণ")}</span>
                      <strong>{totalDetections}</strong>
                      <small>{tx("All saved image checks", "সংরক্ষিত সব ছবি পরীক্ষা")}</small>
                    </article>

                    <article className="admin-stat-card">
                      <div className="admin-stat-icon red"><Bug size={23} /></div>
                      <span>{tx("Disease Detected", "রোগ শনাক্ত")}</span>
                      <strong>{detectedCount}</strong>
                      <small>{tx("Results classified with disease", "রোগ হিসেবে শ্রেণিবদ্ধ ফলাফল")}</small>
                    </article>

                    <article className="admin-stat-card">
                      <div className="admin-stat-icon orange"><AlertCircle size={23} /></div>
                      <span>{tx("Crop Mismatch", "ফসলের অমিল")}</span>
                      <strong>{mismatchCount}</strong>
                      <small>{tx("Selected crop did not match", "নির্বাচিত ফসলের সঙ্গে মিল নেই")}</small>
                    </article>

                    <article className="admin-stat-card">
                      <div className="admin-stat-icon green"><Leaf size={23} /></div>
                      <span>{tx("No Disease", "রোগ নেই")}</span>
                      <strong>{noDiseaseCount}</strong>
                      <small>{tx("No disease result returned", "রোগ পাওয়া যায়নি এমন ফলাফল")}</small>
                    </article>
                  </section>

                  <div className="admin-disease-two-column">
                    <section className="admin-panel">
                      <div className="admin-panel-heading">
                        <div>
                          <h3>{tx("Crop-wise Detection", "ফসল অনুযায়ী শনাক্তকরণ")}</h3>
                          <p>{tx("Detection records grouped by crop", "ফসল অনুযায়ী শনাক্তকরণের রেকর্ড")}</p>
                        </div>
                      </div>

                      {cropStatistics.length === 0 ? (
                        <div className="admin-empty compact">
                          <Sprout size={30} />
                          <p>{tx("No crop statistics available yet.", "এখনো কোনো ফসলের পরিসংখ্যান নেই।")}</p>
                        </div>
                      ) : (
                        <div className="admin-breakdown-list">
                          {cropStatistics.map((item, index) => {
                            const cropName =
                              item.crop_name || item.crop || item.name || "Unknown crop";

                            const count = Number(
                              item.total_detections ||
                              item.detections ||
                              item.total ||
                              item.count ||
                              0
                            );

                            const percent = totalDetections > 0
                              ? Math.min(100, (count / totalDetections) * 100)
                              : 0;

                            return (
                              <div className="admin-breakdown-item" key={`${cropName}-${index}`}>
                                <div className="admin-breakdown-label">
                                  <strong>{displayCropName(cropName)}</strong>
                                  <span>{count}</span>
                                </div>
                                <div className="admin-progress-track">
                                  <span style={{ width: `${percent}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </section>

                    <section className="admin-panel">
                      <div className="admin-panel-heading">
                        <div>
                          <h3>{tx("Common Diseases", "সাধারণ রোগসমূহ")}</h3>
                          <p>{tx("Most frequently recorded disease labels", "সবচেয়ে বেশি রেকর্ড হওয়া রোগ")}</p>
                        </div>
                      </div>

                      {topDiseases.length === 0 ? (
                        <div className="admin-empty compact">
                          <Bug size={30} />
                          <p>{tx("No disease labels available yet.", "এখনো কোনো রোগের তথ্য নেই।")}</p>
                        </div>
                      ) : (
                        <div className="admin-top-disease-list">
                          {topDiseases.slice(0, 6).map((item, index) => (
                            <div
                              className="admin-top-disease-item"
                              key={`${item.disease_name || item.disease || item.name}-${index}`}
                            >
                              <span className="admin-rank-number">{index + 1}</span>
                              <div>
                                <strong>
                                  {item.disease_name || item.disease || item.name || tx("Unknown disease", "অজানা রোগ")}
                                </strong>
                                <small>
                                  {item.total_detections || item.count || item.total || 0}{" "}
                                  {tx("records", "টি রেকর্ড")}
                                </small>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  </div>

                  <section className="admin-panel">
                    <div className="admin-panel-heading">
                      <div>
                        <h3>{tx("Recent Disease Detection", "সাম্প্রতিক রোগ শনাক্তকরণ")}</h3>
                        <p>{tx("Latest AI detection records", "AI-এর সর্বশেষ শনাক্তকরণ রেকর্ড")}</p>
                      </div>
                      <button
                        className="admin-outline-button"
                        onClick={loadDiseaseHistory}
                        disabled={historyLoading}
                      >
                        <RefreshCw size={16} />
                        {tx("Refresh History", "ইতিহাস রিফ্রেশ")}
                      </button>
                    </div>

                    {recentDetections.length === 0 ? (
                      <div className="admin-empty compact">
                        <ClipboardList size={30} />
                        <p>{tx("No recent detection records available.", "সাম্প্রতিক কোনো শনাক্তকরণ রেকর্ড নেই।")}</p>
                      </div>
                    ) : (
                      <div className="admin-table-wrap">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>{tx("Farmer", "কৃষক")}</th>
                              <th>{tx("Crop", "ফসল")}</th>
                              <th>{tx("Prediction", "পূর্বাভাস")}</th>
                              <th>{tx("Status", "অবস্থা")}</th>
                              <th>{tx("Date", "তারিখ")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentDetections.slice(0, 8).map((record, index) => (
                              <tr key={record.id ?? index}>
                                <td>
                                  <strong>{record.farmer_name || record.full_name || tx("Farmer", "কৃষক")}</strong>
                                  <small className="admin-table-subtext">{record.farmer_phone || ""}</small>
                                </td>
                                <td>{displayCropName(record.crop_name)}</td>
                                <td>{getDiseaseName(record)}</td>
                                <td>
                                  <span className={`admin-detection-status ${getStatusClass(record)}`}>
                                    {getDetectionStatus(record, isBangla)}
                                  </span>
                                </td>
                                <td>{formatDate(record.created_at, isBangla)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>

                  <section className="admin-panel">
                    <div className="admin-panel-heading">
                      <div>
                        <h3>{tx("Detection History", "শনাক্তকরণের ইতিহাস")}</h3>
                        <p>{tx("Filter the records currently shown on this page.", "বর্তমান পৃষ্ঠার রেকর্ডগুলো ফিল্টার করুন।")}</p>
                      </div>
                    </div>

                    <div className="admin-history-filters">
                      <div className="admin-history-search">
                        <Search size={17} />
                        <input
                          value={historySearch}
                          onChange={(event) =>
                            changeHistoryFilter(setHistorySearch, event.target.value)
                          }
                          placeholder={tx(
                            "Search this page by farmer, phone, crop or disease",
                            "কৃষক, ফোন, ফসল বা রোগ দিয়ে খুঁজুন"
                          )}
                        />
                      </div>

                      <select
                        value={historyCrop}
                        onChange={(event) =>
                          changeHistoryFilter(setHistoryCrop, event.target.value)
                        }
                      >
                        <option value="">{tx("All Crops", "সব ফসল")}</option>
                        <option value="Rice">{tx("Rice", "ধান")}</option>
                        <option value="Potato">{tx("Potato", "আলু")}</option>
                        <option value="Tomato">{tx("Tomato", "টমেটো")}</option>
                        <option value="Maize">{tx("Maize", "ভুট্টা")}</option>
                      </select>

                      <select
                        value={historyStatus}
                        onChange={(event) =>
                          changeHistoryFilter(setHistoryStatus, event.target.value)
                        }
                      >
                        <option value="">{tx("All Results", "সব ফলাফল")}</option>
                        <option value="disease_detected">{tx("Disease Detected", "রোগ শনাক্ত")}</option>
                        <option value="no_disease">{tx("No Disease", "রোগ নেই")}</option>
                        <option value="crop_mismatch">{tx("Crop Mismatch", "ফসলের অমিল")}</option>
                      </select>
                    </div>

                    {historyLoading ? (
                      <div className="admin-loading small">
                        <LoaderCircle className="admin-spinner" size={28} />
                        <p>{tx("Loading detection history...", "শনাক্তকরণের ইতিহাস লোড হচ্ছে...")}</p>
                      </div>
                    ) : filteredHistory.length === 0 ? (
                      <div className="admin-empty compact">
                        <ClipboardList size={30} />
                        <p>{tx("No matching detection history found.", "মিল আছে এমন কোনো রেকর্ড পাওয়া যায়নি।")}</p>
                      </div>
                    ) : (
                      <div className="admin-table-wrap">
                        <table className="admin-table admin-history-table">
                          <thead>
                            <tr>
                              <th>{tx("Farmer", "কৃষক")}</th>
                              <th>{tx("Phone", "ফোন")}</th>
                              <th>{tx("Crop", "ফসল")}</th>
                              <th>{tx("Disease / Prediction", "রোগ / পূর্বাভাস")}</th>
                              <th>{tx("Confidence", "নির্ভরযোগ্যতা")}</th>
                              <th>{tx("Result", "ফলাফল")}</th>
                              <th>{tx("Date", "তারিখ")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredHistory.map((record, index) => (
                              <tr key={record.id ?? index}>
                                <td><strong>{record.farmer_name || tx("Farmer", "কৃষক")}</strong></td>
                                <td>{record.farmer_phone || "—"}</td>
                                <td>{displayCropName(record.crop_name)}</td>
                                <td>{getDiseaseName(record)}</td>
                                <td>{formatPercent(record.confidence, isBangla)}</td>
                                <td>
                                  <span className={`admin-detection-status ${getStatusClass(record)}`}>
                                    {getDetectionStatus(record, isBangla)}
                                  </span>
                                </td>
                                <td>{formatDate(record.created_at, isBangla)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <div className="admin-pagination">
                      <span>
                        {tx("Page", "পৃষ্ঠা")} {historyPage} {tx("of", "এর")} {totalPages} ·{" "}
                        {historyTotal} {tx("records", "টি রেকর্ড")}
                      </span>

                      <div>
                        <button
                          className="admin-outline-button"
                          disabled={historyPage <= 1 || historyLoading}
                          onClick={() =>
                            setHistoryPage((page) => Math.max(1, page - 1))
                          }
                        >
                          <ChevronLeft size={16} />
                          {tx("Previous", "আগের")}
                        </button>

                        <button
                          className="admin-outline-button"
                          disabled={historyPage >= totalPages || historyLoading}
                          onClick={() =>
                            setHistoryPage((page) => Math.min(totalPages, page + 1))
                          }
                        >
                          {tx("Next", "পরের")}
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </section>
                </>
              )}

              {activeTab === "profile" && (
                <section className="admin-panel">
                  <div className="admin-panel-heading">
                    <div>
                      <h3>{tx("Administrator Profile", "অ্যাডমিনিস্ট্রেটর প্রোফাইল")}</h3>
                      <p>{tx("Your system administrator information.", "আপনার সিস্টেম অ্যাডমিনিস্ট্রেটর তথ্য।")}</p>
                    </div>
                  </div>

                  <div className="admin-profile-header">
                    <div className="admin-profile-avatar">
                      {adminName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3>{adminName}</h3>
                      <span>{tx("SYSTEM ADMINISTRATOR", "সিস্টেম অ্যাডমিনিস্ট্রেটর")}</span>
                    </div>
                  </div>

                  <div className="admin-profile-grid">
                    <div>
                      <span>{tx("Full Name", "পূর্ণ নাম")}</span>
                      <strong>
                        {profile.full_name || user?.full_name || tx("Not available", "তথ্য নেই")}
                      </strong>
                    </div>

                    <div>
                      <span>{tx("Phone Number", "ফোন নম্বর")}</span>
                      <strong>
                        {profile.phone || user?.phone || tx("Not available", "তথ্য নেই")}
                      </strong>
                    </div>

                    <div>
                      <span>{tx("Account Role", "অ্যাকাউন্টের ভূমিকা")}</span>
                      <strong>{profile.role || user?.role || "ADMIN"}</strong>
                    </div>

                    <div>
                      <span>{tx("Account ID", "অ্যাকাউন্ট আইডি")}</span>
                      <strong>
                        {profile.id || user?.id || tx("Not available", "তথ্য নেই")}
                      </strong>
                    </div>
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

export default AdminDashboard;
