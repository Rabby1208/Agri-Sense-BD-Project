
import { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  MapPin,
  Package,
  ShoppingBasket,
  Leaf,
  LogOut,
  ClipboardList,
  ShoppingCart,
  X,
  LoaderCircle,
  AlertCircle,
  CheckCircle,
  Clock,
  Truck
} from "lucide-react";

import "./BuyerDashboard.css";

const API_URL = import.meta.env.VITE_BACKEND_API_URL || "https://agri-sense-bd-project.onrender.com/api";

function BuyerDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("marketplace");

  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");

  const [selectedListing, setSelectedListing] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [buyerNote, setBuyerNote] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  const token = localStorage.getItem("agrisense_token");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  const fetchListings = useCallback(async (searchValue = "", districtValue = "") => {
    try {
      setLoadingListings(true);
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
        throw new Error(result.message || "Unable to load marketplace.");
      }

      setListings(Array.isArray(result.listings) ? result.listings : []);
    } catch (err) {
      setError(err.message || "Unable to load listings.");
      setListings([]);
    } finally {
      setLoadingListings(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      setError("");

      const response = await fetch(`${API_URL}/orders/my-orders`, {
        headers: authHeaders
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load your orders.");
      }

      setOrders(Array.isArray(result.orders) ? result.orders : []);
    } catch (err) {
      setError(err.message || "Unable to load orders.");
    } finally {
      setLoadingOrders(false);
    }
  }, [token]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab, fetchOrders]);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchListings(search, district);
  };

  const handleReset = () => {
    setSearch("");
    setDistrict("");
    fetchListings("", "");
  };

  const openOrderForm = (listing) => {
    setSelectedListing(listing);
    setQuantity("");
    setDeliveryAddress("");
    setBuyerNote("");
    setError("");
    setSuccess("");
  };

  const closeOrderForm = () => {
    if (!placingOrder) {
      setSelectedListing(null);
    }
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    if (!selectedListing) return;

    const orderQuantity = Number(quantity);
    const availableQuantity = Number(
      selectedListing.available_quantity ?? selectedListing.quantity ?? 0
    );

    if (!Number.isFinite(orderQuantity) || orderQuantity <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }

    if (orderQuantity > availableQuantity) {
      setError(`Only ${availableQuantity} ${selectedListing.unit || "KG"} available.`);
      return;
    }

    if (!deliveryAddress.trim()) {
      setError("Please enter your delivery address.");
      return;
    }

    try {
      setPlacingOrder(true);
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          listing_id: selectedListing.id,
          quantity: orderQuantity,
          delivery_address: deliveryAddress.trim(),
          buyer_note: buyerNote.trim()
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to place order.");
      }

      setSelectedListing(null);
      setSuccess(`Order #${result.order?.id || ""} placed successfully!`);
      setActiveTab("orders");

      await fetchListings(search, district);
      await fetchOrders();
    } catch (err) {
      setError(err.message || "Unable to place order.");
    } finally {
      setPlacingOrder(false);
    }
  };

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "ACCEPTED":
        return <CheckCircle size={15} />;
      case "REJECTED":
        return <X size={15} />;
      case "COMPLETED":
        return <Truck size={15} />;
      default:
        return <Clock size={15} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "ACCEPTED":
        return "buyer-status-accepted";
      case "REJECTED":
        return "buyer-status-rejected";
      case "COMPLETED":
        return "buyer-status-completed";
      default:
        return "buyer-status-pending";
    }
  };

  return (
    <div className="buyer-dashboard">
      <header className="buyer-topbar">
        <div className="buyer-brand">
          <div className="buyer-brand-icon">
            <Leaf size={23} />
          </div>
          <div>
            <h2>AgriSense BD</h2>
            <span>Buyer Dashboard</span>
          </div>
        </div>

        <div className="buyer-user-area">
          <div className="buyer-user-info">
            <strong>{user?.full_name || "Buyer"}</strong>
            <span>{user?.phone || ""}</span>
          </div>

          <button className="buyer-logout-button" onClick={onLogout}>
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </header>

      <main className="buyer-main">
        <section className="buyer-welcome">
          <div>
            <span className="buyer-eyebrow">BUYER ACCOUNT</span>
            <h1>Welcome, {user?.full_name || "Buyer"}!</h1>
            <p>Explore fresh crops and manage your marketplace orders.</p>
          </div>

          <div className="buyer-welcome-icon">
            <ShoppingBasket size={42} />
          </div>
        </section>

        <nav className="buyer-tabs">
          <button
            className={activeTab === "marketplace" ? "active" : ""}
            onClick={() => {
              setActiveTab("marketplace");
              setError("");
              setSuccess("");
            }}
          >
            <ShoppingCart size={18} />
            Marketplace
          </button>

          <button
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => {
              setActiveTab("orders");
              setError("");
              setSuccess("");
            }}
          >
            <ClipboardList size={18} />
            My Orders
          </button>
        </nav>

        {error && !selectedListing && (
          <div className="buyer-alert buyer-alert-error">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div className="buyer-alert buyer-alert-success">
            <CheckCircle size={18} />
            {success}
          </div>
        )}

        {activeTab === "marketplace" && (
          <section className="buyer-content">
            <div className="buyer-section-heading">
              <div>
                <span>EXPLORE FARM PRODUCTS</span>
                <h2>Available Crops</h2>
                <p>Find agricultural products directly from farmers.</p>
              </div>

              <button
                className="buyer-refresh-button"
                onClick={() => fetchListings(search, district)}
                disabled={loadingListings}
              >
                <RefreshCw
                  size={17}
                  className={loadingListings ? "buyer-spin" : ""}
                />
                Refresh
              </button>
            </div>

            <form className="buyer-search-form" onSubmit={handleSearch}>
              <div className="buyer-search-field">
                <Search size={18} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search crop name..."
                />
              </div>

              <div className="buyer-search-field">
                <MapPin size={18} />
                <input
                  value={district}
                  onChange={(event) => setDistrict(event.target.value)}
                  placeholder="Search district..."
                />
              </div>

              <button type="submit" disabled={loadingListings}>
                <Search size={17} />
                Search
              </button>

              <button
                type="button"
                className="buyer-reset-button"
                onClick={handleReset}
              >
                Reset
              </button>
            </form>

            {loadingListings ? (
              <div className="buyer-empty-state">
                <LoaderCircle size={36} className="buyer-spin" />
                <h3>Loading marketplace...</h3>
              </div>
            ) : error && listings.length === 0 ? (
              <div className="buyer-empty-state">
                <AlertCircle size={36} />
                <h3>Unable to load listings</h3>
                <p>{error}</p>
                <button onClick={() => fetchListings(search, district)}>
                  Try Again
                </button>
              </div>
            ) : listings.length === 0 ? (
              <div className="buyer-empty-state">
                <Package size={42} />
                <h3>No crop listings available</h3>
                <p>Please check again later or try another search.</p>
              </div>
            ) : (
              <div className="buyer-product-grid">
                {listings.map((item) => {
                  const available = Number(
                    item.available_quantity ?? item.quantity ?? 0
                  );

                  return (
                    <article className="buyer-product-card" key={item.id}>
                      <div className="buyer-product-image">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.crop_name || "Crop"}
                          />
                        ) : (
                          <span>{"\u{1F33E}"}</span>
                        )}

                        <span className="buyer-available-tag">
                          Available
                        </span>
                      </div>

                      <div className="buyer-product-body">
                        <h3>{item.crop_name || "Unnamed Crop"}</h3>

                        <div className="buyer-product-price">
                          {"\u09F3"}{formatPrice(item.price_per_unit)}
                          <small> / {item.unit || "KG"}</small>
                        </div>

                        <p className="buyer-product-detail">
                          <Package size={16} />
                          {available} {item.unit || "KG"} available
                        </p>

                        <p className="buyer-product-detail">
                          <MapPin size={16} />
                          {[
                            item.upazila,
                            item.district
                          ].filter(Boolean).join(", ") ||
                            item.location ||
                            "Location not specified"}
                        </p>

                        {item.description && (
                          <p className="buyer-product-description">
                            {item.description}
                          </p>
                        )}

                        <button
                          className="buyer-buy-button"
                          disabled={available <= 0}
                          onClick={() => openOrderForm(item)}
                        >
                          <ShoppingCart size={17} />
                          Buy Now
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === "orders" && (
          <section className="buyer-content">
            <div className="buyer-section-heading">
              <div>
                <span>YOUR PURCHASES</span>
                <h2>My Orders</h2>
                <p>Track your order requests and their latest status.</p>
              </div>

              <button
                className="buyer-refresh-button"
                onClick={fetchOrders}
                disabled={loadingOrders}
              >
                <RefreshCw
                  size={17}
                  className={loadingOrders ? "buyer-spin" : ""}
                />
                Refresh
              </button>
            </div>

            {loadingOrders ? (
              <div className="buyer-empty-state">
                <LoaderCircle size={36} className="buyer-spin" />
                <h3>Loading your orders...</h3>
              </div>
            ) : orders.length === 0 ? (
              <div className="buyer-empty-state">
                <ClipboardList size={42} />
                <h3>No orders yet</h3>
                <p>Your placed orders will appear here.</p>
                <button onClick={() => setActiveTab("marketplace")}>
                  Explore Marketplace
                </button>
              </div>
            ) : (
              <div className="buyer-orders-list">
                {orders.map((order) => (
                  <article className="buyer-order-card" key={order.id}>
                    <div className="buyer-order-top">
                      <div>
                        <span className="buyer-order-number">
                          ORDER #{order.id}
                        </span>
                        <h3>{order.crop_name || "Crop Order"}</h3>
                      </div>

                      <span className={`buyer-order-status ${getStatusClass(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </div>

                    <div className="buyer-order-details">
                      <div>
                        <span>Quantity</span>
                        <strong>{order.quantity} {order.unit}</strong>
                      </div>

                      <div>
                        <span>Unit Price</span>
                        <strong>{"\u09F3"}{formatPrice(order.unit_price)}</strong>
                      </div>

                      <div>
                        <span>Total Amount</span>
                        <strong>{"\u09F3"}{formatPrice(order.total_amount)}</strong>
                      </div>

                      <div>
                        <span>Order Date</span>
                        <strong>{formatDate(order.created_at)}</strong>
                      </div>
                    </div>

                    <div className="buyer-order-extra">
                      <p>
                        <strong>Farmer:</strong>{" "}
                        {order.farmer_name || "Not available"}
                      </p>

                      <p>
                        <strong>Farmer Phone:</strong>{" "}
                        {order.farmer_phone || "Not available"}
                      </p>

                      <p>
                        <strong>Delivery Address:</strong>{" "}
                        {order.delivery_address || "Not provided"}
                      </p>
                    </div>

                    {order.buyer_note && (
                      <p className="buyer-order-note">
                        <strong>Your Note:</strong> {order.buyer_note}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {selectedListing && (
        <div className="buyer-modal-overlay" onClick={closeOrderForm}>
          <div
            className="buyer-order-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="buyer-modal-header">
              <div>
                <span>PLACE YOUR ORDER</span>
                <h2>{selectedListing.crop_name}</h2>
              </div>

              <button
                type="button"
                onClick={closeOrderForm}
                disabled={placingOrder}
                aria-label="Close"
              >
                <X size={21} />
              </button>
            </div>

            <div className="buyer-modal-price">
              {"\u09F3"}{formatPrice(selectedListing.price_per_unit)}
              <span> / {selectedListing.unit || "KG"}</span>
            </div>

            <p className="buyer-modal-available">
              Available:{" "}
              {selectedListing.available_quantity ?? selectedListing.quantity ?? 0}{" "}
              {selectedListing.unit || "KG"}
            </p>

            <form onSubmit={handlePlaceOrder}>
              <label>
                Quantity ({selectedListing.unit || "KG"})
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={selectedListing.available_quantity ?? selectedListing.quantity}
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  placeholder="Enter quantity"
                  required
                />
              </label>

              <label>
                Delivery Address
                <textarea
                  value={deliveryAddress}
                  onChange={(event) => setDeliveryAddress(event.target.value)}
                  placeholder="Enter your full delivery address"
                  rows={3}
                  required
                />
              </label>

              <label>
                Note (Optional)
                <textarea
                  value={buyerNote}
                  onChange={(event) => setBuyerNote(event.target.value)}
                  placeholder="Any additional instructions..."
                  rows={2}
                />
              </label>

              {error && (
                <div className="buyer-alert buyer-alert-error">
                  <AlertCircle size={17} />
                  {error}
                </div>
              )}

              {quantity && Number(quantity) > 0 && (
                <div className="buyer-order-total">
                  <span>Estimated Total</span>
                  <strong>
                    {"\u09F3"}
                    {formatPrice(
                      Number(quantity) *
                      Number(selectedListing.price_per_unit)
                    )}
                  </strong>
                </div>
              )}

              <button
                type="submit"
                className="buyer-confirm-order-button"
                disabled={placingOrder}
              >
                {placingOrder ? (
                  <>
                    <LoaderCircle size={18} className="buyer-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <ShoppingBasket size={18} />
                    Confirm Order
                  </>
                )}
              </button>

              <p className="buyer-payment-note">
                Payment and delivery arrangements will be coordinated with the farmer.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuyerDashboard;




