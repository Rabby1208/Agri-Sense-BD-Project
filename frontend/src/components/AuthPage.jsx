
import { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";

import {
  Sprout,
  Phone,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  Leaf,
  CloudSun,
  ScanLine,
  CheckCircle2,
  LoaderCircle,
  UserRound,
} from "lucide-react";

import "./AuthPage.css";

const API_URL =
  import.meta.env.VITE_BACKEND_API_URL ||
  "http://127.0.0.1:5000/api";

function AuthPage({ onLogin, onBack }) {
  const { i18n } = useTranslation();

  const isBangla = i18n.language?.startsWith("bn");

  const tx = (english, bangla) =>
    isBangla ? bangla : english;

  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    password: "",
    address: "",
    district: "",
    upazila: "",
  });

  const translateMessage = (message) => {
    if (!isBangla || !message) return message;

    const messages = {
      "Please enter your phone number and password.":
        "অনুগ্রহ করে ফোন নম্বর ও পাসওয়ার্ড লিখুন।",

      "Please enter your full name.":
        "অনুগ্রহ করে আপনার সম্পূর্ণ নাম লিখুন।",

      "Password must be at least 8 characters.":
        "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।",

      "Registration successful. Please login.":
        "নিবন্ধন সফল হয়েছে। অনুগ্রহ করে লগইন করুন।",

      "Something went wrong. Please try again.":
        "কিছু সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",

      "Login response did not contain user information and token.":
        "লগইন থেকে প্রয়োজনীয় তথ্য পাওয়া যায়নি। আবার চেষ্টা করুন।",

      "Network Error":
        "সার্ভারের সাথে সংযোগ করা যাচ্ছে না।",
    };

    return messages[message] || message;
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.phone.trim() || !form.password) {
      setError(
        translateMessage(
          "Please enter your phone number and password."
        )
      );
      return;
    }

    if (mode === "register" && !form.full_name.trim()) {
      setError(
        translateMessage("Please enter your full name.")
      );
      return;
    }

    if (mode === "register" && form.password.length < 8) {
      setError(
        translateMessage(
          "Password must be at least 8 characters."
        )
      );
      return;
    }

    setLoading(true);

    try {
      const endpoint =
        mode === "login" ? "/auth/login" : "/auth/register";

      const payload =
        mode === "login"
          ? {
              phone: form.phone.trim(),
              password: form.password,
            }
          : {
              full_name: form.full_name.trim(),
              phone: form.phone.trim(),
              password: form.password,
              address: form.address.trim(),
              district: form.district.trim(),
              upazila: form.upazila.trim(),
            };

      const response = await axios.post(
        `${API_URL}${endpoint}`,
        payload,
        { timeout: 30000 }
      );

      const result = response.data;
      const user = result.user || result.data?.user;
      const token = result.token || result.data?.token;

      if (mode === "register") {
        setSuccess(
          translateMessage(
            result.message ||
              "Registration successful. Please login."
          )
        );

        setMode("login");

        setForm((previous) => ({
          ...previous,
          password: "",
        }));

        return;
      }

      if (!user || !token) {
        throw new Error(
          "Login response did not contain user information and token."
        );
      }

      onLogin(user, token);

    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Something went wrong. Please try again.";

      setError(translateMessage(errorMessage));

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <button
        className="auth-back-button"
        type="button"
        onClick={onBack}
      >
        <ArrowLeft size={17} />
        {tx("Back to Home", "হোমে ফিরে যান")}
      </button>

      <section className="auth-container">
        <aside className="auth-hero">
          <div className="auth-hero-decoration auth-decoration-one" />
          <div className="auth-hero-decoration auth-decoration-two" />

          <div className="auth-hero-content">
            <div className="auth-brand">
              <div className="auth-brand-icon">
                <Sprout size={28} />
              </div>

              <span>AgriSense BD</span>
            </div>

            <div className="auth-hero-main">
              <span className="auth-eyebrow">
                <Leaf size={15} />
                {tx(
                  "SMART AGRICULTURE PLATFORM",
                  "স্মার্ট কৃষি প্রযুক্তি প্ল্যাটফর্ম"
                )}
              </span>

              <h1>
                {tx("Grow Smarter.", "স্মার্টভাবে চাষ করুন।")}
                <br />
                {tx("Farm Better.", "কৃষিকে এগিয়ে নিন।")}
              </h1>

              <p>
                {tx(
                  "Empowering farmers with intelligent agricultural technology, crop insights and modern farming solutions.",
                  "আধুনিক কৃষি প্রযুক্তি, ফসলের তথ্য এবং স্মার্ট সমাধানের মাধ্যমে কৃষকদের ক্ষমতায়ন।"
                )}
              </p>

              <div className="auth-feature-list">
                <div>
                  <CheckCircle2 />
                  <span>
                    {tx(
                      "AI Crop Disease Detection",
                      "AI দিয়ে ফসলের রোগ শনাক্তকরণ"
                    )}
                  </span>
                </div>

                <div>
                  <CheckCircle2 />
                  <span>
                    {tx(
                      "Smart Crop Management",
                      "স্মার্ট ফসল ব্যবস্থাপনা"
                    )}
                  </span>
                </div>

                <div>
                  <CheckCircle2 />
                  <span>
                    {tx(
                      "Weather & Farming Insights",
                      "আবহাওয়া ও কৃষি পরামর্শ"
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="auth-hero-bottom">
              <div className="auth-mini-stat">
                <ScanLine size={19} />
                <span>
                  {tx(
                    "Smart Farming Technology",
                    "স্মার্ট কৃষি প্রযুক্তি"
                  )}
                </span>
              </div>

              <span>© 2026 AgriSense BD</span>
            </div>
          </div>
        </aside>

        <section className="auth-form-panel">
          <div className="auth-form-wrapper">
            <div className="auth-mobile-brand">
              <Sprout size={25} />
              <span>AgriSense BD</span>
            </div>

            <div className="auth-form-heading">
              <div className="auth-form-icon">
                {mode === "login" ? (
                  <ShieldCheck size={25} />
                ) : (
                  <UserRound size={25} />
                )}
              </div>

              <span className="auth-form-eyebrow">
                {mode === "login"
                  ? tx("WELCOME BACK", "আবারও স্বাগতম")
                  : tx("JOIN AGRISENSE BD", "AGRISENSE BD-তে যোগ দিন")}
              </span>

              <h2>
                {mode === "login"
                  ? tx(
                      "Login to your account",
                      "আপনার অ্যাকাউন্টে লগইন করুন"
                    )
                  : tx(
                      "Create your account",
                      "আপনার অ্যাকাউন্ট তৈরি করুন"
                    )}
              </h2>

              <p>
                {mode === "login"
                  ? tx(
                      "Enter your phone number and password to continue.",
                      "চালিয়ে যেতে ফোন নম্বর ও পাসওয়ার্ড লিখুন।"
                    )
                  : tx(
                      "Register to access smart agricultural services.",
                      "স্মার্ট কৃষি সেবা পেতে নিবন্ধন করুন।"
                    )}
              </p>
            </div>

            <div className="auth-tabs">
              <button
                type="button"
                className={mode === "login" ? "active" : ""}
                onClick={() => switchMode("login")}
              >
                {tx("Login", "লগইন")}
              </button>

              <button
                type="button"
                className={mode === "register" ? "active" : ""}
                onClick={() => switchMode("register")}
              >
                {tx("Register", "নিবন্ধন")}
              </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {mode === "register" && (
                <>
                  <label>
                    {tx("Full Name", "সম্পূর্ণ নাম")}
                  </label>

                  <div className="auth-input-wrap">
                    <UserRound size={19} />

                    <input
                      type="text"
                      name="full_name"
                      placeholder={tx(
                        "Enter your full name",
                        "আপনার সম্পূর্ণ নাম লিখুন"
                      )}
                      value={form.full_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </>
              )}

              <label>
                {tx("Phone Number", "ফোন নম্বর")}
              </label>

              <div className="auth-input-wrap">
                <Phone size={19} />

                <input
                  type="tel"
                  name="phone"
                  placeholder={tx(
                    "Enter your phone number",
                    "আপনার ফোন নম্বর লিখুন"
                  )}
                  value={form.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  required
                />
              </div>

              <label>
                {tx("Password", "পাসওয়ার্ড")}
              </label>

              <div className="auth-input-wrap">
                <LockKeyhole size={19} />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={tx(
                    "Enter your password",
                    "আপনার পাসওয়ার্ড লিখুন"
                  )}
                  value={form.password}
                  onChange={handleChange}
                  autoComplete={
                    mode === "login"
                      ? "current-password"
                      : "new-password"
                  }
                  required
                />

                <button
                  type="button"
                  className="auth-eye-button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={tx(
                    "Toggle password visibility",
                    "পাসওয়ার্ড দেখা বা লুকান"
                  )}
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>

              {mode === "register" && (
                <>
                  <label>
                    {tx("Address (Optional)", "ঠিকানা (ঐচ্ছিক)")}
                  </label>

                  <div className="auth-input-wrap">
                    <Leaf size={19} />

                    <input
                      type="text"
                      name="address"
                      placeholder={tx(
                        "Enter your address",
                        "আপনার ঠিকানা লিখুন"
                      )}
                      value={form.address}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="auth-location-grid">
                    <div>
                      <label>
                        {tx("District", "জেলা")}
                      </label>

                      <input
                        type="text"
                        name="district"
                        placeholder={tx("District", "জেলা")}
                        value={form.district}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label>
                        {tx("Upazila", "উপজেলা")}
                      </label>

                      <input
                        type="text"
                        name="upazila"
                        placeholder={tx("Upazila", "উপজেলা")}
                        value={form.upazila}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </>
              )}

              {error && (
                <div className="auth-message auth-error">
                  {error}
                </div>
              )}

              {success && (
                <div className="auth-message auth-success">
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoaderCircle className="auth-spinner" size={19} />
                    {tx("Please wait...", "অপেক্ষা করুন...")}
                  </>
                ) : mode === "login" ? (
                  tx("Login to Account", "অ্যাকাউন্টে লগইন করুন")
                ) : (
                  tx("Create Account", "অ্যাকাউন্ট তৈরি করুন")
                )}
              </button>
            </form>

            <div className="auth-switch-text">
              {mode === "login" ? (
                <>
                  {tx(
                    "Don't have an account?",
                    "অ্যাকাউন্ট নেই?"
                  )}

                  <button
                    type="button"
                    onClick={() => switchMode("register")}
                  >
                    {tx("Register now", "এখনই নিবন্ধন করুন")}
                  </button>
                </>
              ) : (
                <>
                  {tx(
                    "Already have an account?",
                    "ইতোমধ্যে অ্যাকাউন্ট আছে?"
                  )}

                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                  >
                    {tx("Login now", "এখনই লগইন করুন")}
                  </button>
                </>
              )}
            </div>

            <div className="auth-security-note">
              <ShieldCheck size={17} />

              <span>
                {tx(
                  "Your account information is protected.",
                  "আপনার অ্যাকাউন্টের তথ্য সুরক্ষিত রাখা হয়।"
                )}
              </span>
            </div>

            <div className="auth-bottom-decoration">
              <CloudSun size={18} />

              <span>
                {tx(
                  "Technology for a better farming future.",
                  "উন্নত কৃষি ভবিষ্যতের জন্য প্রযুক্তি।"
                )}
              </span>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

export default AuthPage;
