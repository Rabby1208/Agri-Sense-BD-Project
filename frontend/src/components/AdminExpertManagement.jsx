
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  getAllExperts,
  updateExpertStatus,
  deleteExpert,
} from "../services/AdminExpertApi";

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
          t("Unable to load experts.", "à¦¬à¦¿à¦¶à§‡à¦·à¦œà§à¦žà¦¦à§‡à¦° à¦¤à¦¥à§à¦¯ à¦²à§‹à¦¡ à¦•à¦°à¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤")
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
              "à¦¬à¦¿à¦¶à§‡à¦·à¦œà§à¦žà¦•à§‡ à¦¸à¦«à¦²à¦­à¦¾à¦¬à§‡ à¦¸à¦•à§à¦°à¦¿à§Ÿ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡à¥¤"
            )
          : t(
              "Expert deactivated successfully.",
              "à¦¬à¦¿à¦¶à§‡à¦·à¦œà§à¦žà¦•à§‡ à¦¸à¦«à¦²à¦­à¦¾à¦¬à§‡ à¦¨à¦¿à¦·à§à¦•à§à¦°à¦¿à§Ÿ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡à¥¤"
            )
      );

      await loadExperts();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          t("Status update failed.", "à¦¸à§à¦Ÿà§à¦¯à¦¾à¦Ÿà¦¾à¦¸ à¦ªà¦°à¦¿à¦¬à¦°à§à¦¤à¦¨ à¦•à¦°à¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤")
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (expert) => {
    const confirmed = window.confirm(
      t(
        `Are you sure you want to remove ${expert.full_name}?`,
        `à¦†à¦ªà¦¨à¦¿ à¦•à¦¿ ${expert.full_name} à¦¨à¦¾à¦®à§‡à¦° à¦¬à¦¿à¦¶à§‡à¦·à¦œà§à¦žà¦•à§‡ à¦¸à¦°à¦¾à¦¤à§‡ à¦šà¦¾à¦¨?`
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
          "à¦¬à¦¿à¦¶à§‡à¦·à¦œà§à¦žà¦•à§‡ à¦¸à¦«à¦²à¦­à¦¾à¦¬à§‡ à¦¸à¦°à¦¾à¦¨à§‹ à¦¹à§Ÿà§‡à¦›à§‡à¥¤"
        )
      );

      await loadExperts();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          t("Unable to remove expert.", "à¦¬à¦¿à¦¶à§‡à¦·à¦œà§à¦žà¦•à§‡ à¦¸à¦°à¦¾à¦¨à§‹ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤")
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
        {t("Loading experts...", "à¦¬à¦¿à¦¶à§‡à¦·à¦œà§à¦žà¦¦à§‡à¦° à¦¤à¦¥à§à¦¯ à¦²à§‹à¦¡ à¦¹à¦šà§à¦›à§‡...")}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>
            {t("Expert Management", "à¦¬à¦¿à¦¶à§‡à¦·à¦œà§à¦ž à¦¬à§à¦¯à¦¬à¦¸à§à¦¥à¦¾à¦ªà¦¨à¦¾")}
          </h2>

          <p style={styles.subtitle}>
            {t(
              "View, activate, deactivate and remove experts.",
              "à¦¬à¦¿à¦¶à§‡à¦·à¦œà§à¦žà¦¦à§‡à¦° à¦¤à¦¥à§à¦¯ à¦¦à§‡à¦–à§à¦¨, à¦¸à¦•à§à¦°à¦¿à§Ÿ à¦¬à¦¾ à¦¨à¦¿à¦·à§à¦•à§à¦°à¦¿à§Ÿ à¦•à¦°à§à¦¨ à¦à¦¬à¦‚ à¦¸à¦°à¦¿à§Ÿà§‡ à¦¦à¦¿à¦¨à¥¤"
            )}
          </p>
        </div>

        <button
          onClick={loadExperts}
          style={styles.refreshButton}
          disabled={loading}
        >
          {t("Refresh", "à¦°à¦¿à¦«à§à¦°à§‡à¦¶")}
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
          "à¦¨à¦¾à¦®, à¦«à§‹à¦¨ à¦…à¦¥à¦¬à¦¾ à¦¬à¦¿à¦¶à§‡à¦·à¦œà§à¦žà¦¤à¦¾à¦° à¦®à¦¾à¦§à§à¦¯à¦®à§‡ à¦–à§à¦à¦œà§à¦¨..."
        )}
        aria-label={t("Search experts", "à¦¬à¦¿à¦¶à§‡à¦·à¦œà§à¦ž à¦–à§à¦à¦œà§à¦¨")}
      />

      <div style={styles.summary}>
        <div style={styles.summaryCard}>
          <strong>{experts.length}</strong>
          <span>{t("Total Experts", "à¦®à§‹à¦Ÿ à¦¬à¦¿à¦¶à§‡à¦·à¦œà§à¦ž")}</span>
        </div>

        <div style={styles.summaryCard}>
          <strong>{activeCount}</strong>
          <span>{t("Active Experts", "à¦¸à¦•à§à¦°à¦¿à§Ÿ à¦¬à¦¿à¦¶à§‡à¦·à¦œà§à¦ž")}</span>
        </div>

        <div style={styles.summaryCard}>
          <strong>{inactiveCount}</strong>
          <span>{t("Inactive Experts", "à¦¨à¦¿à¦·à§à¦•à§à¦°à¦¿à§Ÿ à¦¬à¦¿à¦¶à§‡à¦·à¦œà§à¦ž")}</span>
        </div>
      </div>

      {filteredExperts.length === 0 ? (
        <div style={styles.empty}>
          <h3>{t("No experts found", "à¦•à§‹à¦¨à§‹ à¦¬à¦¿à¦¶à§‡à¦·à¦œà§à¦ž à¦ªà¦¾à¦“à§Ÿà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿")}</h3>
          <p>
            {search
              ? t(
                  "Try another search term.",
                  "à¦…à¦¨à§à¦¯ à¦•à§‹à¦¨à§‹ à¦¶à¦¬à§à¦¦ à¦¦à¦¿à§Ÿà§‡ à¦–à§à¦à¦œà§‡ à¦¦à§‡à¦–à§à¦¨à¥¤"
                )
              : t(
                  "No experts have been added yet.",
                  "à¦à¦–à¦¨à§‹ à¦•à§‹à¦¨à§‹ à¦¬à¦¿à¦¶à§‡à¦·à¦œà§à¦ž à¦¯à§‹à¦— à¦•à¦°à¦¾ à¦¹à§Ÿà¦¨à¦¿à¥¤"
                )}
          </p>
        </div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>{t("Name", "à¦¨à¦¾à¦®")}</th>
                <th style={styles.th}>{t("Phone", "à¦«à§‹à¦¨")}</th>
                <th style={styles.th}>{t("Expertise", "à¦¬à¦¿à¦¶à§‡à¦·à¦œà§à¦žà¦¤à¦¾")}</th>
                <th style={styles.th}>{t("Qualification", "à¦¯à§‹à¦—à§à¦¯à¦¤à¦¾")}</th>
                <th style={styles.th}>{t("Experience", "à¦…à¦­à¦¿à¦œà§à¦žà¦¤à¦¾")}</th>
                <th style={styles.th}>{t("Status", "à¦¸à§à¦Ÿà§à¦¯à¦¾à¦Ÿà¦¾à¦¸")}</th>
                <th style={styles.th}>{t("Actions", "à¦•à¦¾à¦°à§à¦¯à¦•à§à¦°à¦®")}</th>
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
                      {t("years", "à¦¬à¦›à¦°")}
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
                          ? t("Active", "à¦¸à¦•à§à¦°à¦¿à§Ÿ")
                          : t("Inactive", "à¦¨à¦¿à¦·à§à¦•à§à¦°à¦¿à§Ÿ")}
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
                            ? t("Please wait...", "à¦…à¦ªà§‡à¦•à§à¦·à¦¾ à¦•à¦°à§à¦¨...")
                            : active
                              ? t("Deactivate", "à¦¨à¦¿à¦·à§à¦•à§à¦°à¦¿à§Ÿ à¦•à¦°à§à¦¨")
                              : t("Activate", "à¦¸à¦•à§à¦°à¦¿à§Ÿ à¦•à¦°à§à¦¨")}
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
                          {t("Remove", "à¦¸à¦°à¦¿à§Ÿà§‡ à¦¦à¦¿à¦¨")}
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

