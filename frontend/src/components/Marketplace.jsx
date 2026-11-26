
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Search,
  RefreshCw,
  MapPin,
  Package,
  ShoppingBasket,
  Leaf,
  AlertCircle,
  LoaderCircle,
  SlidersHorizontal
} from "lucide-react";

import "./Marketplace.css";

const API_URL = (import.meta.env.VITE_BACKEND_API_URL || "http://127.0.0.1:5000/api").replace(/\/$/, "");

const cropTranslations = {
  rice: "à¦§à¦¾à¦¨",
  paddy: "à¦§à¦¾à¦¨",
  "boro rice": "à¦¬à§‹à¦°à§‹ à¦§à¦¾à¦¨",
  "aman rice": "à¦†à¦®à¦¨ à¦§à¦¾à¦¨",
  "aus rice": "à¦†à¦‰à¦¶ à¦§à¦¾à¦¨",
  wheat: "à¦—à¦®",
  tomato: "à¦Ÿà¦®à§‡à¦Ÿà§‹",
  potato: "à¦†à¦²à§",
  onion: "à¦ªà§‡à¦à¦¯à¦¼à¦¾à¦œ",
  garlic: "à¦°à¦¸à§à¦¨",
  brinjal: "à¦¬à§‡à¦—à§à¦¨",
  eggplant: "à¦¬à§‡à¦—à§à¦¨",
  chili: "à¦®à¦°à¦¿à¦š",
  chilli: "à¦®à¦°à¦¿à¦š",
  maize: "à¦­à§à¦Ÿà§à¦Ÿà¦¾",
  corn: "à¦­à§à¦Ÿà§à¦Ÿà¦¾",
  mustard: "à¦¸à¦°à¦¿à¦·à¦¾",
  cucumber: "à¦¶à¦¸à¦¾",
  pumpkin: "à¦®à¦¿à¦·à§à¦Ÿà¦¿ à¦•à§à¦®à¦¡à¦¼à¦¾",
  "bitter gourd": "à¦•à¦°à¦²à¦¾",
  "bottle gourd": "à¦²à¦¾à¦‰",
  "snake gourd": "à¦šà¦¿à¦šà¦¿à¦™à§à¦—à¦¾",
  cabbage: "à¦¬à¦¾à¦à¦§à¦¾à¦•à¦ªà¦¿",
  cauliflower: "à¦«à§à¦²à¦•à¦ªà¦¿",
  carrot: "à¦—à¦¾à¦œà¦°",
  radish: "à¦®à§‚à¦²à¦¾",
  spinach: "à¦ªà¦¾à¦²à¦‚ à¦¶à¦¾à¦•",
  "red amaranth": "à¦²à¦¾à¦² à¦¶à¦¾à¦•",
  okra: "à¦¢à§‡à¦à¦¡à¦¼à¦¸",
  "lady finger": "à¦¢à§‡à¦à¦¡à¦¼à¦¸",
  papaya: "à¦ªà§‡à¦à¦ªà§‡",
  banana: "à¦•à¦²à¦¾",
  mango: "à¦†à¦®",
  jackfruit: "à¦•à¦¾à¦à¦ à¦¾à¦²",
  guava: "à¦ªà§‡à¦¯à¦¼à¦¾à¦°à¦¾",
  lentil: "à¦®à¦¸à§à¦° à¦¡à¦¾à¦²",
  "red lentil": "à¦®à¦¸à§à¦° à¦¡à¦¾à¦²",
  chickpea: "à¦›à§‹à¦²à¦¾",
  mung: "à¦®à§à¦— à¦¡à¦¾à¦²",
  "mung bean": "à¦®à§à¦— à¦¡à¦¾à¦²",
  "black gram": "à¦®à¦¾à¦·à¦•à¦²à¦¾à¦‡",
  groundnut: "à¦šà¦¿à¦¨à¦¾à¦¬à¦¾à¦¦à¦¾à¦®",
  peanut: "à¦šà¦¿à¦¨à¦¾à¦¬à¦¾à¦¦à¦¾à¦®",
  sugarcane: "à¦†à¦–",
  jute: "à¦ªà¦¾à¦Ÿ",
  cotton: "à¦¤à§à¦²à¦¾",
  sunflower: "à¦¸à§‚à¦°à§à¦¯à¦®à§à¦–à§€",
  watermelon: "à¦¤à¦°à¦®à§à¦œ",
  lemon: "à¦²à§‡à¦¬à§",
  coriander: "à¦§à¦¨à¦¿à¦¯à¦¼à¦¾",
  ginger: "à¦†à¦¦à¦¾",
  turmeric: "à¦¹à¦²à§à¦¦",
  sweetpotato: "à¦®à¦¿à¦·à§à¦Ÿà¦¿ à¦†à¦²à§",
  "sweet potato": "à¦®à¦¿à¦·à§à¦Ÿà¦¿ à¦†à¦²à§"
};

function Marketplace() {
  const { i18n } = useTranslation();

  const isBangla = i18n.language?.startsWith("bn");

  const tx = (english, bangla) => {
    return isBangla ? bangla : english;
  };

  const translateCropName = (name) => {
    if (!name) {
      return tx("Unnamed Crop", "à¦¨à¦¾à¦®à¦¹à§€à¦¨ à¦«à¦¸à¦²");
    }

    if (!isBangla) {
      return name;
    }

    const normalized = String(name).trim().toLowerCase();

    return cropTranslations[normalized] || name;
  };

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");

  const fetchListings = async (
    searchValue = search,
    districtValue = district
  ) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (searchValue.trim()) {
        params.append("search", searchValue.trim());
      }

      if (districtValue.trim()) {
        params.append("district", districtValue.trim());
      }

      const query = params.toString();

      const response = await fetch(
        `${API_URL}/marketplace${query ? `?${query}` : ""}`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load marketplace listings."
        );
      }

      setListings(
        Array.isArray(result.listings) ? result.listings : []
      );
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings("", "");
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchListings(search, district);
  };

  const handleReset = () => {
    setSearch("");
    setDistrict("");
    fetchListings("", "");
  };

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString(
      isBangla ? "bn-BD" : "en-BD"
    );
  };

  const formatQuantity = (quantity) => {
    return Number(quantity || 0).toLocaleString(
      isBangla ? "bn-BD" : "en-BD"
    );
  };

  return (
    <section className="marketplace-page" id="marketplace">
      <div className="marketplace-container">

        {/* HEADER */}
        <div className="marketplace-header">
          <div className="marketplace-heading-content">
            <span className="marketplace-eyebrow">
              <Leaf size={15} />
              AGRISENSE BD MARKETPLACE
            </span>

            <h2>
              {tx(
                "Farmer's Crop Marketplace",
                "à¦•à§ƒà¦·à¦•à§‡à¦° à¦«à¦¸à¦²à§‡à¦° à¦¬à¦¾à¦œà¦¾à¦°"
              )}
            </h2>

            <p>
              {tx(
                "Explore available agricultural products and discover crop prices from farmers.",
                "à¦¬à¦¿à¦­à¦¿à¦¨à§à¦¨ à¦•à§ƒà¦·à¦¿à¦ªà¦£à§à¦¯ à¦¦à§‡à¦–à§à¦¨ à¦à¦¬à¦‚ à¦•à§ƒà¦·à¦•à¦¦à§‡à¦° à¦•à¦¾à¦› à¦¥à§‡à¦•à§‡ à¦«à¦¸à¦²à§‡à¦° à¦¬à¦¾à¦œà¦¾à¦°à¦¦à¦° à¦œà¦¾à¦¨à§à¦¨à¥¤"
              )}
            </p>
          </div>

          <div className="marketplace-count-card">
            <div className="marketplace-count-icon">
              <ShoppingBasket size={24} />
            </div>

            <div>
              <strong>{formatQuantity(listings.length)}</strong>
              <span>
                {tx("Available Listings", "à¦‰à¦ªà¦²à¦¬à§à¦§ à¦ªà¦£à§à¦¯")}
              </span>
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <form
          className="marketplace-search-form"
          onSubmit={handleSearch}
        >
          <div className="marketplace-input-group">
            <Search size={19} />

            <input
              type="text"
              placeholder={tx(
                "Search crop name...",
                "à¦«à¦¸à¦²à§‡à¦° à¦¨à¦¾à¦® à¦²à¦¿à¦–à§à¦¨..."
              )}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="marketplace-input-group">
            <MapPin size={19} />

            <input
              type="text"
              placeholder={tx(
                "Search district...",
                "à¦œà§‡à¦²à¦¾à¦° à¦¨à¦¾à¦® à¦²à¦¿à¦–à§à¦¨..."
              )}
              value={district}
              onChange={(event) => setDistrict(event.target.value)}
            />
          </div>

          <button
            type="submit"
            className="marketplace-search-button"
            disabled={loading}
          >
            <Search size={17} />
            {tx("Search", "à¦–à§à¦à¦œà§à¦¨")}
          </button>

          <button
            type="button"
            className="marketplace-reset-button"
            onClick={handleReset}
            disabled={loading}
          >
            <RefreshCw size={17} />
            {tx("Reset", "à¦°à¦¿à¦¸à§‡à¦Ÿ")}
          </button>
        </form>

        {/* LISTING HEADING */}
        <div className="marketplace-listing-heading">
          <div>
            <span className="marketplace-section-label">
              <SlidersHorizontal size={15} />
              {tx("EXPLORE PRODUCTS", "à¦ªà¦£à§à¦¯ à¦¦à§‡à¦–à§à¦¨")}
            </span>

            <h3>
              {tx("Available Crops", "à¦‰à¦ªà¦²à¦¬à§à¦§ à¦«à¦¸à¦²")}
            </h3>
          </div>

          <button
            type="button"
            className="marketplace-refresh-button"
            onClick={() => fetchListings()}
            disabled={loading}
            title={tx("Refresh listings", "à¦¤à¦¾à¦²à¦¿à¦•à¦¾ à¦°à¦¿à¦«à§à¦°à§‡à¦¶ à¦•à¦°à§à¦¨")}
          >
            <RefreshCw
              size={17}
              className={loading ? "marketplace-spin" : ""}
            />
            {tx("Refresh", "à¦°à¦¿à¦«à§à¦°à§‡à¦¶")}
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="marketplace-state">
            <LoaderCircle
              size={38}
              className="marketplace-spin"
            />

            <h3>
              {tx(
                "Loading marketplace...",
                "à¦¬à¦¾à¦œà¦¾à¦°à§‡à¦° à¦¤à¦¥à§à¦¯ à¦²à§‹à¦¡ à¦¹à¦šà§à¦›à§‡..."
              )}
            </h3>

            <p>
              {tx(
                "Please wait while we load available crop listings.",
                "à¦‰à¦ªà¦²à¦¬à§à¦§ à¦«à¦¸à¦²à§‡à¦° à¦¤à¦¾à¦²à¦¿à¦•à¦¾ à¦²à§‹à¦¡ à¦¹à¦“à§Ÿà¦¾ à¦ªà¦°à§à¦¯à¦¨à§à¦¤ à¦…à¦ªà§‡à¦•à§à¦·à¦¾ à¦•à¦°à§à¦¨à¥¤"
              )}
            </p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="marketplace-state marketplace-error">
            <AlertCircle size={38} />

            <h3>
              {tx(
                "Unable to load marketplace",
                "à¦¬à¦¾à¦œà¦¾à¦°à§‡à¦° à¦¤à¦¥à§à¦¯ à¦²à§‹à¦¡ à¦•à¦°à¦¾ à¦¯à¦¾à¦šà§à¦›à§‡ à¦¨à¦¾"
              )}
            </h3>

            <p>{error}</p>

            <button
              type="button"
              onClick={() => fetchListings()}
              className="marketplace-search-button"
            >
              <RefreshCw size={17} />
              {tx("Try Again", "à¦†à¦¬à¦¾à¦° à¦šà§‡à¦·à§à¦Ÿà¦¾ à¦•à¦°à§à¦¨")}
            </button>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && listings.length === 0 && (
          <div className="marketplace-state marketplace-empty">
            <div className="marketplace-empty-icon">
              <Package size={45} />
            </div>

            <h3>
              {tx(
                "No Crop Listings Available",
                "à¦•à§‹à¦¨à§‹ à¦«à¦¸à¦²à§‡à¦° à¦¤à¦¾à¦²à¦¿à¦•à¦¾ à¦ªà¦¾à¦“à§Ÿà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿"
              )}
            </h3>

            <p>
              {tx(
                "No active crop listings were found. Please check again later or try another search.",
                "à¦•à§‹à¦¨à§‹ à¦¸à¦•à§à¦°à¦¿à§Ÿ à¦«à¦¸à¦²à§‡à¦° à¦¤à¦¾à¦²à¦¿à¦•à¦¾ à¦ªà¦¾à¦“à§Ÿà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤ à¦ªà¦°à§‡ à¦†à¦¬à¦¾à¦° à¦šà§‡à¦·à§à¦Ÿà¦¾ à¦•à¦°à§à¦¨ à¦…à¦¥à¦¬à¦¾ à¦…à¦¨à§à¦¯ à¦•à¦¿à¦›à§ à¦–à§à¦à¦œà§à¦¨à¥¤"
              )}
            </p>

            <button
              type="button"
              className="marketplace-search-button"
              onClick={handleReset}
            >
              <RefreshCw size={17} />
              {tx("Show All Listings", "à¦¸à¦¬ à¦ªà¦£à§à¦¯ à¦¦à§‡à¦–à§à¦¨")}
            </button>
          </div>
        )}

        {/* LISTINGS */}
        {!loading && !error && listings.length > 0 && (
          <div className="marketplace-grid">
            {listings.map((item) => {
              const translatedCropName = translateCropName(
                item.crop_name
              );

              return (
                <article
                  className="marketplace-card"
                  key={item.id}
                >
                  <div className="marketplace-image-wrapper">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={translatedCropName}
                        className="marketplace-crop-image"
                        loading="lazy"
                      />
                    ) : (
                      <div className="marketplace-image-placeholder">
                        <span>ðŸŒ¾</span>
                      </div>
                    )}

                    <span className="marketplace-available-badge">
                      {tx("Available", "à¦‰à¦ªà¦²à¦¬à§à¦§")}
                    </span>
                  </div>

                  <div className="marketplace-card-body">
                    <h3>{translatedCropName}</h3>

                    <div className="marketplace-price">
                      <strong>
                        à§³{formatPrice(item.price_per_unit)}
                      </strong>

                      <span>
                        / {item.unit || "KG"}
                      </span>
                    </div>

                    <div className="marketplace-info-row">
                      <Package size={17} />

                      <span>
                        {tx(
                          "Available quantity:",
                          "à¦‰à¦ªà¦²à¦¬à§à¦§ à¦ªà¦°à¦¿à¦®à¦¾à¦£:"
                        )}{" "}
                        <strong>
                          {formatQuantity(
                            item.available_quantity ?? item.quantity ?? 0
                          )}{" "}
                          {item.unit || "KG"}
                        </strong>
                      </span>
                    </div>

                    <div className="marketplace-info-row">
                      <MapPin size={17} />

                      <span>
                        {[
                          item.upazila,
                          item.district
                        ].filter(Boolean).join(", ") ||
                          item.location ||
                          tx(
                            "Location not specified",
                            "à¦ à¦¿à¦•à¦¾à¦¨à¦¾ à¦‰à¦²à§à¦²à§‡à¦– à¦•à¦°à¦¾ à¦¹à§Ÿà¦¨à¦¿"
                          )}
                      </span>
                    </div>

                    {item.description && (
                      <p className="marketplace-description">
                        {item.description}
                      </p>
                    )}

                    <div className="marketplace-card-footer">
                      <span>
                        <Leaf size={15} />
                        AgriSense BD
                      </span>

                      <span className="marketplace-view-label">
                        {tx("Public Listing", "à¦¸à¦°à§à¦¬à¦¸à¦¾à¦§à¦¾à¦°à¦£à§‡à¦° à¦¤à¦¾à¦²à¦¿à¦•à¦¾")}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* GUEST INFORMATION */}
        <div className="marketplace-guest-note">
          <Leaf size={21} />

          <div>
            <strong>
              {tx(
                "Welcome to AgriSense BD Marketplace",
                "AgriSense BD à¦¬à¦¾à¦œà¦¾à¦°à§‡ à¦¸à§à¦¬à¦¾à¦—à¦¤à¦®"
              )}
            </strong>

            <p>
              {tx(
                "Visitors can explore crop listings and prices. Farmers can log in to manage their own crop listings from their dashboard.",
                "à¦¸à¦•à¦² à¦¦à¦°à§à¦¶à¦¨à¦¾à¦°à§à¦¥à§€ à¦«à¦¸à¦²à§‡à¦° à¦¤à¦¾à¦²à¦¿à¦•à¦¾ à¦“ à¦¦à¦¾à¦® à¦¦à§‡à¦–à¦¤à§‡ à¦ªà¦¾à¦°à¦¬à§‡à¦¨à¥¤ à¦•à§ƒà¦·à¦•à¦°à¦¾ à¦²à¦—à¦‡à¦¨ à¦•à¦°à§‡ à¦¡à§à¦¯à¦¾à¦¶à¦¬à§‹à¦°à§à¦¡ à¦¥à§‡à¦•à§‡ à¦¨à¦¿à¦œà§‡à¦¦à§‡à¦° à¦«à¦¸à¦²à§‡à¦° à¦¤à¦¾à¦²à¦¿à¦•à¦¾ à¦ªà¦°à¦¿à¦šà¦¾à¦²à¦¨à¦¾ à¦•à¦°à¦¤à§‡ à¦ªà¦¾à¦°à¦¬à§‡à¦¨à¥¤"
              )}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Marketplace;

