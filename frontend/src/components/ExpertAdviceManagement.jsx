
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  MessageSquareText,
  Plus,
  RefreshCw,
  Search,
  Edit,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  LoaderCircle,
  UserRound,
  Sprout,
  CalendarDays,
  Save,
  FileText,
} from "lucide-react";

import {
  getExpertAdvice,
  getExpertFarmers,
  createExpertAdvice,
  updateExpertAdvice,
  deleteExpertAdvice,
} from "../services/expertAdviceApi";

import "./ExpertAdviceManagement.css";

function extractArray(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.data)) return result.data.data;
  if (Array.isArray(result?.advice)) return result.advice;
  if (Array.isArray(result?.farmers)) return result.farmers;
  return [];
}

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

function getFarmerId(farmer) {
  return farmer?.id ?? farmer?.user_id ?? farmer?.farmer_id ?? "";
}

function getFarmerName(farmer) {
  return (
    farmer?.full_name ||
    [farmer?.first_name, farmer?.last_name].filter(Boolean).join(" ") ||
    farmer?.name ||
    "Farmer"
  );
}

function getFarmerCrops(farmer) {
  const possibleCrops = [
    farmer?.crops,
    farmer?.farmer_crops,
    farmer?.crop_list,
  ];

  return possibleCrops.find(Array.isArray) || [];
}

function getCropId(crop) {
  return crop?.farmer_crop_id ?? crop?.id ?? crop?.crop_record_id ?? "";
}

function getCropName(crop) {
  return (
    crop?.crop_name ||
    crop?.name ||
    crop?.crop ||
    "Crop"
  );
}

function formatDate(dateValue) {
  if (!dateValue) return "Date not available";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date.toLocaleDateString("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ExpertAdviceManagement() {
  const [farmers, setFarmers] = useState([]);
  const [adviceList, setAdviceList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    farmer_id: "",
    farmer_crop_id: "",
    title: "",
    advice_text: "",
    status: "PENDING",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [farmerResult, adviceResult] = await Promise.all([
        getExpertFarmers(),
        getExpertAdvice(),
      ]);

      setFarmers(extractArray(farmerResult));
      setAdviceList(extractArray(adviceResult));
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Could not load farmers and advice."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedFarmer = useMemo(() => {
    return farmers.find(
      (farmer) =>
        String(getFarmerId(farmer)) === String(formData.farmer_id)
    );
  }, [farmers, formData.farmer_id]);

  const selectedFarmerCrops = useMemo(() => {
    return getFarmerCrops(selectedFarmer);
  }, [selectedFarmer]);

  const filteredAdvice = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return adviceList.filter((advice) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        String(advice.status || "PENDING").toUpperCase() === statusFilter;

      const farmerName =
        advice.farmer_name ||
        advice.full_name ||
        advice.farmer_full_name ||
        "";

      const matchesSearch =
        !normalizedSearch ||
        String(advice.title || "").toLowerCase().includes(normalizedSearch) ||
        String(advice.advice_text || "").toLowerCase().includes(normalizedSearch) ||
        String(farmerName).toLowerCase().includes(normalizedSearch) ||
        String(advice.crop_name || "").toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [adviceList, searchTerm, statusFilter]);

  const resetForm = () => {
    setFormData({
      farmer_id: "",
      farmer_crop_id: "",
      title: "",
      advice_text: "",
      status: "PENDING",
    });

    setEditingId(null);
    setShowForm(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => {
      if (name === "farmer_id") {
        return {
          ...previous,
          farmer_id: value,
          farmer_crop_id: "",
        };
      }

      return {
        ...previous,
        [name]: value,
      };
    });
  };

  const handleCreateNew = () => {
    setError("");
    setSuccess("");

    setFormData({
      farmer_id: "",
      farmer_crop_id: "",
      title: "",
      advice_text: "",
      status: "PENDING",
    });

    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (advice) => {
    setError("");
    setSuccess("");

    setFormData({
      farmer_id: String(advice.farmer_id || ""),
      farmer_crop_id: advice.farmer_crop_id
        ? String(advice.farmer_crop_id)
        : "",
      title: advice.title || "",
      advice_text: advice.advice_text || "",
      status: String(advice.status || "PENDING").toUpperCase(),
    });

    setEditingId(advice.id);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.farmer_id) {
      setError("Please select a farmer.");
      return;
    }

    if (!formData.title.trim() || !formData.advice_text.trim()) {
      setError("Please provide both advice title and advice details.");
      return;
    }

    const payload = {
      farmer_id: Number(formData.farmer_id),
      farmer_crop_id: formData.farmer_crop_id
        ? Number(formData.farmer_crop_id)
        : null,
      title: formData.title.trim(),
      advice_text: formData.advice_text.trim(),
    };

    if (editingId) {
      payload.status = formData.status;
    }

    setSaving(true);

    try {
      if (editingId) {
        await updateExpertAdvice(editingId, payload);
        setSuccess("Advice updated successfully.");
      } else {
        await createExpertAdvice(payload);
        setSuccess("New advice created successfully.");
      }

      resetForm();
      await loadData();
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Could not save advice. Please try again."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (adviceId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this advice?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingId(adviceId);

    try {
      await deleteExpertAdvice(adviceId);

      setAdviceList((previous) =>
        previous.filter((item) => String(item.id) !== String(adviceId))
      );

      setSuccess("Advice deleted successfully.");
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Could not delete this advice."
        )
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (advice, nextStatus) => {
    setError("");
    setSuccess("");

    try {
      await updateExpertAdvice(advice.id, {
        farmer_id: Number(advice.farmer_id),
        farmer_crop_id: advice.farmer_crop_id || null,
        title: advice.title,
        advice_text: advice.advice_text,
        status: nextStatus,
      });

      setAdviceList((previous) =>
        previous.map((item) =>
          String(item.id) === String(advice.id)
            ? { ...item, status: nextStatus }
            : item
        )
      );

      setSuccess("Advice status updated.");
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Could not update advice status."
        )
      );
    }
  };

  const getStatusClass = (status) => {
    const normalized = String(status || "PENDING").toLowerCase();

    if (normalized === "read") return "read";
    if (normalized === "resolved") return "resolved";

    return "pending";
  };

  return (
    <div className="expert-advice-page">
      <section className="advice-hero">
        <div className="advice-hero-icon">
          <MessageSquareText size={34} />
        </div>

        <div className="advice-hero-content">
          <span>EXPERT WORKSPACE</span>
          <h2>Farmer Advice Management</h2>
          <p>
            Create and manage personalized agricultural guidance
            for farmers registered on AgriSense BD.
          </p>
        </div>

        <button
          type="button"
          className="advice-primary-button"
          onClick={handleCreateNew}
        >
          <Plus size={18} />
          Create Advice
        </button>
      </section>

      {error && (
        <div className="advice-alert error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div className="advice-alert success">
          <CheckCircle size={18} />
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {showForm && (
        <section className="advice-form-panel">
          <div className="advice-section-heading">
            <div>
              <h3>{editingId ? "Edit Advice" : "Create New Advice"}</h3>
              <p>
                {editingId
                  ? "Update the selected farmer's advice."
                  : "Choose a farmer and provide agricultural guidance."}
              </p>
            </div>

            <button
              type="button"
              className="advice-icon-button"
              onClick={resetForm}
              disabled={saving}
              aria-label="Close form"
            >
              <X size={19} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="advice-form-grid">
              <label className="advice-field">
                <span>
                  Select Farmer <b>*</b>
                </span>

                <select
                  name="farmer_id"
                  value={formData.farmer_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Choose a farmer</option>

                  {farmers.map((farmer, index) => {
                    const farmerId = getFarmerId(farmer);

                    return (
                      <option
                        key={farmerId || index}
                        value={farmerId}
                      >
                        {getFarmerName(farmer)}
                        {farmer.phone ? ` (${farmer.phone})` : ""}
                      </option>
                    );
                  })}
                </select>
              </label>

              <label className="advice-field">
                <span>Select Crop (Optional)</span>

                <select
                  name="farmer_crop_id"
                  value={formData.farmer_crop_id}
                  onChange={handleInputChange}
                  disabled={!formData.farmer_id}
                >
                  <option value="">General advice / No specific crop</option>

                  {selectedFarmerCrops.map((crop, index) => {
                    const cropId = getCropId(crop);

                    return (
                      <option
                        key={cropId || index}
                        value={cropId}
                      >
                        {getCropName(crop)}
                      </option>
                    );
                  })}
                </select>
              </label>

              <label className="advice-field advice-field-full">
                <span>
                  Advice Title <b>*</b>
                </span>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Example: Tomato leaf disease prevention"
                  maxLength={200}
                  required
                />
              </label>

              <label className="advice-field advice-field-full">
                <span>
                  Advice Details <b>*</b>
                </span>

                <textarea
                  name="advice_text"
                  value={formData.advice_text}
                  onChange={handleInputChange}
                  placeholder="Write detailed agricultural advice for the selected farmer..."
                  rows={6}
                  required
                />
              </label>

              {editingId && (
                <label className="advice-field">
                  <span>Advice Status</span>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="READ">Read</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </label>
              )}
            </div>

            <div className="advice-form-actions">
              <button
                type="button"
                className="advice-secondary-button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="advice-primary-button"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <LoaderCircle className="advice-spinner" size={17} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    {editingId ? "Update Advice" : "Publish Advice"}
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="advice-summary-grid">
        <article className="advice-summary-card">
          <div className="advice-summary-icon green">
            <MessageSquareText size={21} />
          </div>
          <span>Total Advice</span>
          <strong>{adviceList.length}</strong>
        </article>

        <article className="advice-summary-card">
          <div className="advice-summary-icon orange">
            <CalendarDays size={21} />
          </div>
          <span>Pending</span>
          <strong>
            {adviceList.filter(
              (item) =>
                String(item.status || "PENDING").toUpperCase() === "PENDING"
            ).length}
          </strong>
        </article>

        <article className="advice-summary-card">
          <div className="advice-summary-icon blue">
            <CheckCircle size={21} />
          </div>
          <span>Resolved</span>
          <strong>
            {adviceList.filter(
              (item) =>
                String(item.status || "").toUpperCase() === "RESOLVED"
            ).length}
          </strong>
        </article>
      </section>

      <section className="advice-list-panel">
        <div className="advice-section-heading advice-list-heading">
          <div>
            <h3>My Advice Records</h3>
            <p>All agricultural advice created by your expert account</p>
          </div>

          <button
            type="button"
            className="advice-refresh-button"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? "advice-spinner" : ""}
            />
            Refresh
          </button>
        </div>

        <div className="advice-toolbar">
          <div className="advice-search">
            <Search size={17} />
            <input
              type="search"
              placeholder="Search by farmer, crop or advice..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <select
            className="advice-status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="READ">Read</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        {loading ? (
          <div className="advice-loading">
            <LoaderCircle size={32} className="advice-spinner" />
            <p>Loading advice records...</p>
          </div>
        ) : filteredAdvice.length === 0 ? (
          <div className="advice-empty">
            <FileText size={42} />
            <h4>No advice records found</h4>
            <p>
              {adviceList.length === 0
                ? "You have not created any farmer advice yet. Create your first advice to get started."
                : "No advice matches your current search or status filter."}
            </p>

            {adviceList.length === 0 && (
              <button
                type="button"
                className="advice-primary-button"
                onClick={handleCreateNew}
              >
                <Plus size={17} />
                Create First Advice
              </button>
            )}
          </div>
        ) : (
          <div className="advice-record-list">
            {filteredAdvice.map((advice) => {
              const farmerName =
                advice.farmer_name ||
                advice.full_name ||
                advice.farmer_full_name ||
                "Farmer";

              const status = String(
                advice.status || "PENDING"
              ).toUpperCase();

              return (
                <article
                  className="advice-record-card"
                  key={advice.id}
                >
                  <div className="advice-record-top">
                    <div className="advice-record-title">
                      <div className="advice-record-icon">
                        <MessageSquareText size={20} />
                      </div>

                      <div>
                        <h4>{advice.title}</h4>
                        <span>
                          <CalendarDays size={13} />
                          {formatDate(advice.created_at)}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`advice-status-badge ${getStatusClass(status)}`}
                    >
                      {status}
                    </span>
                  </div>

                  <p className="advice-record-description">
                    {advice.advice_text}
                  </p>

                  <div className="advice-record-meta">
                    <span>
                      <UserRound size={15} />
                      {farmerName}
                    </span>

                    <span>
                      <Sprout size={15} />
                      {advice.crop_name || "General advice"}
                    </span>
                  </div>

                  <div className="advice-record-footer">
                    <label className="advice-inline-status">
                      <span>Update status:</span>

                      <select
                        value={status}
                        onChange={(event) =>
                          handleStatusChange(advice, event.target.value)
                        }
                      >
                        <option value="PENDING">Pending</option>
                        <option value="READ">Read</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                    </label>

                    <div className="advice-record-actions">
                      <button
                        type="button"
                        className="advice-edit-button"
                        onClick={() => handleEdit(advice)}
                      >
                        <Edit size={15} />
                        Edit
                      </button>

                      <button
                        type="button"
                        className="advice-delete-button"
                        onClick={() => handleDelete(advice.id)}
                        disabled={deletingId === advice.id}
                      >
                        {deletingId === advice.id ? (
                          <LoaderCircle
                            size={15}
                            className="advice-spinner"
                          />
                        ) : (
                          <Trash2 size={15} />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default ExpertAdviceManagement;
