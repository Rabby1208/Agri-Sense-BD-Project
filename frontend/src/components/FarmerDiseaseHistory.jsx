
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Activity,
  Leaf,
  LoaderCircle,
  FileSearch,
} from "lucide-react";

import { getMyDiseaseHistory } from "../services/farmerDiseaseApi";
import "./FarmerDiseaseHistory.css";

const PAGE_SIZE = 10;

const cropTranslations = {
  rice: "ধান",
  paddy: "ধান",
  potato: "আলু",
  tomato: "টমেটো",
  maize: "ভুট্টা",
  corn: "ভুট্টা",
  wheat: "গম",
  onion: "পেঁয়াজ",
  garlic: "রসুন",
  chili: "মরিচ",
  chilli: "মরিচ",
  eggplant: "বেগুন",
  brinjal: "বেগুন",
  mango: "আম",
  banana: "কলা",
  papaya: "পেঁপে",
  cucumber: "শসা",
  cotton: "তুলা",
  sugarcane: "আখ",
  soybean: "সয়াবিন",
  cabbage: "বাঁধাকপি",
  cauliflower: "ফুলকপি",
  pumpkin: "মিষ্টি কুমড়া",
  watermelon: "তরমুজ",
};

const diseaseTranslations = {
  healthy: "সুস্থ",
  "crop mismatch": "ফসলের অমিল",
  "not identified": "শনাক্ত করা যায়নি",
  "bacterial blight": "ব্যাকটেরিয়াজনিত ব্লাইট",
  "bacterial leaf blight": "ব্যাকটেরিয়াজনিত পাতার ব্লাইট",
  "brown spot": "বাদামি দাগ রোগ",
  "leaf blast": "পাতার ব্লাস্ট রোগ",
  "rice blast": "ধানের ব্লাস্ট রোগ",
  "late blight": "লেট ব্লাইট",
  "early blight": "আর্লি ব্লাইট",
  "leaf rust": "পাতার মরিচা রোগ",
  "powdery mildew": "পাউডারি মিলডিউ",
  "downy mildew": "ডাউনি মিলডিউ",
  "leaf curl": "পাতা কুঁকড়ে যাওয়া রোগ",
  "yellow leaf curl virus": "হলুদ পাতা কুঁকড়ে যাওয়ার ভাইরাস",
  "mosaic virus": "মোজাইক ভাইরাস",
  "bacterial spot": "ব্যাকটেরিয়াজনিত দাগ রোগ",
  "septoria leaf spot": "সেপ্টোরিয়া পাতার দাগ রোগ",
  "target spot": "টার্গেট স্পট রোগ",
  "leaf mold": "পাতার ছত্রাকজনিত রোগ",
  "common rust": "সাধারণ মরিচা রোগ",
  "northern leaf blight": "নর্দার্ন লিফ ব্লাইট",
  "gray leaf spot": "ধূসর পাতার দাগ রোগ",
  "healthy leaf": "সুস্থ পাতা",
};

const normalizeName = (value) =>
  String(value || "")
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\s+/g, " ")
    .trim();

const parsePredictionResult = (value) => {
  if (!value) return {};

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const getDiseaseName = (record) => {
  const result = parsePredictionResult(record.prediction_result);

  const status = String(
    record.detection_status || result.detection_status || ""
  ).toLowerCase();

  if (
    status.includes("mismatch") ||
    status.includes("crop_mismatch")
  ) {
    return "Crop Mismatch";
  }

  return (
    record.disease_name ||
    result.disease_name ||
    result.predicted_disease ||
    result.predicted_class ||
    result.class_name ||
    result.condition ||
    result.disease ||
    result.label ||
    result.prediction?.disease_name ||
    result.prediction?.label ||
    "Not identified"
  );
};

const getStatusInfo = (record) => {
  const result = parsePredictionResult(record.prediction_result);

  const status = String(
    record.detection_status || result.detection_status || "unknown"
  ).toLowerCase();

  if (status.includes("mismatch")) {
    return {
      label: "Crop Mismatch",
      className: "status-warning",
      icon: AlertCircle,
    };
  }

  if (
    record.disease_detected === 1 ||
    record.disease_detected === true ||
    status.includes("disease_detected") ||
    status === "detected"
  ) {
    return {
      label: "Disease Detected",
      className: "status-danger",
      icon: AlertCircle,
    };
  }

  if (
    record.disease_detected === 0 ||
    record.disease_detected === false ||
    status.includes("healthy") ||
    status.includes("no_disease")
  ) {
    return {
      label: "No Disease Detected",
      className: "status-success",
      icon: CheckCircle,
    };
  }

  if (status === "success" || status === "completed") {
    return {
      label: "Completed",
      className: "status-success",
      icon: CheckCircle,
    };
  }

  return {
    label: status.replaceAll("_", " "),
    className: "status-neutral",
    icon: Clock,
  };
};

const formatConfidence = (value, isBangla) => {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "N/A";
  }

  const percentage = number <= 1 ? number * 100 : number;

  return `${percentage.toFixed(2).toLocaleString(
    isBangla ? "bn-BD" : "en-US"
  )}%`;
};

const formatDate = (value, isBangla) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString(isBangla ? "bn-BD" : "en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCropName = (value) => {
  if (!value) return "Unknown";

  return normalizeName(value).replace(/\b\w/g, (letter) =>
    letter.toUpperCase()
  );
};

const translateCrop = (value, isBangla) => {
  const crop = normalizeName(value);

  if (!isBangla) {
    return formatCropName(value);
  }

  return cropTranslations[crop.toLowerCase()] || formatCropName(value);
};

const translateDisease = (value, isBangla) => {
  const disease = normalizeName(value);

  if (!isBangla) {
    return disease || "Not identified";
  }

  return (
    diseaseTranslations[disease.toLowerCase()] ||
    disease ||
    "শনাক্ত করা যায়নি"
  );
};

const translateStatus = (value, isBangla) => {
  if (!isBangla) return value;

  const translations = {
    "Crop Mismatch": "ফসলের অমিল",
    "Disease Detected": "রোগ শনাক্ত হয়েছে",
    "No Disease Detected": "কোনো রোগ শনাক্ত হয়নি",
    Completed: "সম্পন্ন",
    unknown: "অজানা",
  };

  return translations[value] || value;
};

function FarmerDiseaseHistory() {
  const { i18n } = useTranslation();
  const isBangla = i18n.language?.startsWith("bn");

  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const L = (en, bn) => (isBangla ? bn : en);

  const numberFormat = (value) =>
    Number(value || 0).toLocaleString(isBangla ? "bn-BD" : "en-US");

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchHistory = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await getMyDiseaseHistory({
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
        });

        if (!response?.success) {
          throw new Error(
            response?.message || "Failed to load disease history."
          );
        }

        setRecords(Array.isArray(response.data) ? response.data : []);
        setTotal(Number(response.total) || 0);
      } catch (err) {
        console.error("Disease history error:", err);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load disease history. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page]
  );

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filteredRecords = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return records;

    return records.filter((record) => {
      const crop = formatCropName(record.crop_name).toLowerCase();
      const disease = String(getDiseaseName(record)).toLowerCase();
      const status = String(getStatusInfo(record).label).toLowerCase();

      const translatedCrop = translateCrop(
        record.crop_name,
        true
      ).toLowerCase();

      const translatedDisease = translateDisease(
        getDiseaseName(record),
        true
      ).toLowerCase();

      const translatedStatus = translateStatus(
        getStatusInfo(record).label,
        true
      ).toLowerCase();

      return (
        crop.includes(query) ||
        disease.includes(query) ||
        status.includes(query) ||
        translatedCrop.includes(query) ||
        translatedDisease.includes(query) ||
        translatedStatus.includes(query)
      );
    });
  }, [records, searchTerm]);

  const pageStats = useMemo(() => {
    let detected = 0;
    let noDisease = 0;
    let mismatch = 0;

    records.forEach((record) => {
      const result = parsePredictionResult(record.prediction_result);

      const status = String(
        record.detection_status || result.detection_status || ""
      ).toLowerCase();

      if (status.includes("mismatch")) {
        mismatch += 1;
      } else if (
        record.disease_detected === 1 ||
        record.disease_detected === true ||
        status.includes("disease_detected") ||
        status === "detected"
      ) {
        detected += 1;
      } else if (
        record.disease_detected === 0 ||
        record.disease_detected === false ||
        status.includes("healthy") ||
        status.includes("no_disease")
      ) {
        noDisease += 1;
      }
    });

    return { detected, noDisease, mismatch };
  }, [records]);

  const handleRefresh = () => {
    fetchHistory(true);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const goToPreviousPage = () => {
    setPage((current) => Math.max(1, current - 1));
  };

  const goToNextPage = () => {
    setPage((current) => Math.min(totalPages, current + 1));
  };

  if (loading) {
    return (
      <div className="disease-history-loading">
        <LoaderCircle size={32} className="loading-spinner" />
        <p>{L("Loading disease detection history...", "রোগ শনাক্তকরণের ইতিহাস লোড হচ্ছে...")}</p>
      </div>
    );
  }

  return (
    <section className="farmer-disease-history">
      <div className="disease-history-header">
        <div>
          <h2>{L("Disease Detection History", "রোগ শনাক্তকরণের ইতিহাস")}</h2>
          <p>
            {L(
              "View your previous crop disease detection results.",
              "আপনার আগের ফসলের রোগ শনাক্তকরণের ফলাফল দেখুন।"
            )}
          </p>
        </div>

        <button
          type="button"
          className="disease-refresh-btn"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={refreshing ? "loading-spinner" : ""}
          />
          {refreshing
            ? L("Refreshing...", "রিফ্রেশ হচ্ছে...")
            : L("Refresh", "রিফ্রেশ")}
        </button>
      </div>

      {error && (
        <div className="disease-history-error">
          <AlertCircle size={19} />
          <span>{error}</span>

          <button type="button" onClick={handleRefresh}>
            {L("Try Again", "আবার চেষ্টা করুন")}
          </button>
        </div>
      )}

      <div className="disease-history-stats">
        <div className="disease-stat-card">
          <div className="disease-stat-icon total-icon">
            <Activity size={22} />
          </div>
          <div>
            <span>{L("Total Records", "মোট রেকর্ড")}</span>
            <h3>{numberFormat(total)}</h3>
          </div>
        </div>

        <div className="disease-stat-card">
          <div className="disease-stat-icon detected-icon">
            <AlertCircle size={22} />
          </div>
          <div>
            <span>{L("Disease Detected", "রোগ শনাক্ত হয়েছে")}</span>
            <h3>{numberFormat(pageStats.detected)}</h3>
          </div>
        </div>

        <div className="disease-stat-card">
          <div className="disease-stat-icon healthy-icon">
            <CheckCircle size={22} />
          </div>
          <div>
            <span>{L("No Disease", "রোগ নেই")}</span>
            <h3>{numberFormat(pageStats.noDisease)}</h3>
          </div>
        </div>

        <div className="disease-stat-card">
          <div className="disease-stat-icon mismatch-icon">
            <Leaf size={22} />
          </div>
          <div>
            <span>{L("Crop Mismatch", "ফসলের অমিল")}</span>
            <h3>{numberFormat(pageStats.mismatch)}</h3>
          </div>
        </div>
      </div>

      <div className="disease-history-content">
        <div className="disease-history-toolbar">
          <div>
            <h3>{L("Detection Records", "শনাক্তকরণের রেকর্ড")}</h3>
            <p>
              {L(
                `Showing ${records.length} records on this page.`,
                `এই পৃষ্ঠায় ${numberFormat(records.length)}টি রেকর্ড দেখানো হচ্ছে।`
              )}
            </p>
          </div>

          <div className="disease-search-box">
            <Search size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder={L(
                "Search crop, disease or status...",
                "ফসল, রোগ বা স্ট্যাটাস খুঁজুন..."
              )}
              aria-label={L(
                "Search disease history",
                "রোগ শনাক্তকরণের ইতিহাস খুঁজুন"
              )}
            />
          </div>
        </div>

        {!error && filteredRecords.length === 0 ? (
          <div className="disease-history-empty">
            <FileSearch size={42} />
            <h3>
              {records.length === 0
                ? L("No Detection History Yet", "এখনো কোনো শনাক্তকরণের ইতিহাস নেই")
                : L("No Matching Records", "কোনো মিল পাওয়া যায়নি")}
            </h3>
            <p>
              {records.length === 0
                ? L(
                    "Your crop disease detection results will appear here after your first detection.",
                    "প্রথমবার ফসলের রোগ শনাক্ত করার পর ফলাফল এখানে দেখা যাবে।"
                  )
                : L(
                    "Try searching with a different crop name, disease name or status.",
                    "অন্য ফসলের নাম, রোগের নাম অথবা স্ট্যাটাস দিয়ে খুঁজে দেখুন।"
                  )}
            </p>
          </div>
        ) : (
          !error && (
            <div className="disease-history-table-wrapper">
              <table className="disease-history-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{L("Crop", "ফসল")}</th>
                    <th>{L("Disease / Result", "রোগ / ফলাফল")}</th>
                    <th>{L("Confidence", "নির্ভুলতার হার")}</th>
                    <th>{L("Status", "অবস্থা")}</th>
                    <th>{L("Date", "তারিখ")}</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.map((record, index) => {
                    const statusInfo = getStatusInfo(record);
                    const StatusIcon = statusInfo.icon;

                    return (
                      <tr key={record.id || `${page}-${index}`}>
                        <td>
                          {numberFormat(
                            (page - 1) * PAGE_SIZE + index + 1
                          )}
                        </td>

                        <td>
                          <span className="disease-crop-name">
                            {translateCrop(record.crop_name, isBangla)}
                          </span>
                        </td>

                        <td>
                          <span className="disease-result-name">
                            {translateDisease(
                              getDiseaseName(record),
                              isBangla
                            )}
                          </span>
                        </td>

                        <td>
                          {formatConfidence(record.confidence, isBangla)}
                        </td>

                        <td>
                          <span
                            className={`disease-status-badge ${statusInfo.className}`}
                          >
                            <StatusIcon size={14} />
                            {translateStatus(statusInfo.label, isBangla)}
                          </span>
                        </td>

                        <td>
                          {formatDate(record.created_at, isBangla)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}

        {total > 0 && (
          <div className="disease-history-pagination">
            <span>
              {L("Page", "পৃষ্ঠা")} {numberFormat(page)} {L("of", "এর মধ্যে")}{" "}
              {numberFormat(totalPages)}
            </span>

            <div className="disease-pagination-buttons">
              <button
                type="button"
                onClick={goToPreviousPage}
                disabled={page <= 1}
                aria-label={L("Previous page", "আগের পৃষ্ঠা")}
              >
                <ChevronLeft size={18} />
                {L("Previous", "আগের")}
              </button>

              <button
                type="button"
                onClick={goToNextPage}
                disabled={page >= totalPages}
                aria-label={L("Next page", "পরের পৃষ্ঠা")}
              >
                {L("Next", "পরের")}
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        <p className="disease-history-note">
          {L(
            "Detection statistics show records from the current page.",
            "শনাক্তকরণের পরিসংখ্যানে বর্তমান পৃষ্ঠার রেকর্ড দেখানো হয়েছে।"
          )}
        </p>
      </div>
    </section>
  );
}

export default FarmerDiseaseHistory;
