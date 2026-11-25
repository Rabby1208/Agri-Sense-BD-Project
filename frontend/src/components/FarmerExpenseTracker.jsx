import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Wallet,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  RefreshCw,
  LoaderCircle,
  AlertCircle,
  CheckCircle,
  CalendarDays,
  Sprout,
  Store,
  Banknote,
  ClipboardList,
} from "lucide-react";

import {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} from "../services/farmingExpenseApi";

import { getMyCrops } from "../services/farmerApi";

import "./FarmerExpenseTracker.css";

const createInitialForm = () => ({
  expense_name: "",
  vendor_name: "",
  farmer_crop_id: "",
  amount: "",
  expense_date: new Date().toLocaleDateString("en-CA"),
  description: "",
});

const cropTranslations = {
  rice: "ধান",
  paddy: "ধান",
  "boro rice": "বোরো ধান",
  "aman rice": "আমন ধান",
  "aus rice": "আউশ ধান",
  wheat: "গম",
  tomato: "টমেটো",
  potato: "আলু",
  onion: "পেঁয়াজ",
  garlic: "রসুন",
  brinjal: "বেগুন",
  eggplant: "বেগুন",
  chili: "মরিচ",
  chilli: "মরিচ",
  maize: "ভুট্টা",
  corn: "ভুট্টা",
  mustard: "সরিষা",
  cucumber: "শসা",
  pumpkin: "মিষ্টি কুমড়া",
  "bitter gourd": "করলা",
  "bottle gourd": "লাউ",
  "snake gourd": "চিচিঙ্গা",
  cabbage: "বাঁধাকপি",
  cauliflower: "ফুলকপি",
  carrot: "গাজর",
  radish: "মূলা",
  spinach: "পালং শাক",
  "red amaranth": "লাল শাক",
  okra: "ঢেঁড়স",
  "lady finger": "ঢেঁড়স",
  papaya: "পেঁপে",
  banana: "কলা",
  mango: "আম",
  jackfruit: "কাঁঠাল",
  guava: "পেয়ারা",
  lentil: "মসুর ডাল",
  "red lentil": "মসুর ডাল",
  chickpea: "ছোলা",
  mung: "মুগ ডাল",
  "mung bean": "মুগ ডাল",
  "black gram": "মাষকলাই",
  groundnut: "চিনাবাদাম",
  peanut: "চিনাবাদাম",
  sugarcane: "আখ",
  jute: "পাট",
  cotton: "তুলা",
  sunflower: "সূর্যমুখী",
  watermelon: "তরমুজ",
  lemon: "লেবু",
  coriander: "ধনিয়া",
  ginger: "আদা",
  turmeric: "হলুদ",
  sweetpotato: "মিষ্টি আলু",
  "sweet potato": "মিষ্টি আলু",
};

function extractArray(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.expenses)) return response.expenses;
  if (Array.isArray(response?.data?.expenses)) {
    return response.data.expenses;
  }
  if (Array.isArray(response?.crops)) return response.crops;
  if (Array.isArray(response?.data?.crops)) return response.data.crops;

  return [];
}

function getExpenseId(expense) {
  return expense?.id ?? expense?.expense_id;
}

function getCropId(crop) {
  return crop?.id ?? crop?.farmer_crop_id;
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    ""
  );
}

function FarmerExpenseTracker() {
  const { i18n } = useTranslation();
  const isBangla = i18n.language?.startsWith("bn");

  const L = (english, bangla) => (isBangla ? bangla : english);

  const [expenses, setExpenses] = useState([]);
  const [crops, setCrops] = useState([]);

  const [form, setForm] = useState(createInitialForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [cropError, setCropError] = useState("");
  const [success, setSuccess] = useState("");

  const translateCropName = (name) => {
    if (!name) return L("Crop", "ফসল");
    if (!isBangla) return name;

    const normalized = String(name).trim().toLowerCase();
    return cropTranslations[normalized] || name;
  };

  const formatMoney = (value) =>
    new Intl.NumberFormat(isBangla ? "bn-BD" : "en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 2,
    }).format(Number(value || 0));

  const formatNumber = (value) =>
    Number(value || 0).toLocaleString(isBangla ? "bn-BD" : "en-BD");

  // YYYY-MM-DD date-কে local date হিসেবে format করা হচ্ছে,
  // যাতে timezone-এর কারণে এক দিন কম বা বেশি না দেখায়।
  const formatDate = (value) => {
    if (!value) return L("Not available", "পাওয়া যায়নি");

    const dateString = String(value).slice(0, 10);
    const parts = dateString.split("-");

    let date;

    if (
      parts.length === 3 &&
      parts.every((part) => /^\d+$/.test(part))
    ) {
      const [year, month, day] = parts.map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(value);
    }

    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString(isBangla ? "bn-BD" : "en-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const translateError = (message, fallback) => {
    if (!message) return fallback;
    if (!isBangla) return message;

    const translations = {
      "Unable to load farming expenses.":
        "কৃষি খরচের তথ্য লোড করা যায়নি।",
      "Please enter an expense name.": "খরচের নাম লিখুন।",
      "Please enter an amount greater than zero.":
        "শূন্যের বেশি টাকার পরিমাণ লিখুন।",
      "Please select an expense date.": "খরচের তারিখ নির্বাচন করুন।",
      "Please select the crop related to this expense.":
        "এই খরচের সঙ্গে সম্পর্কিত ফসল নির্বাচন করুন।",
      "Expense updated successfully.":
        "খরচের তথ্য সফলভাবে আপডেট হয়েছে।",
      "Expense added successfully.": "খরচ সফলভাবে যোগ হয়েছে।",
      "Unable to save expense.": "খরচ সংরক্ষণ করা যায়নি।",
      "Expense deleted successfully.":
        "খরচ সফলভাবে মুছে ফেলা হয়েছে।",
      "Unable to delete expense.": "খরচ মুছে ফেলা যায়নি।",
      "Network Error":
        "ইন্টারনেট সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
      "Request failed with status code 400":
        "প্রদত্ত তথ্য সঠিক নয়। তথ্য যাচাই করে আবার চেষ্টা করুন।",
      "Request failed with status code 401":
        "আপনার সেশন শেষ হয়েছে। আবার লগইন করুন।",
      "Request failed with status code 403":
        "এই কাজটি করার অনুমতি নেই।",
      "Request failed with status code 404":
        "অনুরোধ করা তথ্য পাওয়া যায়নি।",
      "Request failed with status code 500":
        "সার্ভারে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।",
    };

    return translations[message] || fallback;
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    setCropError("");

    const [expenseResult, cropResult] = await Promise.allSettled([
      getExpenses(),
      getMyCrops(),
    ]);

    if (expenseResult.status === "fulfilled") {
      setExpenses(extractArray(expenseResult.value));
    } else {
      setError(
        translateError(
          getErrorMessage(expenseResult.reason),
          L(
            "Unable to load farming expenses. Please try again.",
            "কৃষি খরচের তথ্য লোড করা যায়নি। আবার চেষ্টা করুন।"
          )
        )
      );
    }

    if (cropResult.status === "fulfilled") {
      setCrops(extractArray(cropResult.value));
    } else {
      setCrops([]);
      setCropError(
        L(
          "Crop information could not be loaded. Please refresh before adding an expense.",
          "ফসলের তথ্য লোড করা যায়নি। খরচ যোগ করার আগে রিফ্রেশ করুন।"
        )
      );
    }

    setLoading(false);
  }, [isBangla]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalExpense = useMemo(
    () =>
      expenses.reduce(
        (total, expense) => total + Number(expense.amount || 0),
        0
      ),
    [expenses]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(createInitialForm());
    setEditingId(null);
    setShowForm(false);
  };

  const handleOpenForm = () => {
    setForm(createInitialForm());
    setEditingId(null);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const handleEdit = (expense) => {
    setForm({
      expense_name: expense.expense_name || "",
      vendor_name: expense.vendor_name || "",
      farmer_crop_id:
        expense.farmer_crop_id ?? expense.crop_id ?? "",
      amount: expense.amount ?? "",
      expense_date: expense.expense_date
        ? String(expense.expense_date).slice(0, 10)
        : "",
      description: expense.description || "",
    });

    setEditingId(getExpenseId(expense));
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    setError("");
    setSuccess("");

    if (!form.expense_name.trim()) {
      setError(L("Please enter an expense name.", "খরচের নাম লিখুন।"));
      return;
    }

    if (
      !form.amount ||
      !Number.isFinite(Number(form.amount)) ||
      Number(form.amount) <= 0
    ) {
      setError(
        L(
          "Please enter an amount greater than zero.",
          "শূন্যের বেশি টাকার পরিমাণ লিখুন।"
        )
      );
      return;
    }

    if (!form.expense_date) {
      setError(
        L("Please select an expense date.", "খরচের তারিখ নির্বাচন করুন।")
      );
      return;
    }

    if (!form.farmer_crop_id) {
      setError(
        L(
          "Please select the crop related to this expense.",
          "এই খরচের সঙ্গে সম্পর্কিত ফসল নির্বাচন করুন।"
        )
      );
      return;
    }

    const payload = {
      expense_name: form.expense_name.trim(),
      vendor_name: form.vendor_name.trim() || null,
      farmer_crop_id: Number(form.farmer_crop_id),
      amount: Number(form.amount),
      expense_date: form.expense_date,
      description: form.description.trim() || null,
    };

    setSaving(true);

    try {
      if (editingId !== null) {
        await updateExpense(editingId, payload);
        setSuccess(
          L(
            "Expense updated successfully.",
            "খরচের তথ্য সফলভাবে আপডেট হয়েছে।"
          )
        );
      } else {
        await addExpense(payload);
        setSuccess(
          L("Expense added successfully.", "খরচ সফলভাবে যোগ হয়েছে।")
        );
      }

      resetForm();
      await loadData();
    } catch (requestError) {
      setError(
        translateError(
          getErrorMessage(requestError),
          L(
            "Unable to save expense. Please try again.",
            "খরচ সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।"
          )
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (expenseId) => {
    if (expenseId === undefined || expenseId === null) return;

    const confirmed = window.confirm(
      L(
        "Are you sure you want to delete this expense?",
        "আপনি কি এই খরচটি মুছে ফেলতে চান?"
      )
    );

    if (!confirmed) return;

    setDeletingId(expenseId);
    setError("");
    setSuccess("");

    try {
      await deleteExpense(expenseId);

      setSuccess(
        L(
          "Expense deleted successfully.",
          "খরচ সফলভাবে মুছে ফেলা হয়েছে।"
        )
      );

      await loadData();
    } catch (requestError) {
      setError(
        translateError(
          getErrorMessage(requestError),
          L(
            "Unable to delete expense. Please try again.",
            "খরচ মুছে ফেলা যায়নি। আবার চেষ্টা করুন।"
          )
        )
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getCropName = (expense) => {
    const cropId = expense.farmer_crop_id ?? expense.crop_id;

    const crop = crops.find(
      (item) => String(getCropId(item)) === String(cropId)
    );

    const name =
      expense.crop_name ||
      crop?.crop_name ||
      crop?.name ||
      crop?.crop ||
      "Crop";

    return translateCropName(name);
  };

  const getCropOptionLabel = (crop) => {
    const name = translateCropName(
      crop.crop_name || crop.name || crop.crop || "Crop"
    );

    const extraInfo =
      crop.variety ||
      crop.crop_variety ||
      crop.season ||
      "";

    return extraInfo ? `${name} (${extraInfo})` : name;
  };

  return (
    <section className="expense-tracker">
      <div className="expense-header">
        <div className="expense-heading">
          <div className="expense-heading-icon">
            <Wallet size={24} />
          </div>

          <div className="expense-heading-content">
            <h2>{L("Farming Expense Tracker", "কৃষি খরচের হিসাব")}</h2>
            <p>
              {L(
                "Track and manage your farming expenses.",
                "আপনার কৃষি খরচের হিসাব রাখুন ও পরিচালনা করুন।"
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="expense-add-button"
          onClick={showForm ? resetForm : handleOpenForm}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm
            ? L("Close Form", "ফর্ম বন্ধ করুন")
            : L("Add Expense", "খরচ যোগ করুন")}
        </button>
      </div>

      {error && (
        <div
          className="expense-alert expense-alert-error"
          role="alert"
        >
          <AlertCircle size={18} />
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            type="button"
            aria-label={L("Close alert", "বার্তা বন্ধ করুন")}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div
          className="expense-alert expense-alert-success"
          role="status"
        >
          <CheckCircle size={18} />
          <span>{success}</span>
          <button
            onClick={() => setSuccess("")}
            type="button"
            aria-label={L("Close alert", "বার্তা বন্ধ করুন")}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {cropError && (
        <div className="expense-alert expense-alert-warning" role="alert">
          <AlertCircle size={18} />
          <span>{cropError}</span>
          <button
            type="button"
            onClick={() => setCropError("")}
            aria-label={L("Close alert", "বার্তা বন্ধ করুন")}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="expense-summary-grid">
        <div className="expense-summary-card">
          <div className="expense-summary-icon">
            <Banknote size={23} />
          </div>

          <div className="expense-summary-content">
            <span>{L("Total Farming Expenses", "মোট কৃষি খরচ")}</span>
            <strong>{formatMoney(totalExpense)}</strong>
          </div>
        </div>

        <div className="expense-summary-card">
          <div className="expense-summary-icon expense-record-icon">
            <ClipboardList size={23} />
          </div>

          <div className="expense-summary-content">
            <span>{L("Total Records", "মোট রেকর্ড")}</span>
            <strong>{formatNumber(expenses.length)}</strong>
          </div>
        </div>
      </div>

      {showForm && (
        <form className="expense-form" onSubmit={handleSubmit}>
          <div className="expense-form-heading">
            <div>
              <h3>
                {editingId !== null
                  ? L("Edit Expense", "খরচ সম্পাদনা")
                  : L("Add New Expense", "নতুন খরচ যোগ করুন")}
              </h3>
              <p>
                {L(
                  "Enter the expense details below.",
                  "নিচে খরচের বিস্তারিত তথ্য লিখুন।"
                )}
              </p>
            </div>

            <button
              type="button"
              className="expense-close-button"
              onClick={resetForm}
              aria-label={L("Close form", "ফর্ম বন্ধ করুন")}
              disabled={saving}
            >
              <X size={19} />
            </button>
          </div>

          <div className="expense-form-grid">
            <div className="expense-field">
              <label htmlFor="expense_name">
                {L("Expense Name *", "খরচের নাম *")}
              </label>
              <input
                id="expense_name"
                name="expense_name"
                type="text"
                placeholder={L(
                  "e.g. Fertilizer, Seeds, Labour",
                  "যেমন: সার, বীজ, শ্রমিকের খরচ"
                )}
                value={form.expense_name}
                onChange={handleChange}
                maxLength={150}
                required
                disabled={saving}
              />
            </div>

            <div className="expense-field">
              <label htmlFor="vendor_name">
                {L("Vendor / Shop", "বিক্রেতা / দোকান")}
              </label>
              <input
                id="vendor_name"
                name="vendor_name"
                type="text"
                placeholder={L(
                  "Shop or vendor name",
                  "দোকান বা বিক্রেতার নাম"
                )}
                value={form.vendor_name}
                onChange={handleChange}
                maxLength={150}
                disabled={saving}
              />
            </div>

            <div className="expense-field">
              <label htmlFor="farmer_crop_id">
                {L("Related Crop *", "সংশ্লিষ্ট ফসল *")}
              </label>
              <select
                id="farmer_crop_id"
                name="farmer_crop_id"
                value={form.farmer_crop_id}
                onChange={handleChange}
                required
                disabled={saving || crops.length === 0}
              >
                <option value="">
                  {crops.length === 0
                    ? L("No crops available", "কোনো ফসল পাওয়া যায়নি")
                    : L("Select a crop", "একটি ফসল নির্বাচন করুন")}
                </option>

                {crops.map((crop, index) => {
                  const cropId = getCropId(crop);

                  return (
                    <option
                      key={cropId ?? index}
                      value={cropId ?? ""}
                      disabled={cropId === undefined}
                    >
                      {getCropOptionLabel(crop)}
                      {cropId !== undefined ? ` (#${cropId})` : ""}
                    </option>
                  );
                })}
              </select>

              {crops.length === 0 && (
                <small className="expense-field-hint">
                  {L(
                    "Add a crop to your farm before recording an expense.",
                    "খরচের হিসাব যোগ করার আগে আপনার খামারে একটি ফসল যোগ করুন।"
                  )}
                </small>
              )}
            </div>

            <div className="expense-field">
              <label htmlFor="amount">
                {L("Amount (BDT) *", "টাকার পরিমাণ (BDT) *")}
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder={L("Enter amount", "টাকার পরিমাণ লিখুন")}
                value={form.amount}
                onChange={handleChange}
                required
                disabled={saving}
              />
            </div>

            <div className="expense-field">
              <label htmlFor="expense_date">
                {L("Expense Date *", "খরচের তারিখ *")}
              </label>
              <input
                id="expense_date"
                name="expense_date"
                type="date"
                value={form.expense_date}
                onChange={handleChange}
                required
                disabled={saving}
              />
            </div>

            <div className="expense-field expense-field-full">
              <label htmlFor="description">
                {L("Description", "বিবরণ")}
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                placeholder={L(
                  "Additional details about this expense...",
                  "এই খরচ সম্পর্কে অতিরিক্ত তথ্য লিখুন..."
                )}
                value={form.description}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
          </div>

          <div className="expense-form-actions">
            <button
              type="submit"
              className="expense-save-button"
              disabled={saving || crops.length === 0}
            >
              {saving ? (
                <LoaderCircle className="expense-spin" size={18} />
              ) : (
                <Save size={18} />
              )}

              {saving
                ? L("Saving...", "সংরক্ষণ হচ্ছে...")
                : editingId !== null
                  ? L("Update Expense", "খরচ আপডেট করুন")
                  : L("Save Expense", "খরচ সংরক্ষণ করুন")}
            </button>

            <button
              type="button"
              className="expense-cancel-button"
              onClick={resetForm}
              disabled={saving}
            >
              {L("Cancel", "বাতিল")}
            </button>
          </div>
        </form>
      )}

      <div className="expense-list-heading">
        <div className="expense-list-heading-content">
          <h3>{L("Expense History", "খরচের ইতিহাস")}</h3>
          <p>
            {L(
              "All your recorded farming expenses",
              "আপনার নথিভুক্ত সব কৃষি খরচ"
            )}
          </p>
        </div>

        <button
          type="button"
          className="expense-refresh-button"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? "expense-spin" : ""}
          />
          {L("Refresh", "রিফ্রেশ")}
        </button>
      </div>

      {loading ? (
        <div className="expense-loading">
          <LoaderCircle className="expense-spin" size={30} />
          <span>{L("Loading expenses...", "খরচের তথ্য লোড হচ্ছে...")}</span>
        </div>
      ) : expenses.length === 0 ? (
        <div className="expense-empty">
          <div className="expense-empty-icon">
            <Wallet size={42} />
          </div>
          <h3>{L("No Expenses Recorded", "কোনো খরচের তথ্য নেই")}</h3>
          <p>
            {L(
              "Your farming expenses will appear here after you add your first record.",
              "প্রথম খরচের তথ্য যোগ করার পর আপনার কৃষি খরচ এখানে দেখা যাবে।"
            )}
          </p>

          <button
            type="button"
            className="expense-add-button"
            onClick={handleOpenForm}
          >
            <Plus size={18} />
            {L("Add First Expense", "প্রথম খরচ যোগ করুন")}
          </button>
        </div>
      ) : (
        <div className="expense-table-wrapper">
          <table className="expense-table">
            <thead>
              <tr>
                <th>{L("Expense", "খরচ")}</th>
                <th>{L("Crop", "ফসল")}</th>
                <th>{L("Vendor", "বিক্রেতা")}</th>
                <th>{L("Date", "তারিখ")}</th>
                <th>{L("Amount", "পরিমাণ")}</th>
                <th>{L("Actions", "কার্যক্রম")}</th>
              </tr>
            </thead>

            <tbody>
              {expenses.map((expense, index) => {
                const expenseId = getExpenseId(expense);

                return (
                  <tr key={expenseId ?? index}>
                    <td>
                      <div className="expense-name-cell">
                        <span className="expense-row-icon">
                          <Wallet size={17} />
                        </span>

                        <div className="expense-name-content">
                          <strong>{expense.expense_name}</strong>
                          {expense.description && (
                            <small title={expense.description}>
                              {expense.description}
                            </small>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="expense-crop-label">
                        <Sprout size={14} />
                        {getCropName(expense)}
                      </span>
                    </td>

                    <td>
                      <span className="expense-vendor-label">
                        <Store size={14} />
                        {expense.vendor_name || "—"}
                      </span>
                    </td>

                    <td>
                      <span className="expense-date-label">
                        <CalendarDays size={14} />
                        {formatDate(expense.expense_date)}
                      </span>
                    </td>

                    <td>
                      <strong className="expense-amount">
                        {formatMoney(expense.amount)}
                      </strong>
                    </td>

                    <td>
                      <div className="expense-action-buttons">
                        <button
                          type="button"
                          className="expense-edit-button"
                          title={L("Edit expense", "খরচ সম্পাদনা")}
                          aria-label={L("Edit expense", "খরচ সম্পাদনা")}
                          disabled={
                            expenseId === undefined ||
                            deletingId === expenseId
                          }
                          onClick={() => handleEdit(expense)}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          className="expense-delete-button"
                          title={L("Delete expense", "খরচ মুছে ফেলুন")}
                          aria-label={L("Delete expense", "খরচ মুছে ফেলুন")}
                          disabled={
                            deletingId === expenseId ||
                            expenseId === undefined
                          }
                          onClick={() => handleDelete(expenseId)}
                        >
                          {deletingId === expenseId ? (
                            <LoaderCircle
                              className="expense-spin"
                              size={16}
                            />
                          ) : (
                            <Trash2 size={16} />
                          )}
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
    </section>
  );
}

export default FarmerExpenseTracker;