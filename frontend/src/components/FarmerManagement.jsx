
import { useCallback, useEffect, useState } from "react";
import {
    Search,
    Users,
    MapPin,
    Phone,
    Sprout,
    ArrowLeft,
    RefreshCw,
    AlertCircle,
    CalendarDays,
    LandPlot,
    UserRound
} from "lucide-react";

import {
    getExpertFarmers,
    getExpertFarmerDetails
} from "../services/expertFarmerApi";

import "./FarmerManagement.css";

const formatDate = (date) => {
    if (!date) return "Not provided";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return String(date);
    }

    return parsedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
};

const formatStatus = (status) => {
    if (!status) return "Not specified";

    return status.charAt(0) + status.slice(1).toLowerCase();
};

function FarmerManagement() {
    const [farmers, setFarmers] = useState([]);
    const [selectedFarmer, setSelectedFarmer] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [error, setError] = useState("");

    const loadFarmers = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const result = await getExpertFarmers();

            if (!result.success) {
                throw new Error(
                    result.message || "Could not load farmers."
                );
            }

            setFarmers(result.data || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load farmer information."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFarmers();
    }, [loadFarmers]);

    const openFarmerDetails = async (farmerId) => {
        try {
            setDetailsLoading(true);
            setError("");

            const result = await getExpertFarmerDetails(farmerId);

            if (!result.success) {
                throw new Error(
                    result.message || "Could not load farmer details."
                );
            }

            setSelectedFarmer(result.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to load farmer details."
            );
        } finally {
            setDetailsLoading(false);
        }
    };

    const filteredFarmers = farmers.filter((farmer) => {
        const search = searchTerm.trim().toLowerCase();

        if (!search) return true;

        return [
            farmer.full_name,
            farmer.phone,
            farmer.district,
            farmer.upazila
        ].some((value) =>
            String(value || "").toLowerCase().includes(search)
        );
    });

    if (selectedFarmer) {
        return (
            <section className="fm-page">
                <button
                    className="fm-back-button"
                    onClick={() => setSelectedFarmer(null)}
                >
                    <ArrowLeft size={18} />
                    Back to Farmer List
                </button>

                <div className="fm-detail-header">
                    <div className="fm-avatar fm-large-avatar">
                        <UserRound size={30} />
                    </div>

                    <div>
                        <h2>{selectedFarmer.full_name}</h2>
                        <p>Farmer Profile Details</p>
                    </div>
                </div>

                <div className="fm-detail-grid">
                    <div className="fm-detail-card">
                        <h3>
                            <UserRound size={19} />
                            Personal Information
                        </h3>

                        <div className="fm-info-row">
                            <span>Full Name</span>
                            <strong>{selectedFarmer.full_name || "—"}</strong>
                        </div>

                        <div className="fm-info-row">
                            <span>Phone Number</span>
                            <strong>{selectedFarmer.phone || "—"}</strong>
                        </div>

                        <div className="fm-info-row">
                            <span>District</span>
                            <strong>{selectedFarmer.district || "—"}</strong>
                        </div>

                        <div className="fm-info-row">
                            <span>Upazila</span>
                            <strong>{selectedFarmer.upazila || "—"}</strong>
                        </div>

                        <div className="fm-info-row">
                            <span>Address</span>
                            <strong>{selectedFarmer.address || "—"}</strong>
                        </div>
                    </div>

                    <div className="fm-detail-card">
                        <h3>
                            <Sprout size={19} />
                            Farming Summary
                        </h3>

                        <div className="fm-summary-number">
                            {selectedFarmer.total_crops || 0}
                        </div>
                        <p className="fm-summary-label">
                            Registered Crop Records
                        </p>
                    </div>
                </div>

                <div className="fm-detail-card fm-crops-detail">
                    <div className="fm-section-heading">
                        <div>
                            <h3>
                                <Sprout size={20} />
                                Selected Crops
                            </h3>
                            <p>Crop and land information</p>
                        </div>

                        <span className="fm-count">
                            {selectedFarmer.crops?.length || 0} Crops
                        </span>
                    </div>

                    {!selectedFarmer.crops?.length ? (
                        <div className="fm-empty">
                            <Sprout size={32} />
                            <p>This farmer has not selected any crops yet.</p>
                        </div>
                    ) : (
                        <div className="fm-crop-grid">
                            {selectedFarmer.crops.map((crop) => (
                                <article
                                    className="fm-crop-card"
                                    key={crop.farmer_crop_id}
                                >
                                    <div className="fm-crop-title">
                                        <div className="fm-crop-icon">
                                            <Sprout size={20} />
                                        </div>
                                        <div>
                                            <h4>{crop.crop_name}</h4>
                                            <span>
                                                Crop ID: {crop.crop_id}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="fm-crop-data">
                                        <div>
                                            <LandPlot size={16} />
                                            <span>
                                                {crop.land_area} {crop.land_unit}
                                            </span>
                                        </div>

                                        <div>
                                            <CalendarDays size={16} />
                                            <span>
                                                {formatDate(crop.planting_date)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="fm-status-row">
                                        <span>Farming Status</span>
                                        <span className={`fm-status status-${(crop.farming_status || "unknown").toLowerCase()}`}>
                                            {formatStatus(crop.farming_status)}
                                        </span>
                                    </div>

                                    {crop.notes && (
                                        <div className="fm-notes">
                                            <strong>Notes:</strong> {crop.notes}
                                        </div>
                                    )}

                                    {crop.crop_description && (
                                        <p className="fm-crop-description">
                                            {crop.crop_description}
                                        </p>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        );
    }

    return (
        <section className="fm-page">
            <div className="fm-heading">
                <div>
                    <span className="fm-eyebrow">EXPERT WORKSPACE</span>
                    <h2>Farmer Management</h2>
                    <p>View farmer profiles and their farming activities.</p>
                </div>

                <button
                    className="fm-refresh-button"
                    onClick={loadFarmers}
                    disabled={loading}
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>
            </div>

            <div className="fm-stats">
                <div className="fm-stat-card">
                    <div className="fm-stat-icon">
                        <Users size={22} />
                    </div>
                    <div>
                        <span>Total Farmers</span>
                        <strong>{farmers.length}</strong>
                    </div>
                </div>

                <div className="fm-stat-card">
                    <div className="fm-stat-icon">
                        <Sprout size={22} />
                    </div>
                    <div>
                        <span>Farmers with Crops</span>
                        <strong>
                            {farmers.filter(
                                (farmer) => farmer.total_crops > 0
                            ).length}
                        </strong>
                    </div>
                </div>

                <div className="fm-stat-card">
                    <div className="fm-stat-icon">
                        <LandPlot size={22} />
                    </div>
                    <div>
                        <span>Total Crop Records</span>
                        <strong>
                            {farmers.reduce(
                                (total, farmer) =>
                                    total + (farmer.total_crops || 0),
                                0
                            )}
                        </strong>
                    </div>
                </div>
            </div>

            <div className="fm-list-card">
                <div className="fm-list-heading">
                    <div>
                        <h3>Registered Farmers</h3>
                        <p>Search and view farmer information.</p>
                    </div>

                    <span className="fm-count">
                        {filteredFarmers.length} Results
                    </span>
                </div>

                <div className="fm-search">
                    <Search size={19} />
                    <input
                        type="search"
                        placeholder="Search by name, phone, district or upazila..."
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(event.target.value)
                        }
                    />
                </div>

                {error && (
                    <div className="fm-error">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="fm-loading">
                        <RefreshCw className="fm-spin" size={25} />
                        <p>Loading farmer information...</p>
                    </div>
                ) : filteredFarmers.length === 0 ? (
                    <div className="fm-empty">
                        <Users size={35} />
                        <p>
                            {farmers.length === 0
                                ? "No farmers are registered yet."
                                : "No farmers match your search."}
                        </p>
                    </div>
                ) : (
                    <div className="fm-table-wrapper">
                        <table className="fm-table">
                            <thead>
                                <tr>
                                    <th>Farmer</th>
                                    <th>Contact</th>
                                    <th>Location</th>
                                    <th>Crop Records</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredFarmers.map((farmer) => (
                                    <tr key={farmer.id}>
                                        <td>
                                            <div className="fm-farmer-cell">
                                                <div className="fm-avatar">
                                                    <UserRound size={19} />
                                                </div>
                                                <div>
                                                    <strong>
                                                        {farmer.full_name}
                                                    </strong>
                                                    <span>
                                                        Farmer ID: {farmer.id}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <div className="fm-contact">
                                                <Phone size={15} />
                                                {farmer.phone}
                                            </div>
                                        </td>

                                        <td>
                                            <div className="fm-location">
                                                <MapPin size={15} />
                                                <span>
                                                    {[
                                                        farmer.upazila,
                                                        farmer.district
                                                    ]
                                                        .filter(Boolean)
                                                        .join(", ") || "Not provided"}
                                                </span>
                                            </div>
                                        </td>

                                        <td>
                                            <span className="fm-count">
                                                {farmer.total_crops || 0} Crops
                                            </span>
                                        </td>

                                        <td>
                                            <button
                                                className="fm-view-button"
                                                onClick={() =>
                                                    openFarmerDetails(farmer.id)
                                                }
                                                disabled={detailsLoading}
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {detailsLoading && (
                <div className="fm-loading fm-details-loading">
                    <RefreshCw className="fm-spin" size={22} />
                    <p>Loading farmer details...</p>
                </div>
            )}
        </section>
    );
}

export default FarmerManagement;
