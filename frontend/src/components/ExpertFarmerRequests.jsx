
import { useEffect, useState } from "react";

import {
  getIncomingExpertRequests,
  updateExpertRequest,
} from "../services/farmerExpertRequestApi";

import "./ExpertFarmerRequests.css";

function ExpertFarmerRequests() {
  const [requests, setRequests] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getIncomingExpertRequests();

      setRequests(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load incoming requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleUpdate = async (request, status) => {
    setError("");
    setMessage("");

    const expertResponse = responses[request.id] || "";

    if (status === "RESPONDED" && !expertResponse.trim()) {
      setError("Please write your advice before sending.");
      return;
    }

    try {
      setBusyId(request.id);

      await updateExpertRequest(request.id, {
        status,
        ...(status === "RESPONDED" || status === "RESOLVED"
          ? { expert_response: expertResponse.trim() }
          : {}),
      });

      setMessage("Request updated successfully.");
      await loadRequests();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update this request."
      );
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="efr-container">
        <p>Loading farmer requests...</p>
      </div>
    );
  }

  return (
    <div className="efr-container">
      <div className="efr-header">
        <div>
          <span className="efr-eyebrow">FARMER SUPPORT</span>
          <h2>Incoming Farmer Requests</h2>
          <p>Review problems and provide agricultural guidance.</p>
        </div>

        <button type="button" onClick={loadRequests}>
          Refresh
        </button>
      </div>

      {error && <div className="efr-alert error">{error}</div>}
      {message && <div className="efr-alert success">{message}</div>}

      {requests.length === 0 ? (
        <div className="efr-empty">
          <h3>No incoming requests</h3>
          <p>New Farmer requests will appear here.</p>
        </div>
      ) : (
        <div className="efr-list">
          {requests.map((request) => {
            const closed = ["RESOLVED", "REJECTED"].includes(
              request.status
            );

            return (
              <article className="efr-card" key={request.id}>
                <div className="efr-card-heading">
                  <div>
                    <h3>{request.title}</h3>
                    <p>Farmer: {request.farmer_name}</p>
                    <p>Phone: {request.farmer_phone || "Not provided"}</p>
                  </div>

                  <span
                    className={`efr-status ${String(
                      request.status
                    ).toLowerCase()}`}
                  >
                    {request.status}
                  </span>
                </div>

                <div className="efr-info">
                  <span>Category: {request.category || "Other"}</span>
                  <span>Crop: {request.crop_name || "Not specified"}</span>
                  <span>District: {request.district || "Not provided"}</span>
                  <span>Upazila: {request.upazila || "Not provided"}</span>
                </div>

                <div className="efr-problem">
                  <strong>Farmer's Problem</strong>
                  <p>{request.problem_details}</p>
                </div>

                {request.image_url && (
                  <p>
                    <a
                      href={request.image_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View attached image
                    </a>
                  </p>
                )}

                {request.expert_response && (
                  <div className="efr-existing-response">
                    <strong>Your previous response</strong>
                    <p>{request.expert_response}</p>
                  </div>
                )}

                {!closed && (
                  <div className="efr-actions">
                    {request.status === "PENDING" && (
                      <>
                        <button
                          type="button"
                          className="efr-accept"
                          disabled={busyId === request.id}
                          onClick={() =>
                            handleUpdate(request, "ACCEPTED")
                          }
                        >
                          Accept
                        </button>

                        <button
                          type="button"
                          className="efr-reject"
                          disabled={busyId === request.id}
                          onClick={() =>
                            handleUpdate(request, "REJECTED")
                          }
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {["ACCEPTED", "RESPONDED"].includes(request.status) && (
                      <>
                        <label htmlFor={`reply-${request.id}`}>
                          Write agricultural advice
                        </label>

                        <textarea
                          id={`reply-${request.id}`}
                          rows={5}
                          value={responses[request.id] ?? request.expert_response ?? ""}
                          onChange={(event) =>
                            setResponses((previous) => ({
                              ...previous,
                              [request.id]: event.target.value,
                            }))
                          }
                          placeholder="Write your advice for this farmer..."
                        />

                        <button
                          type="button"
                          className="efr-reply"
                          disabled={busyId === request.id}
                          onClick={() =>
                            handleUpdate(request, "RESPONDED")
                          }
                        >
                          Send Advice
                        </button>
                      </>
                    )}

                    {request.status === "RESPONDED" && (
                      <button
                        type="button"
                        className="efr-resolve"
                        disabled={busyId === request.id}
                        onClick={() =>
                          handleUpdate(request, "RESOLVED")
                        }
                      >
                        Mark as Resolved
                      </button>
                    )}
                  </div>
                )}

                <small>
                  Submitted:{" "}
                  {new Date(request.created_at).toLocaleString()}
                </small>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ExpertFarmerRequests;
