import React, { useEffect, useState } from "react";
import {
  getExpertProfile,
  updateExpertProfile,
} from "../services/expertProfileApi";

const initialForm = {
  full_name: "",
  phone: "",
  expertise: "",
  qualification: "",
  experience_years: "",
  bio: "",
  contact_information: "",
};

const inputStyle = {
  width: "100%",
  padding: "11px 13px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  marginTop: "7px",
  boxSizing: "border-box",
  fontSize: "14px",
};

const fieldStyle = {
  display: "block",
  marginBottom: "17px",
  fontWeight: 600,
  color: "#374151",
};

export default function ExpertProfile() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getExpertProfile();
      const profile = result?.data?.profile || result?.profile || result?.data || result;

      setForm({
        full_name: profile?.full_name || "",
        phone: profile?.phone || "",
        expertise: profile?.expertise || "",
        qualification: profile?.qualification || "",
        experience_years: profile?.experience_years ?? "",
        bio: profile?.bio || "",
        contact_information: profile?.contact_information || "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load expert profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!form.full_name.trim() || !form.phone.trim()) {
      setError("Name and phone number are required.");
      return;
    }

    if (
      form.experience_years !== "" &&
      (!Number.isInteger(Number(form.experience_years)) ||
        Number(form.experience_years) < 0)
    ) {
      setError("Experience must be a valid non-negative number.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        experience_years:
          form.experience_years === ""
            ? null
            : Number(form.experience_years),
      };

      const result = await updateExpertProfile(payload);

      setMessage(
        result?.message || "Profile updated successfully."
      );

      await loadProfile();
    } catch (err) {
      setError(
        err.response?.data?.message || "Profile update failed."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 25 }}>Loading profile...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{ margin: 0 }}>My Expert Profile</h2>
        <p style={{ color: "#6b7280", marginBottom: 0 }}>
          Manage your professional information.
        </p>
      </div>

      {message && <div style={styles.success}>{message}</div>}
      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={fieldStyle}>
          Full Name *
          <input
            style={inputStyle}
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            required
          />
        </label>

        <label style={fieldStyle}>
          Phone Number *
          <input
            style={inputStyle}
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </label>

        <label style={fieldStyle}>
          Area of Expertise
          <input
            style={inputStyle}
            name="expertise"
            value={form.expertise}
            onChange={handleChange}
            placeholder="Example: Crop Disease Management"
          />
        </label>

        <label style={fieldStyle}>
          Qualification
          <input
            style={inputStyle}
            name="qualification"
            value={form.qualification}
            onChange={handleChange}
            placeholder="Your academic qualification"
          />
        </label>

        <label style={fieldStyle}>
          Years of Experience
          <input
            style={inputStyle}
            type="number"
            min="0"
            name="experience_years"
            value={form.experience_years}
            onChange={handleChange}
          />
        </label>

        <label style={fieldStyle}>
          Professional Bio
          <textarea
            style={{ ...inputStyle, minHeight: 110 }}
            name="bio"
            value={form.bio}
            onChange={handleChange}
            placeholder="Write about your experience and expertise..."
          />
        </label>

        <label style={fieldStyle}>
          Contact Information
          <textarea
            style={{ ...inputStyle, minHeight: 80 }}
            name="contact_information"
            value={form.contact_information}
            onChange={handleChange}
            placeholder="Additional contact information"
          />
        </label>

        <button type="submit" disabled={saving} style={styles.button}>
          {saving ? "Saving..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    padding: 24,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    maxWidth: 850,
  },
  header: {
    marginBottom: 25,
  },
  form: {
    maxWidth: 650,
  },
  button: {
    padding: "12px 24px",
    background: "#15803d",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },
  success: {
    padding: 12,
    background: "#dcfce7",
    color: "#166534",
    borderRadius: 8,
    marginBottom: 15,
  },
  error: {
    padding: 12,
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: 8,
    marginBottom: 15,
  },
};