
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  getExpertsDirectory,
  createExpertRequest,
  getMyExpertRequests,
} from "../services/farmerExpertRequestApi";

import "./FarmerExpertCommunication.css";

function FarmerExpertCommunication() {
  const { i18n } = useTranslation();
  const isBangla = i18n.language === "bn";

  const L = (en, bn) => (isBangla ? bn : en);

  const [experts, setExperts] = useState([]);
  const [requests, setRequests] = useState([]);

  const [expertId, setExpertId] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Crop Disease");
  const [details, setDetails] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getErrorMessage = (err, fallback) =>
    err.response?.data?.message || fallback;

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [expertResult, requestResult] = await Promise.all([
        getExpertsDirectory(),
        getMyExpertRequests(),
      ]);

      const expertList = Array.isArray(expertResult)
        ? expertResult
        : expertResult?.data?.experts ||
          expertResult?.data?.data ||
          expertResult?.data ||
          [];

      const requestList = Array.isArray(requestResult)
        ? requestResult
        : requestResult?.data?.requests ||
          requestResult?.data?.data ||
          requestResult?.data ||
          [];

      setExperts(Array.isArray(expertList) ? expertList : []);
      setRequests(Array.isArray(requestList) ? requestList : []);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          L(
            "Unable to load Experts and requests.",
            "বিশেষজ্ঞ ও অনুরোধের তথ্য লোড করা যায়নি।"
          )
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!expertId || !title.trim() || !details.trim()) {
      setError(
        L(
          "Please complete all required fields.",
          "অনুগ্রহ করে প্রয়োজনীয় সব তথ্য পূরণ করো।"
        )
      );
      return;
    }

    try {
      setSubmitting(true);

      await createExpertRequest({
        expert_id: Number(expertId),
        title: title.trim(),
        category,
        problem_details: details.trim(),
      });

      setSuccess(
        L(
          "Your problem was sent successfully!",
          "তোমার সমস্যাটি সফলভাবে পাঠানো হয়েছে!"
        )
      );

      setExpertId("");
      setTitle("");
      setCategory("Crop Disease");
      setDetails("");

      await loadData();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          L(
            "Failed to send your problem.",
            "সমস্যাটি পাঠানো যায়নি। আবার চেষ্টা করো।"
          )
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryLabel = (value) => {
    const categories = {
      "Crop Disease": L("Crop Disease", "ফসলের রোগ"),
      "Pest Problem": L("Pest Problem", "পোকামাকড়ের সমস্যা"),
      "Soil Problem": L("Soil Problem", "মাটির সমস্যা"),
      "Fertilizer Advice": L("Fertilizer Advice", "সার ব্যবস্থাপনা"),
      Irrigation: L("Irrigation", "সেচ ব্যবস্থা"),
      "Crop Management": L("Crop Management", "ফসল ব্যবস্থাপনা"),
      Other: L("Other", "অন্যান্য"),
    };

    return categories[value] || value;
  };

  const getStatusLabel = (status) => {
    const normalized = String(status || "PENDING").toUpperCase();

    const statuses = {
      PENDING: L("PENDING", "অপেক্ষমাণ"),
      APPROVED: L("APPROVED", "অনুমোদিত"),
      IN_PROGRESS: L("IN PROGRESS", "চলমান"),
      RESPONDED: L("RESPONDED", "উত্তর দেওয়া হয়েছে"),
      RESOLVED: L("RESOLVED", "সমাধান হয়েছে"),
      REJECTED: L("REJECTED", "বাতিল"),
      CLOSED: L("CLOSED", "বন্ধ"),
    };

    return statuses[normalized] || status || L("PENDING", "অপেক্ষমাণ");
  };

  const getStatusClass = (status) =>
    String(status || "PENDING").toLowerCase().replace(/\s+/g, "-");

  const formatDate = (date) => {
    if (!date) return L("Not available", "তথ্য নেই");

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleString(isBangla ? "bn-BD" : "en-US");
  };

  if (loading) {
    return (
      <div className="fec-container">
        <p className="fec-loading">
          {L(
            "Loading Expert Communication...",
            "বিশেষজ্ঞের যোগাযোগের তথ্য লোড হচ্ছে..."
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="fec-container">
      <div className="fec-header">
        <div>
          <span className="fec-eyebrow">
            {L("AGRICULTURE SUPPORT", "কৃষি সহায়তা")}
          </span>

          <h2>{L("Contact an Expert", "বিশেষজ্ঞের সাথে যোগাযোগ")}</h2>

          <p>
            {L(
              "Share your farming problem directly with an agricultural expert.",
              "তোমার কৃষি সংক্রান্ত সমস্যা সরাসরি একজন কৃষি বিশেষজ্ঞকে জানাও।"
            )}
          </p>
        </div>

        <button
          className="fec-refresh"
          onClick={loadData}
          type="button"
          disabled={loading}
        >
          {L("Refresh", "রিফ্রেশ")}
        </button>
      </div>

      {error && <div className="fec-alert error">{error}</div>}
      {success && <div className="fec-alert success">{success}</div>}

      <section className="fec-panel">
        <h3>{L("Send a New Problem", "নতুন সমস্যা পাঠাও")}</h3>

        <form onSubmit={handleSubmit}>
          <label htmlFor="fec-expert">
            {L("Select Expert", "বিশেষজ্ঞ নির্বাচন করো")} *
          </label>

          <select
            id="fec-expert"
            value={expertId}
            onChange={(event) => setExpertId(event.target.value)}
            required
          >
            <option value="">
              {L("Choose an Expert", "একজন বিশেষজ্ঞ নির্বাচন করো")}
            </option>

            {experts.map((expert) => (
              <option key={expert.id} value={expert.id}>
                {expert.full_name}
                {expert.expertise ? ` - ${expert.expertise}` : ""}
              </option>
            ))}
          </select>

          <label htmlFor="fec-title">
            {L("Problem Title", "সমস্যার শিরোনাম")} *
          </label>

          <input
            id="fec-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={L(
              "Example: Tomato leaves turning yellow",
              "উদাহরণ: টমেটো গাছের পাতা হলুদ হয়ে যাচ্ছে"
            )}
            maxLength={200}
            required
          />

          <label htmlFor="fec-category">
            {L("Problem Category", "সমস্যার ধরন")}
          </label>

          <select
            id="fec-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="Crop Disease">{getCategoryLabel("Crop Disease")}</option>
            <option value="Pest Problem">{getCategoryLabel("Pest Problem")}</option>
            <option value="Soil Problem">{getCategoryLabel("Soil Problem")}</option>
            <option value="Fertilizer Advice">{getCategoryLabel("Fertilizer Advice")}</option>
            <option value="Irrigation">{getCategoryLabel("Irrigation")}</option>
            <option value="Crop Management">{getCategoryLabel("Crop Management")}</option>
            <option value="Other">{getCategoryLabel("Other")}</option>
          </select>

          <label htmlFor="fec-details">
            {L("Describe Your Problem", "তোমার সমস্যাটি বিস্তারিত লেখো")} *
          </label>

          <textarea
            id="fec-details"
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder={L(
              "Describe your crop problem in detail...",
              "তোমার ফসলের সমস্যাটি বিস্তারিতভাবে বর্ণনা করো..."
            )}
            rows={6}
            required
          />

          <button
            className="fec-submit"
            type="submit"
            disabled={submitting || experts.length === 0}
          >
            {submitting
              ? L("Sending...", "পাঠানো হচ্ছে...")
              : L("Send to Expert", "বিশেষজ্ঞের কাছে পাঠাও")}
          </button>

          {experts.length === 0 && (
            <p className="fec-empty">
              {L(
                "No active Experts are currently available.",
                "এই মুহূর্তে কোনো সক্রিয় বিশেষজ্ঞ পাওয়া যাচ্ছে না।"
              )}
            </p>
          )}
        </form>
      </section>

      <section className="fec-history">
        <div className="fec-history-heading">
          <div>
            <h3>{L("My Expert Requests", "আমার বিশেষজ্ঞের অনুরোধ")}</h3>

            <p>
              {L(
                "Track your submitted problems and Expert replies.",
                "তোমার পাঠানো সমস্যা এবং বিশেষজ্ঞের উত্তর দেখো।"
              )}
            </p>
          </div>

          <span className="fec-count">
            {requests.length} {L("Requests", "টি অনুরোধ")}
          </span>
        </div>

        {requests.length === 0 ? (
          <div className="fec-empty-card">
            <h4>{L("No requests yet", "এখনো কোনো অনুরোধ নেই")}</h4>

            <p>
              {L(
                "Your submitted problems will appear here.",
                "তোমার পাঠানো সমস্যাগুলো এখানে দেখা যাবে।"
              )}
            </p>
          </div>
        ) : (
          <div className="fec-request-list">
            {requests.map((request) => (
              <article className="fec-request-card" key={request.id}>
                <div className="fec-request-top">
                  <div>
                    <h4>{request.title}</h4>

                    <p>
                      {L("Expert:", "বিশেষজ্ঞ:")}{" "}
                      {request.expert_name ||
                        L("Assigned Expert", "নির্ধারিত বিশেষজ্ঞ")}
                    </p>
                  </div>

                  <span
                    className={`fec-status ${getStatusClass(request.status)}`}
                  >
                    {getStatusLabel(request.status)}
                  </span>
                </div>

                {request.category && (
                  <p className="fec-category">
                    {getCategoryLabel(request.category)}
                  </p>
                )}

                <p className="fec-problem">
                  {request.problem_details}
                </p>

                {request.expert_response && (
                  <div className="fec-response">
                    <strong>
                      {L("Expert's Response", "বিশেষজ্ঞের উত্তর")}
                    </strong>

                    <p>{request.expert_response}</p>

                    {request.responded_at && (
                      <small>
                        {L("Replied:", "উত্তর দিয়েছেন:")}{" "}
                        {formatDate(request.responded_at)}
                      </small>
                    )}
                  </div>
                )}

                <small className="fec-date">
                  {L("Submitted:", "পাঠানো হয়েছে:")}{" "}
                  {formatDate(request.created_at)}
                </small>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default FarmerExpertCommunication;
