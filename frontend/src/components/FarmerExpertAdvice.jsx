
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getMyFarmerAdvice } from "../services/farmerAdviceApi";

export default function FarmerExpertAdvice() {
  const { i18n } = useTranslation();
  const isBangla = i18n.language === "bn";

  const L = (en, bn) => (isBangla ? bn : en);

  const [adviceList, setAdviceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAdvice = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getMyFarmerAdvice();

      const list = Array.isArray(result)
        ? result
        : result?.data?.advice ||
          result?.advice ||
          result?.data?.data ||
          result?.data ||
          [];

      setAdviceList(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          L(
            "Unable to load your expert advice.",
            "আপনার বিশেষজ্ঞের পরামর্শ লোড করা যায়নি।"
          )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdvice();
  }, []);

  const getStatusStyle = (status) => {
    switch (String(status || "").toUpperCase()) {
      case "READ":
        return {
          background: "#dbeafe",
          color: "#1d4ed8",
        };

      case "RESOLVED":
        return {
          background: "#dcfce7",
          color: "#166534",
        };

      default:
        return {
          background: "#fef3c7",
          color: "#92400e",
        };
    }
  };

  const getStatusLabel = (status) => {
    switch (String(status || "").toUpperCase()) {
      case "READ":
        return L("READ", "পড়া হয়েছে");
      case "RESOLVED":
        return L("RESOLVED", "সমাধান হয়েছে");
      default:
        return L("PENDING", "অপেক্ষমাণ");
    }
  };

  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleString(
      isBangla ? "bn-BD" : "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        {L("Loading expert advice...", "বিশেষজ্ঞের পরামর্শ লোড হচ্ছে...")}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h2 style={styles.heading}>
            {L("My Expert Advice", "আমার বিশেষজ্ঞের পরামর্শ")}
          </h2>

          <p style={styles.subtitle}>
            {L(
              "Advice and recommendations from agricultural experts.",
              "কৃষি বিশেষজ্ঞদের পরামর্শ ও সুপারিশসমূহ।"
            )}
          </p>
        </div>

        <button
          onClick={loadAdvice}
          style={styles.refreshButton}
          disabled={loading}
        >
          {L("Refresh", "রিফ্রেশ")}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {adviceList.length === 0 ? (
        <div style={styles.empty}>
          <h3>
            {L(
              "No Expert Advice Yet",
              "এখনো কোনো বিশেষজ্ঞের পরামর্শ নেই"
            )}
          </h3>

          <p>
            {L(
              "When an agricultural expert sends you advice, it will appear here.",
              "কোনো কৃষি বিশেষজ্ঞ আপনাকে পরামর্শ পাঠালে সেটি এখানে দেখা যাবে।"
            )}
          </p>
        </div>
      ) : (
        <div style={styles.list}>
          {adviceList.map((advice) => (
            <article key={advice.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.cardHeading}>
                  <h3 style={styles.title}>
                    {advice.title ||
                      L("Agricultural Advice", "কৃষি পরামর্শ")}
                  </h3>

                  <p style={styles.expertName}>
                    {L("Expert:", "বিশেষজ্ঞ:")}{" "}
                    {advice.expert_name ||
                      advice.full_name ||
                      L("Agricultural Expert", "কৃষি বিশেষজ্ঞ")}
                  </p>
                </div>

                <span
                  style={{
                    ...styles.status,
                    ...getStatusStyle(advice.status),
                  }}
                >
                  {getStatusLabel(advice.status)}
                </span>
              </div>

              <div style={styles.adviceText}>
                {advice.advice_text ||
                  L(
                    "No advice text available.",
                    "কোনো পরামর্শের বিবরণ পাওয়া যায়নি।"
                  )}
              </div>

              {advice.crop_name && (
                <p style={styles.metadata}>
                  <strong>{L("Crop:", "ফসল:")}</strong>{" "}
                  {advice.crop_name}
                </p>
              )}

              {advice.created_at && (
                <p style={styles.date}>
                  <strong>{L("Sent:", "পাঠানো হয়েছে:")}</strong>{" "}
                  {formatDate(advice.created_at)}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    padding: 24,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    boxSizing: "border-box",
    color: "#1f2937",
  },

  loading: {
    padding: 25,
    color: "#374151",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 15,
    flexWrap: "wrap",
    marginBottom: 22,
  },

  headerContent: {
    flex: "1 1 250px",
    minWidth: 0,
  },

  heading: {
    margin: 0,
    color: "#166534",
    fontSize: 23,
    lineHeight: 1.5,
  },

  subtitle: {
    color: "#6b7280",
    margin: "7px 0 0",
    lineHeight: 1.7,
  },

  refreshButton: {
    padding: "10px 18px",
    background: "#2563eb",
    color: "#fff",
    border: 0,
    borderRadius: 7,
    cursor: "pointer",
    fontWeight: 600,
    whiteSpace: "nowrap",
    minHeight: 40,
  },

  list: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 18,
  },

  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 18,
    background: "#fff",
    minWidth: 0,
    boxSizing: "border-box",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    flexWrap: "wrap",
  },

  cardHeading: {
    flex: "1 1 180px",
    minWidth: 0,
  },

  title: {
    margin: "0 0 8px",
    color: "#166534",
    fontSize: 18,
    lineHeight: 1.5,
    overflowWrap: "anywhere",
  },

  expertName: {
    color: "#6b7280",
    fontSize: 13,
    margin: "0 0 15px",
    lineHeight: 1.6,
  },

  status: {
    padding: "5px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  adviceText: {
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    lineHeight: 1.8,
    color: "#374151",
    marginBottom: 15,
  },

  metadata: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 8,
    lineHeight: 1.6,
  },

  date: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 0,
    lineHeight: 1.6,
  },

  empty: {
    textAlign: "center",
    padding: 45,
    background: "#f9fafb",
    borderRadius: 10,
    color: "#6b7280",
    lineHeight: 1.8,
  },

  error: {
    padding: 12,
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: 8,
    marginBottom: 15,
    lineHeight: 1.6,
  },
};
