
import { useCallback, useEffect, useState } from "react";

import {
  Sprout,
  LayoutDashboard,
  UserRound,
  Users,
  RefreshCw,
  LogOut,
  Phone,
  GraduationCap,
  BriefcaseBusiness,
  BookOpen,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  X,
  LoaderCircle,
  Award,
  ClipboardList,
  MessageSquareText,
  Save,
  Pencil,
} from "lucide-react";

import {
  getExpertProfile,
  getExpertsDirectory,
} from "../services/expertApi";

import { updateExpertProfile } from "../services/expertProfileApi";

import FarmerManagement from "./FarmerManagement";
import DiseaseDetectionHistory from "./DiseaseDetectionHistory";
import ExpertAdviceManagement from "./ExpertAdviceManagement";
import ExpertFarmerRequests from "./ExpertFarmerRequests";

import "./ExpertDashboard.css";

function getObject(result) {
  if (!result) return {};

  let data = result.data ?? result;

  if (data?.data && !Array.isArray(data.data)) {
    data = data.data;
  }

  if (data?.profile && typeof data.profile === "object") {
    data = data.profile;
  }

  return data && typeof data === "object" && !Array.isArray(data)
    ? data
    : {};
}

function getArray(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.data)) return result.data.data;
  return [];
}

const emptyProfileForm = {
  full_name: "",
  phone: "",
  expertise: "",
  qualification: "",
  experience_years: "",
  bio: "",
  contact_information: "",
};

function ExpertDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("overview");

  const [profile, setProfile] = useState({});
  const [experts, setExperts] = useState([]);

  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const expertName =
    profile.full_name ||
    user?.full_name ||
    "Agri Expert";

  const loadExpertData = useCallback(async () => {
    setLoading(true);
    setError("");

    const results = await Promise.allSettled([
      getExpertProfile(),
      getExpertsDirectory(),
    ]);

    const [profileResult, directoryResult] = results;

    if (profileResult.status === "fulfilled") {
      const loadedProfile = getObject(profileResult.value);

      setProfile(loadedProfile);

      setProfileForm({
        full_name: loadedProfile.full_name || user?.full_name || "",
        phone: loadedProfile.phone || user?.phone || "",
        expertise: loadedProfile.expertise || "",
        qualification: loadedProfile.qualification || "",
        experience_years:
          loadedProfile.experience_years ?? "",
        bio: loadedProfile.bio || "",
        contact_information:
          loadedProfile.contact_information || "",
      });
    }

    if (directoryResult.status === "fulfilled") {
      setExperts(getArray(directoryResult.value));
    }

    const failed = results.find(
      (result) => result.status === "rejected"
    );

    if (failed) {
      const status = failed.reason?.response?.status;

      if (status === 401 || status === 403) {
        setError(
          "Your session is invalid or expired. Please log in again."
        );
      } else {
        setError(
          failed.reason?.response?.data?.message ||
            "Some expert information could not be loaded."
        );
      }
    }

    setLoading(false);
  }, [user?.full_name, user?.phone]);

  useEffect(() => {
    loadExpertData();
  }, [loadExpertData]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const fullName = profileForm.full_name.trim();
    const phone = profileForm.phone.trim();

    if (!fullName || !phone) {
      setError("Full name and phone number are required.");
      return;
    }

    if (!/^[0-9+]{8,15}$/.test(phone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    const experienceValue =
      profileForm.experience_years === ""
        ? null
        : Number(profileForm.experience_years);

    if (
      experienceValue !== null &&
      (!Number.isFinite(experienceValue) ||
        experienceValue < 0 ||
        !Number.isInteger(experienceValue))
    ) {
      setError("Experience must be a valid whole number.");
      return;
    }

    const payload = {
      full_name: fullName,
      phone,
      expertise: profileForm.expertise.trim(),
      qualification: profileForm.qualification.trim(),
      experience_years: experienceValue,
      bio: profileForm.bio.trim(),
      contact_information:
        profileForm.contact_information.trim(),
    };

    try {
      setSavingProfile(true);

      const response = await updateExpertProfile(payload);
      const updatedProfile = getObject(response);

      setProfile((previous) => ({
        ...previous,
        ...payload,
        ...(updatedProfile || {}),
      }));

      setProfileForm({
        ...payload,
        experience_years: payload.experience_years ?? "",
      });

      setIsEditingProfile(false);
      setSuccess("Your professional profile has been updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update your profile. Please try again."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const cancelProfileEdit = () => {
    setProfileForm({
      full_name: profile.full_name || user?.full_name || "",
      phone: profile.phone || user?.phone || "",
      expertise: profile.expertise || "",
      qualification: profile.qualification || "",
      experience_years: profile.experience_years ?? "",
      bio: profile.bio || "",
      contact_information: profile.contact_information || "",
    });

    setIsEditingProfile(false);
    setError("");
  };

  const expertPhone =
    profile.phone || user?.phone || "Not available";

  const expertise =
    profile.expertise || "Not provided";

  const qualification =
    profile.qualification || "Not provided";

  const experience =
    profile.experience_years !== undefined &&
    profile.experience_years !== null
      ? `${profile.experience_years} years`
      : "Not provided";

  const bio =
    profile.bio || "No professional biography has been added yet.";

  const contactInformation =
    profile.contact_information || "Not provided";

  const pageTitle = {
    overview: "Expert Overview",
    profile: "My Professional Profile",
    directory: "Expert Directory",
    farmers: "Farmer Management",
    "disease-history": "Disease Detection History",
    advice: "Advice Management",
    "farmer-requests": "Farmer Consultation Requests",
  };

  return (
    <div className="expert-dashboard">
      <aside className="expert-sidebar">
        <div className="expert-brand">
          <div className="expert-brand-icon">
            <Sprout size={27} />
          </div>

          <div>
            <h2>AgriSense BD</h2>
            <span>Expert Portal</span>
          </div>
        </div>

        <div className="expert-menu-label">EXPERT MENU</div>

        <nav className="expert-navigation">
          <button
            type="button"
            className={activeTab === "overview" ? "active" : ""}
            onClick={() => setActiveTab("overview")}
          >
            <LayoutDashboard size={19} />
            Overview
          </button>

          <button
            type="button"
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => setActiveTab("profile")}
          >
            <UserRound size={19} />
            My Profile
          </button>

          <button
            type="button"
            className={activeTab === "directory" ? "active" : ""}
            onClick={() => setActiveTab("directory")}
          >
            <Users size={19} />
            Expert Directory
          </button>

          <button
            type="button"
            className={activeTab === "farmers" ? "active" : ""}
            onClick={() => setActiveTab("farmers")}
          >
            <Sprout size={19} />
            Farmer Management
          </button>

          <button
            type="button"
            className={activeTab === "advice" ? "active" : ""}
            onClick={() => setActiveTab("advice")}
          >
            <MessageSquareText size={19} />
            Advice Management
          </button>

          <button
            type="button"
            className={
              activeTab === "farmer-requests" ? "active" : ""
            }
            onClick={() => setActiveTab("farmer-requests")}
          >
            <ClipboardList size={19} />
            Farmer Requests
          </button>

          <button
            type="button"
            className={
              activeTab === "disease-history" ? "active" : ""
            }
            onClick={() => setActiveTab("disease-history")}
          >
            <ClipboardList size={19} />
            Disease History
          </button>
        </nav>

        <div className="expert-sidebar-footer">
          <div className="expert-sidebar-user">
            <div className="expert-avatar">
              {expertName.charAt(0).toUpperCase()}
            </div>

            <div className="expert-user-details">
              <strong>{expertName}</strong>
              <span>Agri Expert</span>
            </div>
          </div>

          <button
            type="button"
            className="expert-logout"
            onClick={onLogout}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="expert-main">
        <header className="expert-topbar">
          <div>
            <span className="expert-breadcrumb">
              AGRISENSE BD / EXPERT PORTAL
            </span>

            <h1>{pageTitle[activeTab]}</h1>
          </div>

          {activeTab !== "farmers" &&
            activeTab !== "disease-history" &&
            activeTab !== "advice" &&
            activeTab !== "farmer-requests" && (
              <button
                type="button"
                className="expert-refresh"
                onClick={loadExpertData}
                disabled={loading || savingProfile}
              >
                <RefreshCw size={17} />
                Refresh
              </button>
            )}
        </header>

        <div className="expert-content">
          {error && (
            <div className="expert-alert error">
              <AlertCircle size={19} />
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
              >
                <X size={17} />
              </button>
            </div>
          )}

          {success && (
            <div className="expert-alert success">
              <CheckCircle size={19} />
              <span>{success}</span>

              <button
                type="button"
                onClick={() => setSuccess("")}
              >
                <X size={17} />
              </button>
            </div>
          )}

          {activeTab === "farmers" ? (
            <FarmerManagement />
          ) : activeTab === "disease-history" ? (
            <DiseaseDetectionHistory />
          ) : activeTab === "advice" ? (
            <ExpertAdviceManagement />
          ) : activeTab === "farmer-requests" ? (
            <ExpertFarmerRequests />
          ) : loading ? (
            <div className="expert-loading">
              <LoaderCircle
                size={34}
                className="expert-spinner"
              />
              <p>Loading expert information...</p>
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <>
                  <section className="expert-welcome">
                    <div>
                      <span>AGRICULTURE EXPERT PORTAL</span>

                      <h2>Welcome, {expertName}</h2>

                      <p>
                        Access your professional profile and
                        connect with the AgriSense BD expert community.
                      </p>
                    </div>

                    <div className="expert-welcome-icon">
                      <GraduationCap size={70} />
                    </div>
                  </section>

                  <section className="expert-stat-grid">
                    <article className="expert-stat-card">
                      <div className="expert-stat-icon green">
                        <UserRound size={23} />
                      </div>

                      <span>Account Role</span>
                      <strong>Agri Expert</strong>
                      <small>Professional account</small>
                    </article>

                    <article className="expert-stat-card">
                      <div className="expert-stat-icon blue">
                        <Users size={23} />
                      </div>

                      <span>Expert Community</span>
                      <strong>{experts.length}</strong>
                      <small>Active experts in directory</small>
                    </article>

                    <article className="expert-stat-card">
                      <div className="expert-stat-icon orange">
                        <BriefcaseBusiness size={23} />
                      </div>

                      <span>Experience</span>
                      <strong>{experience}</strong>
                      <small>Professional experience</small>
                    </article>
                  </section>

                  <section className="expert-panel">
                    <div className="expert-panel-heading">
                      <div>
                        <h3>Professional Information</h3>
                        <p>Your current expert profile details</p>
                      </div>

                      <button
                        type="button"
                        className="expert-outline-button"
                        onClick={() => setActiveTab("profile")}
                      >
                        View Profile
                      </button>
                    </div>

                    <div className="expert-info-grid">
                      <div>
                        <GraduationCap size={19} />
                        <span>Expertise</span>
                        <strong>{expertise}</strong>
                      </div>

                      <div>
                        <Award size={19} />
                        <span>Qualification</span>
                        <strong>{qualification}</strong>
                      </div>

                      <div>
                        <Phone size={19} />
                        <span>Phone Number</span>
                        <strong>{expertPhone}</strong>
                      </div>

                      <div>
                        <Users size={19} />
                        <span>Expert Directory</span>
                        <strong>{experts.length} Experts</strong>
                      </div>
                    </div>
                  </section>

                  <section className="expert-notice">
                    <ShieldCheck size={22} />

                    <div>
                      <h4>Professional Workspace</h4>
                      <p>
                        Manage farmer profiles, review their crop
                        information, provide farming advice, and
                        review AI disease detection records.
                      </p>

                      <button
                        type="button"
                        className="expert-outline-button"
                        onClick={() => setActiveTab("farmers")}
                      >
                        <Users size={16} />
                        Open Farmer Management
                      </button>

                      <button
                        type="button"
                        className="expert-outline-button"
                        onClick={() => setActiveTab("advice")}
                      >
                        <MessageSquareText size={16} />
                        Manage Farmer Advice
                      </button>

                      <button
                        type="button"
                        className="expert-outline-button"
                        onClick={() => setActiveTab("farmer-requests")}
                      >
                        <ClipboardList size={16} />
                        View Farmer Requests
                      </button>

                      <button
                        type="button"
                        className="expert-outline-button"
                        onClick={() => setActiveTab("disease-history")}
                      >
                        <ClipboardList size={16} />
                        View Disease History
                      </button>
                    </div>
                  </section>
                </>
              )}

              {activeTab === "profile" && (
                <section className="expert-panel">
                  <div className="expert-panel-heading">
                    <div>
                      <h3>My Professional Profile</h3>
                      <p>
                        View and update your professional information
                      </p>
                    </div>

                    {!isEditingProfile && (
                      <button
                        type="button"
                        className="expert-outline-button"
                        onClick={() => {
                          setError("");
                          setSuccess("");
                          setIsEditingProfile(true);
                        }}
                      >
                        <Pencil size={16} />
                        Edit Profile
                      </button>
                    )}
                  </div>

                  <div className="expert-profile-header">
                    <div className="expert-profile-avatar">
                      {expertName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h2>{expertName}</h2>
                      <span>AGRICULTURE EXPERT</span>
                    </div>
                  </div>

                  {isEditingProfile ? (
                    <form
                      className="expert-profile-edit-form"
                      onSubmit={handleProfileSubmit}
                    >
                      <div className="expert-profile-grid">
                        <label>
                          <span>Full Name *</span>
                          <input
                            type="text"
                            name="full_name"
                            value={profileForm.full_name}
                            onChange={handleProfileChange}
                            required
                            maxLength={150}
                          />
                        </label>

                        <label>
                          <span>Phone Number *</span>
                          <input
                            type="tel"
                            name="phone"
                            value={profileForm.phone}
                            onChange={handleProfileChange}
                            required
                            maxLength={15}
                          />
                        </label>

                        <label>
                          <span>Expertise</span>
                          <input
                            type="text"
                            name="expertise"
                            value={profileForm.expertise}
                            onChange={handleProfileChange}
                            maxLength={200}
                          />
                        </label>

                        <label>
                          <span>Qualification</span>
                          <input
                            type="text"
                            name="qualification"
                            value={profileForm.qualification}
                            onChange={handleProfileChange}
                            maxLength={200}
                          />
                        </label>

                        <label>
                          <span>Experience (Years)</span>
                          <input
                            type="number"
                            name="experience_years"
                            value={profileForm.experience_years}
                            onChange={handleProfileChange}
                            min="0"
                            step="1"
                          />
                        </label>

                        <label>
                          <span>Contact Information</span>
                          <input
                            type="text"
                            name="contact_information"
                            value={profileForm.contact_information}
                            onChange={handleProfileChange}
                            maxLength={255}
                          />
                        </label>
                      </div>

                      <label className="expert-profile-bio-field">
                        <span>Professional Biography</span>
                        <textarea
                          name="bio"
                          value={profileForm.bio}
                          onChange={handleProfileChange}
                          rows={5}
                          maxLength={2000}
                        />
                      </label>

                      <div className="expert-profile-actions">
                        <button
                          type="button"
                          className="expert-outline-button"
                          onClick={cancelProfileEdit}
                          disabled={savingProfile}
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          className="expert-outline-button"
                          disabled={savingProfile}
                        >
                          {savingProfile ? (
                            <>
                              <LoaderCircle
                                size={17}
                                className="expert-spinner"
                              />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save size={17} />
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="expert-profile-grid">
                        <div>
                          <span>Full Name</span>
                          <strong>{expertName}</strong>
                        </div>

                        <div>
                          <span>Phone Number</span>
                          <strong>{expertPhone}</strong>
                        </div>

                        <div>
                          <span>Expertise</span>
                          <strong>{expertise}</strong>
                        </div>

                        <div>
                          <span>Qualification</span>
                          <strong>{qualification}</strong>
                        </div>

                        <div>
                          <span>Experience</span>
                          <strong>{experience}</strong>
                        </div>

                        <div>
                          <span>Contact Information</span>
                          <strong>{contactInformation}</strong>
                        </div>
                      </div>

                      <div className="expert-bio">
                        <h4>
                          <BookOpen size={18} />
                          Professional Biography
                        </h4>

                        <p>{bio}</p>
                      </div>
                    </>
                  )}
                </section>
              )}

              {activeTab === "directory" && (
                <section className="expert-panel">
                  <div className="expert-panel-heading">
                    <div>
                      <h3>Agri Expert Directory</h3>
                      <p>
                        Active experts registered on AgriSense BD
                      </p>
                    </div>
                  </div>

                  {experts.length === 0 ? (
                    <div className="expert-empty">
                      <Users size={40} />
                      <h4>No experts available</h4>
                      <p>
                        There are currently no active expert
                        accounts in the directory.
                      </p>
                    </div>
                  ) : (
                    <div className="expert-directory-grid">
                      {experts.map((item, index) => (
                        <article
                          className="expert-directory-card"
                          key={item.id ?? index}
                        >
                          <div className="expert-directory-card-top">
                            <div className="expert-directory-avatar">
                              {(item.full_name || item.name || "E")
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <span className="expert-directory-status">
                              Active
                            </span>
                          </div>

                          <h3>
                            {item.full_name ||
                              item.name ||
                              "Agri Expert"}
                          </h3>

                          <p className="expert-directory-specialty">
                            {item.expertise || "Agriculture Expert"}
                          </p>

                          <div className="expert-directory-detail">
                            <GraduationCap size={16} />
                            <span>
                              {item.qualification ||
                                "Qualification not provided"}
                            </span>
                          </div>

                          <div className="expert-directory-detail">
                            <BriefcaseBusiness size={16} />
                            <span>
                              {item.experience_years !== undefined &&
                              item.experience_years !== null
                                ? `${item.experience_years} years experience`
                                : "Experience not provided"}
                            </span>
                          </div>

                          <div className="expert-directory-detail">
                            <Phone size={16} />
                            <span>
                              {item.phone || "Phone not provided"}
                            </span>
                          </div>

                          {item.bio && (
                            <p className="expert-directory-bio">
                              {item.bio}
                            </p>
                          )}
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default ExpertDashboard;
