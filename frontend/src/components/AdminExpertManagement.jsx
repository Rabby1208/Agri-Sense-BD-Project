
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  getAllExperts,
  updateExpertStatus,
  deleteExpert,
} from "../services/adminExpertApi";

export default function AdminExpertManagement() {
  const { i18n } = useTranslation();
  const isBangla = i18n.language?.startsWith("bn");

  const t = (en, bn) => (isBangla ? bn : en);

  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const loadExperts = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getAllExperts();

      const list = Array.isArray(result)
        ? result
        : result?.data?.experts ||
          result?.experts ||
          result?.data ||
          [];

      setExperts(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          t("Unable to load experts.", "বিশেষজ্ঞদের তথ্য লোড করা যায়নি।")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperts();
  }, []);

  const handleStatusChange = async (expert) => {
    const currentlyActive =
      Number(expert.is_active) === 1 ||
      expert.is_active === true;

    const newStatus = currentlyActive ? 0 : 1;

    try {
      setProcessingId(expert.id);
      setError("");
      setMessage("");

      await updateExpertStatus(expert.id, newStatus);

      setMessage(
        newStatus === 1
          ? t(
              "Expert activated successfully.",
              "বিশেষজ্ঞকে সফলভাবে সক্রিয় করা হয়েছে।"
            )
          : t(
              "Expert deactivated successfully.",
              "বিশেষজ্ঞকে সফলভাবে নিষ্ক্রিয় করা হয়েছে।"
            )
      );

      await loadExperts();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          t("Status update failed.", "স্ট্যাটাস পরিবর্তন করা যায়নি।")
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (expert) => {
    const confirmed = window.confirm(
      t(
        `Are you sure you want to remove ${expert.full_name}?`,
        `আপনি কি ${expert.full_name} নামের বিশেষজ্ঞকে সরাতে চান?`
      )
    );

    if (!confirmed) return;

    try {
      setProcessingId(expert.id);
      setError("");
      setMessage("");

      await deleteExpert(expert.id);

      setMessage(
        t(
          "Expert removed successfully.",
          "বিশেষজ্ঞকে সফলভাবে সরানো হয়েছে।"
        )
      );

      await loadExperts();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          t("Unable to remove expert.", "বিশেষজ্ঞকে সরানো যায়নি।")
      );
    } finally {
      setProcessingId(null);
    }
  };

  const filteredExperts = experts.filter((expert) => {
    const searchText = search.toLowerCase().trim();

    return (
      String(expert.full_name || "")
        .toLowerCase()
        .includes(searchText) ||
      String(expert.phone || "")
        .toLowerCase()
        .includes(searchText) ||
      String(expert.expertise || "")
        .toLowerCase()
        .includes(searchText)
    );
  });

  const activeCount = experts.filter(
    (expert) =>
      Number(expert.is_active) === 1 ||
      expert.is_active === true
  ).length;

  const inactiveCount = experts.length - activeCount;

  if (loading) {
    return (
      <div style={styles.loading}>
        {t("Loading experts...", "বিশেষজ্ঞদের তথ্য লোড হচ্ছে...")}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>
            {t("Expert Management", "বিশেষজ্ঞ ব্যবস্থাপনা")}
          </h2>

          <p style={styles.subtitle}>
            {t(
              "View, activate, deactivate and remove experts.",
              "বিশেষজ্ঞদের তথ্য দেখুন, সক্রিয় বা নিষ্ক্রিয় করুন এবং সরিয়ে দিন।"
            )}
          </p>
        </div>

        <button
          onClick={loadExperts}
          style={styles.refreshButton}
          disabled={loading}
        >
          {t("Refresh", "রিফ্রেশ")}
        </button>
      </div>

      {message && (
        <div style={styles.success} role="status">
          {message}
        </div>
      )}

      {error && (
        <div style={styles.error} role="alert">
          {error}
        </div>
      )}

      <input
        style={styles.search}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t(
          "Search by name, phone or expertise...",
          "নাম, ফোন অথবা বিশেষজ্ঞতার মাধ্যমে খুঁজুন..."
        )}
        aria-label={t("Search experts", "বিশেষজ্ঞ খুঁজুন")}
      />

      <div style={styles.summary}>
        <div style={styles.summaryCard}>
          <strong>{experts.length}</strong>
          <span>{t("Total Experts", "মোট বিশেষজ্ঞ")}</span>
        </div>

        <div style={styles.summaryCard}>
          <strong>{activeCount}</strong>
          <span>{t("Active Experts", "সক্রিয় বিশেষজ্ঞ")}</span>
        </div>

        <div style={styles.summaryCard}>
          <strong>{inactiveCount}</strong>
          <span>{t("Inactive Experts", "নিষ্ক্রিয় বিশেষজ্ঞ")}</span>
        </div>
      </div>

      {filteredExperts.length === 0 ? (
        <div style={styles.empty}>
          <h3>{t("No experts found", "কোনো বিশেষজ্ঞ পাওয়া যায়নি")}</h3>
          <p>
            {search
              ? t(
                  "Try another search term.",
                  "অন্য কোনো শব্দ দিয়ে খুঁজে দেখুন।"
                )
              : t(
                  "No experts have been added yet.",
                  "এখনো কোনো বিশেষজ্ঞ যোগ করা হয়নি।"
                )}
          </p>
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>{t("Name", "নাম")}</th>
                <th style={styles.th}>{t("Phone", "ফোন")}</th>
                <th style={styles.th}>{t("Expertise", "বিশেষজ্ঞতা")}</th>
                <th style={styles.th}>{t("Qualification", "যোগ্যতা")}</th>
                <th style={styles.th}>{t("Experience", "অভিজ্ঞতা")}</th>
                <th style={styles.th}>{t("Status", "স্ট্যাটাস")}</th>
                <th style={styles.th}>{t("Actions", "কার্যক্রম")}</th>
              </tr>
            </thead>

            <tbody>
              {filteredExperts.map((expert) => {
                const active =
                  Number(expert.is_active) === 1 ||
                  expert.is_active === true;

                const processing = processingId === expert.id;

                return (
                  <tr key={expert.id}>
                    <td style={styles.td}>
                      {expert.full_name || "N/A"}
                    </td>

                    <td style={styles.td}>
                      {expert.phone || "N/A"}
                    </td>

                    <td style={styles.td}>
                      {expert.expertise || "N/A"}
                    </td>

                    <td style={styles.td}>
                      {expert.qualification || "N/A"}
                    </td>

                    <td style={styles.td}>
                      {expert.experience_years ?? 0}{" "}
                      {t("years", "বছর")}
                    </td>

                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.status,
                          background: active ? "#dcfce7" : "#fee2e2",
                          color: active ? "#166534" : "#991b1b",
                        }}
                      >
                        {active
                          ? t("Active", "সক্রিয়")
                          : t("Inactive", "নিষ্ক্রিয়")}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button
                          disabled={processing}
                          onClick={() => handleStatusChange(expert)}
                          style={{
                            ...styles.actionButton,
                            background: active ? "#d97706" : "#15803d",
                            opacity: processing ? 0.6 : 1,
                          }}
                        >
                          {processing
                            ? t("Please wait...", "অপেক্ষা করুন...")
                            : active
                              ? t("Deactivate", "নিষ্ক্রিয় করুন")
                              : t("Activate", "সক্রিয় করুন")}
                        </button>

                        <button
                          disabled={processing}
                          onClick={() => handleDelete(expert)}
                          style={{
                            ...styles.actionButton,
                            background: "#dc2626",
                            opacity: processing ? 0.6 : 1,
                          }}
                        >
                          {t("Remove", "সরিয়ে দিন")}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    minWidth: 0,
    padding: 24,
    boxSizing: "border-box",
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    color: "#263d2d",
    lineHeight: 1.6,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 15,
    flexWrap: "wrap",
    marginBottom: 20,
  },

  title: {
    margin: 0,
    fontSize: 21,
    color: "#1c3e29",
  },

  subtitle: {
    margin: "7px 0 0",
    color: "#6b7280",
    fontSize: 13,
  },

  loading: {
    padding: 25,
    color: "#67806d",
  },

  refreshButton: {
    padding: "10px 18px",
    background: "#2563eb",
    color: "#fff",
    border: 0,
    borderRadius: 7,
    cursor: "pointer",
    fontFamily: "inherit",
  },

  search: {
    width: "100%",
    maxWidth: 450,
    padding: 12,
    border: "1px solid #d1d5db",
    borderRadius: 8,
    marginBottom: 20,
    boxSizing: "border-box",
    fontFamily: "inherit",
    fontSize: 13,
  },

  summary: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 15,
    marginBottom: 25,
  },

  summaryCard: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    background: "#f3f7f3",
    padding: "16px 20px",
    borderRadius: 9,
    minWidth: 0,
  },

  tableWrap: {
    width: "100%",
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 850,
    textAlign: "left",
  },

  th: {
    textAlign: "left",
    padding: 12,
    background: "#f3f4f6",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
    color: "#52665a",
    fontSize: 12,
  },

  td: {
    padding: 12,
    borderBottom: "1px solid #e5e7eb",
    fontSize: 13,
    color: "#52665a",
    verticalAlign: "middle",
  },

  status: {
    display: "inline-flex",
    padding: "5px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  actions: {
    display: "flex",
    gap: 7,
    flexWrap: "wrap",
  },

  actionButton: {
    color: "#fff",
    border: 0,
    borderRadius: 6,
    padding: "8px 10px",
    cursor: "pointer",
    fontSize: 12,
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  },

  success: {
    padding: 12,
    background: "#dcfce7",
    color: "#166534",
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 13,
  },

  error: {
    padding: 12,
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 13,
  },

  empty: {
    padding: 25,
    textAlign: "center",
    color: "#6b7280",
    background: "#f9faf9",
    borderRadius: 9,
  },
};
