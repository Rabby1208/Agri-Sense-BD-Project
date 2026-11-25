
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Activity,
  AlertCircle,
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Leaf,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  XCircle
} from "lucide-react";

import {
  getDiseaseDetectionHistory
} from "../services/expertDiseaseApi";

import "./DiseaseDetectionHistory.css";

const PAGE_SIZE = 20;

const getStatusLabel = (item) => {
  if (item.disease_detected === 1 ||
      item.disease_detected === true) {
    return "Disease Detected";
  }

  if (item.disease_detected === 0 ||
      item.disease_detected === false) {
    return "No Disease Detected";
  }

  return item.detection_status || "Unknown";
};

const getConfidence = (value) => {
  if (value === null || value === undefined) {
    return "N/A";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "N/A";
  }

  return `${(number <= 1 ? number * 100 : number).toFixed(2)}%`;
};

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString();
};

const DiseaseDetectionHistory = () => {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [selectedFarmer, setSelectedFarmer] = useState("all");

  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const result = await getDiseaseDetectionHistory({
        farmerId:
          selectedFarmer === "all"
            ? null
            : selectedFarmer,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE
      });

      setRecords(
        Array.isArray(result.data) ? result.data : []
      );

      setTotal(Number(result.total) || 0);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load disease detection history."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedFarmer, page]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const farmerOptions = useMemo(() => {
    const map = new Map();

    records.forEach((record) => {
      map.set(
        record.farmer_id,
        record.farmer_name
      );
    });

    return Array.from(map.entries());
  }, [records]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return records;

    return records.filter((record) => {
      return [
        record.farmer_name,
        record.farmer_phone,
        record.crop_name,
        record.disease_name,
        record.detection_status
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );
    });
  }, [records, search]);

  const diseaseCount = records.filter(
    (record) =>
      record.disease_detected === 1 ||
      record.disease_detected === true
  ).length;

  const noDiseaseCount = records.filter(
    (record) =>
      record.disease_detected === 0 ||
      record.disease_detected === false
  ).length;

  const totalPages = Math.max(
    1,
    Math.ceil(total / PAGE_SIZE)
  );

  const handleFarmerChange = (value) => {
    setSelectedFarmer(value);
    setPage(0);
  };

  const handlePrevious = () => {
    setPage((current) => Math.max(0, current - 1));
  };

  const handleNext = () => {
    setPage((current) =>
      Math.min(totalPages - 1, current + 1)
    );
  };

  return (
    <div className="disease-history-page">

      <div className="disease-history-heading">
        <div>
          <span className="disease-history-eyebrow">
            EXPERT MONITORING
          </span>

          <h2>Disease Detection History</h2>

          <p>
            Review AI-assisted crop disease detection
            records submitted by farmers.
          </p>
        </div>

        <button
          className="disease-refresh-btn"
          onClick={() => loadHistory(true)}
          disabled={loading || refreshing}
        >
          {refreshing ? (
            <LoaderCircle size={17} className="spin" />
          ) : (
            <RefreshCw size={17} />
          )}

          Refresh
        </button>
      </div>

      <div className="disease-history-stats">

        <div className="disease-stat-card">
          <div className="disease-stat-icon blue">
            <Activity size={22} />
          </div>

          <div>
            <span>Total Records</span>
            <strong>{total}</strong>
          </div>
        </div>

        <div className="disease-stat-card">
          <div className="disease-stat-icon red">
            <AlertCircle size={22} />
          </div>

          <div>
            <span>Diseases Detected</span>
            <strong>{diseaseCount}</strong>
          </div>
        </div>

        <div className="disease-stat-card">
          <div className="disease-stat-icon green">
            <ShieldCheck size={22} />
          </div>

          <div>
            <span>No Disease Detected</span>
            <strong>{noDiseaseCount}</strong>
          </div>
        </div>

        <div className="disease-stat-card">
          <div className="disease-stat-icon purple">
            <Leaf size={22} />
          </div>

          <div>
            <span>Current Page Records</span>
            <strong>{records.length}</strong>
          </div>
        </div>

      </div>

      <div className="disease-history-toolbar">

        <div className="disease-search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search farmer, crop or disease..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          value={selectedFarmer}
          onChange={(event) =>
            handleFarmerChange(event.target.value)
          }
        >
          <option value="all">All Farmers</option>

          {farmerOptions.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>

      </div>

      {error && (
        <div className="disease-history-error">
          <AlertCircle size={19} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="disease-history-loading">
          <LoaderCircle className="spin" size={32} />
          <p>Loading disease history...</p>
        </div>
      ) : (
        <>
          <div className="disease-history-table-wrap">
            <table className="disease-history-table">
              <thead>
                <tr>
                  <th>Farmer</th>
                  <th>Crop</th>
                  <th>Detected Disease</th>
                  <th>Confidence</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record) => {
                  const detected =
                    record.disease_detected === 1 ||
                    record.disease_detected === true;

                  return (
                    <tr key={record.id}>
                      <td>
                        <div className="disease-farmer-cell">
                          <div className="disease-farmer-avatar">
                            <UserRound size={18} />
                          </div>

                          <div>
                            <strong>
                              {record.farmer_name || "Unknown Farmer"}
                            </strong>

                            <span>
                              {record.farmer_phone || "No phone"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="disease-crop-label">
                          <Leaf size={14} />
                          {record.crop_name || "Unknown"}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {record.disease_name || "Not identified"}
                        </strong>
                      </td>

                      <td>
                        {getConfidence(record.confidence)}
                      </td>

                      <td>
                        <span
                          className={`disease-status ${
                            detected
                              ? "detected"
                              : record.disease_detected === 0 ||
                                record.disease_detected === false
                                ? "healthy"
                                : "unknown"
                          }`}
                        >
                          {detected ? (
                            <AlertCircle size={14} />
                          ) : record.disease_detected === 0 ||
                            record.disease_detected === false ? (
                            <CheckCircle size={14} />
                          ) : (
                            <XCircle size={14} />
                          )}

                          {getStatusLabel(record)}
                        </span>
                      </td>

                      <td>
                        <span className="disease-date">
                          <CalendarDays size={14} />
                          {formatDate(record.created_at)}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan="6">
                      <div className="disease-empty-state">
                        <Leaf size={34} />

                        <h3>No Detection Records Found</h3>

                        <p>
                          No records match your search or filter.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="disease-history-pagination">
            <span>
              Showing {total === 0 ? 0 : page * PAGE_SIZE + 1}
              {" - "}
              {Math.min((page + 1) * PAGE_SIZE, total)}
              {" of "}
              {total} records
            </span>

            <div>
              <button
                onClick={handlePrevious}
                disabled={page === 0}
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              <span>
                Page {page + 1} of {totalPages}
              </span>

              <button
                onClick={handleNext}
                disabled={page >= totalPages - 1}
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default DiseaseDetectionHistory;
