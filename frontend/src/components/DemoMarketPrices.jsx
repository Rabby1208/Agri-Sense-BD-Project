
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  TrendingUp,
  Search,
  RefreshCw,
  MapPin,
  Clock,
  Info,
  ShoppingBasket,
} from "lucide-react";

const DEMO_PRICES = [
  { id: 1, crop: "Rice", bangla: "চাল", variety: "Miniket", price: 68, unit: "kg", district: "Dhaka", market: "Karwan Bazar" },
  { id: 2, crop: "Rice", bangla: "ধান", variety: "Aman Paddy", price: 32, unit: "kg", district: "Bogura", market: "Mahasthan Bazar" },
  { id: 3, crop: "Potato", bangla: "আলু", variety: "Local Potato", price: 35, unit: "kg", district: "Bogura", market: "Bogura Sadar" },
  { id: 4, crop: "Tomato", bangla: "টমেটো", variety: "Fresh Tomato", price: 50, unit: "kg", district: "Dhaka", market: "Karwan Bazar" },
  { id: 5, crop: "Onion", bangla: "পেঁয়াজ", variety: "Local Onion", price: 90, unit: "kg", district: "Savar", market: "Savar Bazar" },
  { id: 6, crop: "Chilli", bangla: "মরিচ", variety: "Green Chilli", price: 110, unit: "kg", district: "Bogura", market: "Bogura Sadar" },
  { id: 7, crop: "Eggplant", bangla: "বেগুন", variety: "Fresh Eggplant", price: 45, unit: "kg", district: "Dhaka", market: "Jatrabari Bazar" },
  { id: 8, crop: "Cauliflower", bangla: "ফুলকপি", variety: "Fresh Cauliflower", price: 40, unit: "piece", district: "Savar", market: "Savar Bazar" },
  { id: 9, crop: "Cabbage", bangla: "বাঁধাকপি", variety: "Fresh Cabbage", price: 35, unit: "piece", district: "Bogura", market: "Mahasthan Bazar" },
  { id: 10, crop: "Garlic", bangla: "রসুন", variety: "Local Garlic", price: 160, unit: "kg", district: "Dhaka", market: "Karwan Bazar" },
];

const DISTRICT_BN = {
  Dhaka: "ঢাকা",
  Bogura: "বগুড়া",
  Savar: "সাভার",
};

const MARKET_BN = {
  "Karwan Bazar": "কারওয়ান বাজার",
  "Mahasthan Bazar": "মহাস্থান বাজার",
  "Bogura Sadar": "বগুড়া সদর",
  "Savar Bazar": "সাভার বাজার",
  "Jatrabari Bazar": "যাত্রাবাড়ী বাজার",
};

const VARIETY_BN = {
  Miniket: "মিনিকেট",
  "Aman Paddy": "আমন ধান",
  "Local Potato": "দেশি আলু",
  "Fresh Tomato": "তাজা টমেটো",
  "Local Onion": "দেশি পেঁয়াজ",
  "Green Chilli": "কাঁচা মরিচ",
  "Fresh Eggplant": "তাজা বেগুন",
  "Fresh Cauliflower": "তাজা ফুলকপি",
  "Fresh Cabbage": "তাজা বাঁধাকপি",
  "Local Garlic": "দেশি রসুন",
};

function DemoMarketPrices() {
  const { i18n } = useTranslation();

  const isBangla = i18n.language?.startsWith("bn");

  const tx = (english, bangla) =>
    isBangla ? bangla : english;

  const [prices, setPrices] = useState(DEMO_PRICES);
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("All");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const refreshPrices = () => {
    // Demo data is reloaded; no real market price is fetched.
    setPrices([...DEMO_PRICES]);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    const interval = setInterval(refreshPrices, 15000);
    return () => clearInterval(interval);
  }, []);

  const districts = useMemo(
    () => ["All", ...new Set(DEMO_PRICES.map((item) => item.district))],
    []
  );

  const filteredPrices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return prices.filter((item) => {
      const matchesSearch =
        !query ||
        item.crop.toLowerCase().includes(query) ||
        item.bangla.includes(query) ||
        item.variety.toLowerCase().includes(query) ||
        item.market.toLowerCase().includes(query) ||
        item.district.toLowerCase().includes(query);

      const matchesDistrict =
        district === "All" || item.district === district;

      return matchesSearch && matchesDistrict;
    });
  }, [prices, search, district]);

  const getDistrictName = (name) =>
    isBangla ? DISTRICT_BN[name] || name : name;

  const getMarketName = (name) =>
    isBangla ? MARKET_BN[name] || name : name;

  const getVarietyName = (name) =>
    isBangla ? VARIETY_BN[name] || name : name;

  return (
    <section
      className="section"
      id="market-prices"
      style={{ background: "#f7faf7" }}
    >
      <div className="section-heading">
        <span className="section-tag">
          {tx(
            "AGRICULTURAL MARKET INFORMATION",
            "কৃষি বাজারের তথ্য"
          )}
        </span>

        <h2>
          {tx(
            "Market Price Overview",
            "বাজারদরের সংক্ষিপ্ত বিবরণ"
          )}
        </h2>

        <p>
          {tx(
            "Explore sample agricultural prices from selected Bangladesh markets.",
            "বাংলাদেশের নির্বাচিত বাজারের নমুনা কৃষিপণ্যের দাম দেখুন।"
          )}
        </p>
      </div>

      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "20px",
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 5px 25px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "18px",
          }}
        >
          <div>
            <h3 style={{ margin: "0 0 6px" }}>
              <TrendingUp
                size={21}
                style={{
                  verticalAlign: "middle",
                  marginRight: "7px",
                }}
              />
              {tx("Sample Crop Prices", "নমুনা ফসলের দাম")}
            </h3>

            <small style={{ color: "#64748b" }}>
              <Clock
                size={13}
                style={{ verticalAlign: "middle" }}
              />
              {" "}
              {tx("Last refreshed: ", "সর্বশেষ আপডেট: ")}
              {lastUpdated.toLocaleTimeString(
                isBangla ? "bn-BD" : "en-BD"
              )}
            </small>
          </div>

          <button
            type="button"
            className="btn-outline"
            onClick={refreshPrices}
          >
            <RefreshCw size={17} />
            {tx("Refresh Demo", "ডেমো রিফ্রেশ")}
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              flex: "1",
              minWidth: "200px",
              position: "relative",
            }}
          >
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748b",
              }}
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={tx(
                "Search crop, variety or market...",
                "ফসল, জাত অথবা বাজার খুঁজুন..."
              )}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px 12px 12px 40px",
                border: "1px solid #d1d5db",
                borderRadius: "9px",
              }}
            />
          </div>

          <select
            value={district}
            onChange={(event) => setDistrict(event.target.value)}
            aria-label={tx("Filter by district", "জেলা অনুযায়ী বাছাই করুন")}
            style={{
              minWidth: "160px",
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "9px",
            }}
          >
            {districts.map((item) => (
              <option key={item} value={item}>
                {item === "All"
                  ? tx("All Districts", "সকল জেলা")
                  : getDistrictName(item)}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px",
          }}
        >
          {filteredPrices.map((item) => (
            <article
              key={item.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "17px",
                background: "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "28px" }}>
                  <ShoppingBasket size={25} color="#16834a" />
                </span>

                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#92400e",
                    background: "#fef3c7",
                    padding: "5px 8px",
                    borderRadius: "20px",
                  }}
                >
                  {tx("DEMO", "নমুনা")}
                </span>
              </div>

              <h3 style={{ margin: "12px 0 3px" }}>
                {item.crop} ({item.bangla})
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                {getVarietyName(item.variety)}
              </p>

              <div style={{ margin: "15px 0" }}>
                <strong
                  style={{ fontSize: "27px", color: "#16834a" }}
                >
                  ৳{item.price}
                </strong>

                <span style={{ color: "#64748b" }}>
                  {" "}/ {tx(
                    item.unit,
                    item.unit === "kg" ? "কেজি" : "টি"
                  )}
                </span>
              </div>

              <div
                style={{
                  color: "#64748b",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <MapPin size={15} />
                {getMarketName(item.market)},{" "}
                {getDistrictName(item.district)}
              </div>
            </article>
          ))}
        </div>

        {filteredPrices.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "30px",
              color: "#64748b",
            }}
          >
            <Search size={30} />
            <p>
              {tx(
                "No matching demo prices found.",
                "মিলযুক্ত কোনো নমুনা দাম পাওয়া যায়নি।"
              )}
            </p>
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "flex-start",
            marginTop: "22px",
            padding: "14px",
            background: "#fff8e7",
            color: "#755414",
            borderRadius: "9px",
            fontSize: "13px",
          }}
        >
          <Info size={19} />

          <span>
            <strong>
              {tx(
                "DEMO DATA — NOT REAL MARKET PRICE.",
                "নমুনা তথ্য — এটি প্রকৃত বাজারদর নয়।"
              )}
            </strong>
            {" "}
            {tx(
              "These sample prices are for project demonstration only. They are not collected from live markets and should not be used for buying or selling decisions.",
              "এই নমুনা দাম শুধুমাত্র প্রকল্প প্রদর্শনের জন্য। এগুলো সরাসরি বাজার থেকে সংগ্রহ করা হয়নি এবং কেনাবেচার সিদ্ধান্তে ব্যবহার করা উচিত নয়।"
            )}
          </span>
        </div>
      </div>
    </section>
  );
}

export default DemoMarketPrices;
