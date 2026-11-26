
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useTranslation } from "react-i18next";

import {
  Store,
  Plus,
  Trash2,
  RefreshCw,
  LoaderCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";

import "./FarmerMarketplaceSales.css";

const API_URL = (import.meta.env.VITE_BACKEND_API_URL || "http://127.0.0.1:5000/api").replace(/\/$/, "");
const REFRESH_INTERVAL = 5000;

const listingInitial = {
  farmer_crop_id: "",
  quantity: "",
  unit: "KG",
  price_per_unit: "",
  location: "",
  description: "",
};

const saleInitial = {
  farmer_crop_id: "",
  quantity: "",
  unit: "KG",
  unit_price: "",
  sale_date: new Date().toISOString().slice(0, 10),
  buyer_name: "",
  notes: "",
};

const cropTranslations = {
  rice: "à¦§à¦¾à¦¨",
  paddy: "à¦§à¦¾à¦¨",
  potato: "à¦†à¦²à§",
  tomato: "à¦Ÿà¦®à§‡à¦Ÿà§‹",
  maize: "à¦­à§à¦Ÿà§à¦Ÿà¦¾",
  corn: "à¦­à§à¦Ÿà§à¦Ÿà¦¾",
  wheat: "à¦—à¦®",
  onion: "à¦ªà§‡à¦à§Ÿà¦¾à¦œ",
  garlic: "à¦°à¦¸à§à¦¨",
  chilli: "à¦®à¦°à¦¿à¦š",
  chili: "à¦®à¦°à¦¿à¦š",
  brinjal: "à¦¬à§‡à¦—à§à¦¨",
  eggplant: "à¦¬à§‡à¦—à§à¦¨",
  cabbage: "à¦¬à¦¾à¦à¦§à¦¾à¦•à¦ªà¦¿",
  cauliflower: "à¦«à§à¦²à¦•à¦ªà¦¿",
  cucumber: "à¦¶à¦¸à¦¾",
  pumpkin: "à¦®à¦¿à¦·à§à¦Ÿà¦¿ à¦•à§à¦®à§œà¦¾",
  papaya: "à¦ªà§‡à¦à¦ªà§‡",
  mango: "à¦†à¦®",
  banana: "à¦•à¦²à¦¾",
  jackfruit: "à¦•à¦¾à¦à¦ à¦¾à¦²",
  lentil: "à¦®à¦¸à§à¦° à¦¡à¦¾à¦²",
  mustard: "à¦¸à¦°à¦¿à¦·à¦¾",
  soybean: "à¦¸à§Ÿà¦¾à¦¬à¦¿à¦¨",
  sugarcane: "à¦†à¦–",
  watermelon: "à¦¤à¦°à¦®à§à¦œ",
  okra: "à¦¢à§‡à¦à§œà¦¸",
  spinach: "à¦ªà¦¾à¦²à¦‚ à¦¶à¦¾à¦•",
  coriander: "à¦§à¦¨à¦¿à§Ÿà¦¾",
  ginger: "à¦†à¦¦à¦¾",
  turmeric: "à¦¹à¦²à§à¦¦",
};

const translations = {
  en: {
    eyebrow: "FARMER BUSINESS CENTER",
    title: "Marketplace & Sales",
    description:
      "Manage your crop listings, sales records and profit/loss.",
    lastUpdated: "Last updated",
    autoRefresh: "Auto refresh every 5 seconds",
    refresh: "Refresh",
    loading: "Loading marketplace and sales data...",
    myListings: "My Listings",
    mySales: "My Sales",
    profitLoss: "Profit & Loss",
    totalListings: "Total Listings",
    totalSalesRecords: "Sales Records",
    totalRevenue: "Total Sales Revenue",
    listingsTitle: "My Marketplace Listings",
    listingsDescription:
      "Only harvested crops can be listed in the marketplace.",
    createListing: "Create Listing",
    close: "Close",
    selectHarvestedCrop: "Select Harvested Crop",
    selectCrop: "Select crop",
    quantity: "Quantity",
    unit: "Unit",
    pricePerUnit: "Price per Unit (à§³)",
    location: "Location",
    locationPlaceholder: "District / Upazila",
    descriptionLabel: "Description",
    publishListing: "Publish Listing",
    saving: "Saving...",
    available: "Available",
    status: "Status",
    action: "Action",
    active: "ACTIVE",
    inactive: "INACTIVE",
    noListings: "No Listings Yet",
    noListingsDescription:
      "Create a listing from one of your harvested crops.",
    harvestedRequired:
      "At least one crop in My Crops must have HARVESTED status.",
    deleteConfirm: "Do you want to remove this listing?",
    listingCreated: "Marketplace listing created successfully.",
    listingDeleted: "Listing removed successfully.",
    salesTitle: "My Sales Records",
    salesDescription: "Record and manage your crop sales.",
    recordSale: "Record Sale",
    selectYourCrop: "Select Your Crop",
    sellingPrice: "Selling Price per Unit (à§³)",
    saleDate: "Sale Date",
    buyerName: "Buyer Name",
    notes: "Notes",
    saveSale: "Save Sale",
    saleSaved: "Sale recorded successfully.",
    noSales: "No Sales Records Yet",
    noSalesDescription:
      "Add your sales information using Record Sale.",
    crop: "Crop",
    total: "Total",
    buyer: "Buyer",
    profitTitle: "Profit & Loss Summary",
    profitDescription:
      "Recorded sales revenue minus recorded farming expenses.",
    totalExpenses: "Total Farming Expenses",
    profit: "Profit",
    loss: "Loss",
    cropRevenue: "Revenue",
    cropExpense: "Expense",
    noHarvestedCrops: "No harvested crops available.",
    noCrops: "No crops available.",
    directSale: "DIRECT",
    error: "Something went wrong.",
    tokenError: "Login token not found. Please log in again.",
    listingError: "Unable to create listing.",
    deleteError: "Unable to delete listing.",
    saleError: "Unable to record sale.",
    unavailable: "N/A",
    remove: "Remove",
    salesNote:
      "Figures are calculated from your saved sale and farming expense records.",
    profitNote:
      "Profit/Loss = Total sales revenue - Total farming costs.",
    unitKg: "KG",
    unitTon: "Ton",
    unitBag: "Bag",
    unitPiece: "Piece",
  },

  bn: {
    eyebrow: "à¦•à§ƒà¦·à¦• à¦¬à§à¦¯à¦¬à¦¸à¦¾ à¦¬à§à¦¯à¦¬à¦¸à§à¦¥à¦¾à¦ªà¦¨à¦¾",
    title: "à¦•à§ƒà¦·à¦¿ à¦¬à¦¾à¦œà¦¾à¦° à¦“ à¦¬à¦¿à¦•à§à¦°à§Ÿ",
    description:
      "à¦«à¦¸à¦²à§‡à¦° à¦¤à¦¾à¦²à¦¿à¦•à¦¾, à¦¬à¦¿à¦•à§à¦°à¦¿à¦° à¦¹à¦¿à¦¸à¦¾à¦¬ à¦à¦¬à¦‚ à¦²à¦¾à¦­-à¦•à§à¦·à¦¤à¦¿ à¦ªà¦°à¦¿à¦šà¦¾à¦²à¦¨à¦¾ à¦•à¦°à§à¦¨à¥¤",
    lastUpdated: "à¦¸à¦°à§à¦¬à¦¶à§‡à¦· à¦†à¦ªà¦¡à§‡à¦Ÿ",
    autoRefresh: "à¦ªà§à¦°à¦¤à¦¿ à§« à¦¸à§‡à¦•à§‡à¦¨à§à¦¡à§‡ à¦¸à§à¦¬à§Ÿà¦‚à¦•à§à¦°à¦¿à§Ÿ à¦†à¦ªà¦¡à§‡à¦Ÿ",
    refresh: "à¦°à¦¿à¦«à§à¦°à§‡à¦¶",
    loading: "à¦¬à¦¾à¦œà¦¾à¦° à¦“ à¦¬à¦¿à¦•à§à¦°à¦¿à¦° à¦¤à¦¥à§à¦¯ à¦²à§‹à¦¡ à¦¹à¦šà§à¦›à§‡...",
    myListings: "à¦†à¦®à¦¾à¦° à¦«à¦¸à¦²à§‡à¦° à¦¤à¦¾à¦²à¦¿à¦•à¦¾",
    mySales: "à¦†à¦®à¦¾à¦° à¦¬à¦¿à¦•à§à¦°à§Ÿ",
    profitLoss: "à¦²à¦¾à¦­ à¦“ à¦•à§à¦·à¦¤à¦¿",
    totalListings: "à¦®à§‹à¦Ÿ à¦¤à¦¾à¦²à¦¿à¦•à¦¾",
    totalSalesRecords: "à¦®à§‹à¦Ÿ à¦¬à¦¿à¦•à§à¦°à¦¿à¦° à¦¹à¦¿à¦¸à¦¾à¦¬",
    totalRevenue: "à¦®à§‹à¦Ÿ à¦¬à¦¿à¦•à§à¦°à¦¿à¦° à¦†à§Ÿ",
    listingsTitle: "à¦†à¦®à¦¾à¦° à¦®à¦¾à¦°à§à¦•à§‡à¦Ÿà¦ªà§à¦²à§‡à¦¸ à¦¤à¦¾à¦²à¦¿à¦•à¦¾",
    listingsDescription:
      "à¦¶à§à¦§à§ à¦¸à¦‚à¦—à§à¦°à¦¹ à¦•à¦°à¦¾ à¦«à¦¸à¦² à¦®à¦¾à¦°à§à¦•à§‡à¦Ÿà¦ªà§à¦²à§‡à¦¸à§‡ à¦¤à¦¾à¦²à¦¿à¦•à¦¾à¦­à§à¦•à§à¦¤ à¦•à¦°à¦¾ à¦¯à¦¾à¦¬à§‡à¥¤",
    createListing: "à¦¨à¦¤à§à¦¨ à¦¤à¦¾à¦²à¦¿à¦•à¦¾ à¦¤à§ˆà¦°à¦¿",
    close: "à¦¬à¦¨à§à¦§ à¦•à¦°à§à¦¨",
    selectHarvestedCrop: "à¦¸à¦‚à¦—à§à¦°à¦¹ à¦•à¦°à¦¾ à¦«à¦¸à¦² à¦¨à¦¿à¦°à§à¦¬à¦¾à¦šà¦¨ à¦•à¦°à§à¦¨",
    selectCrop: "à¦«à¦¸à¦² à¦¨à¦¿à¦°à§à¦¬à¦¾à¦šà¦¨ à¦•à¦°à§à¦¨",
    quantity: "à¦ªà¦°à¦¿à¦®à¦¾à¦£",
    unit: "à¦à¦•à¦•",
    pricePerUnit: "à¦ªà§à¦°à¦¤à¦¿ à¦à¦•à¦•à§‡à¦° à¦®à§‚à¦²à§à¦¯ (à§³)",
    location: "à¦…à¦¬à¦¸à§à¦¥à¦¾à¦¨",
    locationPlaceholder: "à¦œà§‡à¦²à¦¾ / à¦‰à¦ªà¦œà§‡à¦²à¦¾",
    descriptionLabel: "à¦¬à¦¿à¦¬à¦°à¦£",
    publishListing: "à¦¤à¦¾à¦²à¦¿à¦•à¦¾ à¦ªà§à¦°à¦•à¦¾à¦¶ à¦•à¦°à§à¦¨",
    saving: "à¦¸à¦‚à¦°à¦•à§à¦·à¦£ à¦¹à¦šà§à¦›à§‡...",
    available: "à¦…à¦¬à¦¶à¦¿à¦·à§à¦Ÿ à¦ªà¦°à¦¿à¦®à¦¾à¦£",
    status: "à¦…à¦¬à¦¸à§à¦¥à¦¾",
    action: "à¦•à¦¾à¦°à§à¦¯à¦•à§à¦°à¦®",
    active: "à¦¸à¦•à§à¦°à¦¿à§Ÿ",
    inactive: "à¦¨à¦¿à¦·à§à¦•à§à¦°à¦¿à§Ÿ",
    noListings: "à¦à¦–à¦¨à§‹ à¦•à§‹à¦¨à§‹ à¦¤à¦¾à¦²à¦¿à¦•à¦¾ à¦¨à§‡à¦‡",
    noListingsDescription:
      "à¦¸à¦‚à¦—à§à¦°à¦¹ à¦•à¦°à¦¾ à¦«à¦¸à¦² à¦¥à§‡à¦•à§‡ à¦¨à¦¤à§à¦¨ à¦¤à¦¾à¦²à¦¿à¦•à¦¾ à¦¤à§ˆà¦°à¦¿ à¦•à¦°à§‡ à¦¶à§à¦°à§ à¦•à¦°à§à¦¨à¥¤",
    harvestedRequired:
      "à¦¤à¦¾à¦²à¦¿à¦•à¦¾ à¦¤à§ˆà¦°à¦¿ à¦•à¦°à¦¤à§‡ My Crops-à¦ à¦…à¦¨à§à¦¤à¦¤ à¦à¦•à¦Ÿà¦¿ à¦«à¦¸à¦²à§‡à¦° à¦…à¦¬à¦¸à§à¦¥à¦¾ HARVESTED à¦¹à¦¤à§‡ à¦¹à¦¬à§‡à¥¤",
    deleteConfirm: "à¦†à¦ªà¦¨à¦¿ à¦•à¦¿ à¦à¦‡ à¦¤à¦¾à¦²à¦¿à¦•à¦¾à¦Ÿà¦¿ à¦¸à¦°à¦¾à¦¤à§‡ à¦šà¦¾à¦¨?",
    listingCreated: "à¦®à¦¾à¦°à§à¦•à§‡à¦Ÿà¦ªà§à¦²à§‡à¦¸à§‡à¦° à¦¤à¦¾à¦²à¦¿à¦•à¦¾ à¦¸à¦«à¦²à¦­à¦¾à¦¬à§‡ à¦¤à§ˆà¦°à¦¿ à¦¹à§Ÿà§‡à¦›à§‡à¥¤",
    listingDeleted: "à¦¤à¦¾à¦²à¦¿à¦•à¦¾à¦Ÿà¦¿ à¦¸à¦«à¦²à¦­à¦¾à¦¬à§‡ à¦¸à¦°à¦¾à¦¨à§‹ à¦¹à§Ÿà§‡à¦›à§‡à¥¤",
    salesTitle: "à¦†à¦®à¦¾à¦° à¦¬à¦¿à¦•à§à¦°à¦¿à¦° à¦¹à¦¿à¦¸à¦¾à¦¬",
    salesDescription: "à¦¨à¦¿à¦œà§‡à¦° à¦«à¦¸à¦² à¦¬à¦¿à¦•à§à¦°à¦¿à¦° à¦¤à¦¥à§à¦¯ à¦¸à¦‚à¦°à¦•à§à¦·à¦£ à¦“ à¦ªà¦°à¦¿à¦šà¦¾à¦²à¦¨à¦¾ à¦•à¦°à§à¦¨à¥¤",
    recordSale: "à¦¬à¦¿à¦•à§à¦°à¦¿à¦° à¦¤à¦¥à§à¦¯ à¦¯à§‹à¦— à¦•à¦°à§à¦¨",
    selectYourCrop: "à¦†à¦ªà¦¨à¦¾à¦° à¦«à¦¸à¦² à¦¨à¦¿à¦°à§à¦¬à¦¾à¦šà¦¨ à¦•à¦°à§à¦¨",
    sellingPrice: "à¦ªà§à¦°à¦¤à¦¿ à¦à¦•à¦•à§‡à¦° à¦¬à¦¿à¦•à§à¦°à§Ÿà¦®à§‚à¦²à§à¦¯ (à§³)",
    saleDate: "à¦¬à¦¿à¦•à§à¦°à¦¿à¦° à¦¤à¦¾à¦°à¦¿à¦–",
    buyerName: "à¦•à§à¦°à§‡à¦¤à¦¾à¦° à¦¨à¦¾à¦®",
    notes: "à¦®à¦¨à§à¦¤à¦¬à§à¦¯",
    saveSale: "à¦¬à¦¿à¦•à§à¦°à¦¿à¦° à¦¤à¦¥à§à¦¯ à¦¸à¦‚à¦°à¦•à§à¦·à¦£",
    saleSaved: "à¦¬à¦¿à¦•à§à¦°à¦¿à¦° à¦¤à¦¥à§à¦¯ à¦¸à¦«à¦²à¦­à¦¾à¦¬à§‡ à¦¸à¦‚à¦°à¦•à§à¦·à¦£ à¦¹à§Ÿà§‡à¦›à§‡à¥¤",
    noSales: "à¦à¦–à¦¨à§‹ à¦•à§‹à¦¨à§‹ à¦¬à¦¿à¦•à§à¦°à¦¿à¦° à¦¤à¦¥à§à¦¯ à¦¨à§‡à¦‡",
    noSalesDescription:
      "à¦¬à¦¿à¦•à§à¦°à¦¿à¦° à¦¤à¦¥à§à¦¯ à¦¯à§‹à¦— à¦•à¦°à¦¤à§‡ Record Sale à¦¬à§à¦¯à¦¬à¦¹à¦¾à¦° à¦•à¦°à§à¦¨à¥¤",
    crop: "à¦«à¦¸à¦²",
    total: "à¦®à§‹à¦Ÿ",
    buyer: "à¦•à§à¦°à§‡à¦¤à¦¾",
    profitTitle: "à¦²à¦¾à¦­ à¦“ à¦•à§à¦·à¦¤à¦¿à¦° à¦¹à¦¿à¦¸à¦¾à¦¬",
    profitDescription:
      "à¦¸à¦‚à¦°à¦•à§à¦·à¦¿à¦¤ à¦¬à¦¿à¦•à§à¦°à¦¿à¦° à¦†à§Ÿ à¦¥à§‡à¦•à§‡ à¦•à§ƒà¦·à¦¿à¦•à¦¾à¦œà§‡à¦° à¦–à¦°à¦š à¦¬à¦¾à¦¦ à¦¦à¦¿à§Ÿà§‡ à¦¹à¦¿à¦¸à¦¾à¦¬ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡à¥¤",
    totalExpenses: "à¦®à§‹à¦Ÿ à¦•à§ƒà¦·à¦¿ à¦–à¦°à¦š",
    profit: "à¦²à¦¾à¦­",
    loss: "à¦•à§à¦·à¦¤à¦¿",
    cropRevenue: "à¦†à§Ÿ",
    cropExpense: "à¦–à¦°à¦š",
    noHarvestedCrops: "à¦•à§‹à¦¨à§‹ à¦¸à¦‚à¦—à§à¦°à¦¹ à¦•à¦°à¦¾ à¦«à¦¸à¦² à¦ªà¦¾à¦“à§Ÿà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤",
    noCrops: "à¦•à§‹à¦¨à§‹ à¦«à¦¸à¦² à¦ªà¦¾à¦“à§Ÿà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤",
    directSale: "à¦¸à¦°à¦¾à¦¸à¦°à¦¿ à¦¬à¦¿à¦•à§à¦°à§Ÿ",
    error: "à¦à¦•à¦Ÿà¦¿ à¦¸à¦®à¦¸à§à¦¯à¦¾ à¦¹à§Ÿà§‡à¦›à§‡à¥¤",
    tokenError: "à¦²à¦—à¦‡à¦¨ à¦Ÿà§‹à¦•à§‡à¦¨ à¦ªà¦¾à¦“à§Ÿà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤ à¦†à¦¬à¦¾à¦° à¦²à¦—à¦‡à¦¨ à¦•à¦°à§à¦¨à¥¤",
    listingError: "à¦¤à¦¾à¦²à¦¿à¦•à¦¾ à¦¤à§ˆà¦°à¦¿ à¦•à¦°à¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤",
    deleteError: "à¦¤à¦¾à¦²à¦¿à¦•à¦¾ à¦¸à¦°à¦¾à¦¨à§‹ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤",
    saleError: "à¦¬à¦¿à¦•à§à¦°à¦¿à¦° à¦¤à¦¥à§à¦¯ à¦¸à¦‚à¦°à¦•à§à¦·à¦£ à¦•à¦°à¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤",
    unavailable: "à¦ªà¦¾à¦“à§Ÿà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿",
    remove: "à¦¸à¦°à¦¾à¦¨",
    salesNote:
      "à¦à¦‡ à¦¹à¦¿à¦¸à¦¾à¦¬ à¦¸à¦‚à¦°à¦•à§à¦·à¦¿à¦¤ à¦¬à¦¿à¦•à§à¦°à§Ÿ à¦à¦¬à¦‚ à¦•à§ƒà¦·à¦¿ à¦–à¦°à¦šà§‡à¦° à¦¤à¦¥à§à¦¯à§‡à¦° à¦“à¦ªà¦° à¦¨à¦¿à¦°à§à¦­à¦° à¦•à¦°à§‡à¥¤",
    profitNote:
      "à¦²à¦¾à¦­/à¦•à§à¦·à¦¤à¦¿ = à¦®à§‹à¦Ÿ à¦¬à¦¿à¦•à§à¦°à¦¿à¦° à¦†à§Ÿ - à¦®à§‹à¦Ÿ à¦•à§ƒà¦·à¦¿ à¦–à¦°à¦šà¥¤",
    unitKg: "à¦•à§‡à¦œà¦¿",
    unitTon: "à¦Ÿà¦¨",
    unitBag: "à¦¬à¦¸à§à¦¤à¦¾",
    unitPiece: "à¦Ÿà¦¿",
  },
};

// ======================================
// RESPONSE HELPERS
// ======================================

function getArray(response) {
  if (Array.isArray(response)) return response;

  const candidates = [
    response?.listings,
    response?.sales,
    response?.crops,
    response?.data?.listings,
    response?.data?.sales,
    response?.data?.crops,
    response?.data,
  ];

  return candidates.find(Array.isArray) || [];
}

function getObject(response) {
  if (
    response?.data &&
    !Array.isArray(response.data) &&
    typeof response.data === "object"
  ) {
    return response.data;
  }

  return response || {};
}

function cropName(crop, isBn) {
  const name =
    crop?.crop_name ||
    crop?.name ||
    crop?.crop?.crop_name ||
    crop?.crop?.name ||
    "";

  if (!name) return isBn ? "à¦«à¦¸à¦²" : "Crop";

  const normalized = String(name).trim().toLowerCase();

  return isBn
    ? cropTranslations[normalized] || name
    : name;
}

function cropId(crop) {
  return (
    crop?.farmer_crop_id ||
    crop?.crop_record_id ||
    crop?.id
  );
}

function isHarvested(crop) {
  return (
    String(
      crop?.farming_status ||
      crop?.status ||
      crop?.crop_status ||
      ""
    ).toUpperCase() === "HARVESTED"
  );
}

function getProfitRows(profitData) {
  return (
    profitData?.crops ||
    profitData?.profit_loss ||
    profitData?.results ||
    profitData?.rows ||
    []
  );
}

function getRowRevenue(row) {
  return Number(
    row?.total_sales ??
    row?.total_revenue ??
    row?.revenue ??
    row?.total_amount ??
    0
  );
}

function getRowExpense(row) {
  return Number(
    row?.total_cost ??
    row?.total_expenses ??
    row?.expense ??
    row?.total_expense ??
    row?.farming_expense ??
    0
  );
}

function getRowProfit(row) {
  return Number(
    row?.profit_loss ??
    row?.profit ??
    (getRowRevenue(row) - getRowExpense(row))
  );
}

function getId(item) {
  return item?.id || item?.listing_id;
}

// ======================================
// COMPONENT
// ======================================

function FarmerMarketplaceSales({ myCrops = [] }) {
  const { i18n } = useTranslation();

  const isBn = i18n.language?.startsWith("bn");
  const t = translations[isBn ? "bn" : "en"];

  const [activeSection, setActiveSection] = useState("listings");

  const [listings, setListings] = useState([]);
  const [sales, setSales] = useState([]);
  const [profitData, setProfitData] = useState({});

  const [listingForm, setListingForm] = useState(listingInitial);
  const [saleForm, setSaleForm] = useState(saleInitial);

  const [showListingForm, setShowListingForm] = useState(false);
  const [showSaleForm, setShowSaleForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const requestInProgress = useRef(false);

  const harvestedCrops = useMemo(
    () => myCrops.filter(isHarvested),
    [myCrops]
  );

  const formatMoney = useCallback(
    (value) => {
      return `à§³${Number(value || 0).toLocaleString(
        isBn ? "bn-BD" : "en-BD",
        {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }
      )}`;
    },
    [isBn]
  );

  const formatNumber = useCallback(
    (value) => {
      return Number(value || 0).toLocaleString(
        isBn ? "bn-BD" : "en-BD",
        {
          maximumFractionDigits: 2,
        }
      );
    },
    [isBn]
  );

  const formatDate = useCallback(
    (value) => {
      if (!value) return t.unavailable;

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return String(value).slice(0, 10);
      }

      return date.toLocaleDateString(
        isBn ? "bn-BD" : "en-GB"
      );
    },
    [isBn, t.unavailable]
  );

  const getUnit = useCallback(
    (unit) => {
      if (!isBn) {
        const units = {
          KG: "KG",
          TON: "Ton",
          BAG: "Bag",
          PIECE: "Piece",
        };

        return units[unit] || unit || "KG";
      }

      const units = {
        KG: t.unitKg,
        TON: t.unitTon,
        BAG: t.unitBag,
        PIECE: t.unitPiece,
      };

      return units[unit] || unit || t.unitKg;
    },
    [isBn, t]
  );

  // ======================================
  // API REQUEST
  // ======================================

  const request = useCallback(async (path, options = {}) => {
    const token = localStorage.getItem("agrisense_token");

    if (!token) {
      const currentTranslations =
        translations[
          i18n.language?.startsWith("bn") ? "bn" : "en"
        ];

      throw new Error(currentTranslations.tokenError);
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        result.message ||
        result.error ||
        `Request failed (${response.status})`
      );
    }

    return result;
  }, [i18n.language]);

  // ======================================
  // LOAD DATA
  // ======================================

  const loadData = useCallback(async (showLoader = false) => {
    if (requestInProgress.current) return;

    requestInProgress.current = true;

    if (showLoader) {
      setLoading(true);
    }

    try {
      const results = await Promise.allSettled([
        request("/marketplace/my-listings"),
        request("/crop-sales"),
        request("/crop-sales/profit-loss"),
      ]);

      const errors = [];

      if (results[0].status === "fulfilled") {
        setListings(getArray(results[0].value));
      } else {
        errors.push(
          `Listings: ${results[0].reason?.message || "Failed"}`
        );
        console.error("Listings Error:", results[0].reason);
      }

      if (results[1].status === "fulfilled") {
        setSales(getArray(results[1].value));
      } else {
        errors.push(
          `Sales: ${results[1].reason?.message || "Failed"}`
        );
        console.error("Sales Error:", results[1].reason);
      }

      if (results[2].status === "fulfilled") {
        setProfitData(getObject(results[2].value));
      } else {
        errors.push(
          `Profit & Loss: ${results[2].reason?.message || "Failed"}`
        );
        console.error("Profit Loss Error:", results[2].reason);
      }

      setError(errors.join(" | "));
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || t.error);
    } finally {
      requestInProgress.current = false;
      setLoading(false);
    }
  }, [request, t.error]);

  // ======================================
  // AUTO REFRESH
  // ======================================

  useEffect(() => {
    loadData(true);

    const intervalId = setInterval(() => {
      loadData(false);
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [loadData]);

  // ======================================
  // FORM HANDLERS
  // ======================================

  const handleListingChange = (event) => {
    const { name, value } = event.target;

    setListingForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSaleChange = (event) => {
    const { name, value } = event.target;

    setSaleForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ======================================
  // CREATE LISTING
  // ======================================

  const submitListing = async (event) => {
    event.preventDefault();

    if (!listingForm.farmer_crop_id) {
      setError(t.selectHarvestedCrop);
      return;
    }

    if (
      Number(listingForm.quantity) <= 0 ||
      Number(listingForm.price_per_unit) <= 0
    ) {
      setError(t.error);
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await request("/marketplace", {
        method: "POST",
        body: JSON.stringify({
          ...listingForm,
          farmer_crop_id: Number(listingForm.farmer_crop_id),
          quantity: Number(listingForm.quantity),
          price_per_unit: Number(listingForm.price_per_unit),
        }),
      });

      setListingForm(listingInitial);
      setShowListingForm(false);
      setSuccess(t.listingCreated);

      await loadData();
    } catch (err) {
      setError(err.message || t.listingError);
    } finally {
      setSaving(false);
    }
  };

  // ======================================
  // DELETE LISTING
  // ======================================

  const deleteListing = async (id) => {
    if (!window.confirm(t.deleteConfirm)) return;

    setDeletingId(id);
    setError("");
    setSuccess("");

    try {
      await request(`/marketplace/${id}`, {
        method: "DELETE",
      });

      setSuccess(t.listingDeleted);
      await loadData();
    } catch (err) {
      setError(err.message || t.deleteError);
    } finally {
      setDeletingId(null);
    }
  };

  // ======================================
  // RECORD DIRECT SALE
  // ======================================

  const submitSale = async (event) => {
    event.preventDefault();

    if (!saleForm.farmer_crop_id) {
      setError(t.selectYourCrop);
      return;
    }

    if (
      Number(saleForm.quantity) <= 0 ||
      Number(saleForm.unit_price) <= 0
    ) {
      setError(t.error);
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await request("/crop-sales", {
        method: "POST",
        body: JSON.stringify({
          ...saleForm,
          farmer_crop_id: Number(saleForm.farmer_crop_id),
          quantity: Number(saleForm.quantity),
          unit_price: Number(saleForm.unit_price),
        }),
      });

      setSaleForm(saleInitial);
      setShowSaleForm(false);
      setSuccess(t.saleSaved);

      await loadData();
    } catch (err) {
      setError(err.message || t.saleError);
    } finally {
      setSaving(false);
    }
  };

  // ======================================
  // PROFIT & LOSS
  // ======================================

  const profitRows = useMemo(
    () => getProfitRows(profitData),
    [profitData]
  );

  const apiSummary = profitData?.summary || {};

  const rowRevenueTotal = useMemo(
    () => profitRows.reduce(
      (sum, row) => sum + getRowRevenue(row),
      0
    ),
    [profitRows]
  );

  const rowExpenseTotal = useMemo(
    () => profitRows.reduce(
      (sum, row) => sum + getRowExpense(row),
      0
    ),
    [profitRows]
  );

  const totalRevenue = Number(
    apiSummary.totalSales ?? rowRevenueTotal
  );

  const totalExpense = Number(
    apiSummary.totalCost ?? rowExpenseTotal
  );

  const totalProfit = Number(
    apiSummary.netProfitLoss ??
    (totalRevenue - totalExpense)
  );

  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return (
      <div className="fms-loading">
        <LoaderCircle className="fms-spin" size={30} />
        <p>{t.loading}</p>
      </div>
    );
  }

  // ======================================
  // MAIN UI
  // ======================================

  return (
    <section className="fms-page">

      {/* HEADER */}

      <div className="fms-heading">
        <div>
          <span className="fms-eyebrow">
            {t.eyebrow}
          </span>

          <h2>{t.title}</h2>

          <p>{t.description}</p>

          {lastUpdated && (
            <small>
              {t.lastUpdated}:{" "}
              {lastUpdated.toLocaleTimeString(
                isBn ? "bn-BD" : "en-BD"
              )}
              {" Â· "}
              {t.autoRefresh}
            </small>
          )}
        </div>

        <button
          className="fms-refresh"
          type="button"
          onClick={() => loadData(true)}
        >
          <RefreshCw size={17} />
          {t.refresh}
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="fms-alert fms-error">
          <AlertCircle size={18} />
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Close error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="fms-alert fms-success">
          <CheckCircle size={18} />
          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Close success"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* SUMMARY CARDS */}

      <div className="fms-order-summary">

        <div className="fms-order-summary-card">
          <Store size={22} />
          <span>{t.totalListings}</span>
          <strong>{formatNumber(listings.length)}</strong>
        </div>

        <div className="fms-order-summary-card">
          <ShoppingBag size={22} />
          <span>{t.totalSalesRecords}</span>
          <strong>{formatNumber(sales.length)}</strong>
        </div>

        <div className="fms-order-summary-card">
          <Wallet size={22} />
          <span>{t.totalRevenue}</span>
          <strong>{formatMoney(totalRevenue)}</strong>
        </div>

      </div>

      {/* TABS */}

      <div className="fms-tabs">

        <button
          type="button"
          className={activeSection === "listings" ? "selected" : ""}
          onClick={() => setActiveSection("listings")}
        >
          <Store size={17} />
          {t.myListings}
        </button>

        <button
          type="button"
          className={activeSection === "sales" ? "selected" : ""}
          onClick={() => setActiveSection("sales")}
        >
          <ShoppingBag size={17} />
          {t.mySales}
        </button>

        <button
          type="button"
          className={activeSection === "profit" ? "selected" : ""}
          onClick={() => setActiveSection("profit")}
        >
          <Wallet size={17} />
          {t.profitLoss}
        </button>

      </div>

      {/* MY LISTINGS */}

      {activeSection === "listings" && (
        <div className="fms-panel">

          <div className="fms-panel-heading">
            <div>
              <h3>{t.listingsTitle}</h3>
              <p>{t.listingsDescription}</p>
            </div>

            <button
              type="button"
              className="fms-primary"
              onClick={() =>
                setShowListingForm((value) => !value)
              }
            >
              <Plus size={17} />
              {showListingForm ? t.close : t.createListing}
            </button>
          </div>

          {showListingForm && (
            <form
              className="fms-form"
              onSubmit={submitListing}
            >

              <label>
                {t.selectHarvestedCrop} *
                <select
                  name="farmer_crop_id"
                  value={listingForm.farmer_crop_id}
                  onChange={handleListingChange}
                  required
                >
                  <option value="">{t.selectCrop}</option>

                  {harvestedCrops.map((crop) => (
                    <option
                      key={cropId(crop)}
                      value={cropId(crop)}
                    >
                      {cropName(crop, isBn)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                {t.quantity} *
                <input
                  name="quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={listingForm.quantity}
                  onChange={handleListingChange}
                  required
                />
              </label>

              <label>
                {t.unit}
                <select
                  name="unit"
                  value={listingForm.unit}
                  onChange={handleListingChange}
                >
                  <option value="KG">{getUnit("KG")}</option>
                  <option value="TON">{getUnit("TON")}</option>
                  <option value="BAG">{getUnit("BAG")}</option>
                  <option value="PIECE">{getUnit("PIECE")}</option>
                </select>
              </label>

              <label>
                {t.pricePerUnit} *
                <input
                  name="price_per_unit"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={listingForm.price_per_unit}
                  onChange={handleListingChange}
                  required
                />
              </label>

              <label>
                {t.location}
                <input
                  name="location"
                  value={listingForm.location}
                  onChange={handleListingChange}
                  placeholder={t.locationPlaceholder}
                />
              </label>

              <label className="fms-full">
                {t.descriptionLabel}
                <textarea
                  name="description"
                  rows="3"
                  value={listingForm.description}
                  onChange={handleListingChange}
                />
              </label>

              <button
                className="fms-primary fms-full"
                type="submit"
                disabled={saving || harvestedCrops.length === 0}
              >
                {saving ? t.saving : t.publishListing}
              </button>

            </form>
          )}

          {harvestedCrops.length === 0 && (
            <p className="fms-note">
              {t.harvestedRequired}
            </p>
          )}

          {listings.length === 0 ? (
            <div className="fms-empty">
              <Store size={35} />
              <h3>{t.noListings}</h3>
              <p>{t.noListingsDescription}</p>
            </div>
          ) : (
            <div className="fms-table-wrap">
              <table className="fms-table">
                <thead>
                  <tr>
                    <th>{t.crop}</th>
                    <th>{t.quantity}</th>
                    <th>{t.available}</th>
                    <th>{t.pricePerUnit}</th>
                    <th>{t.status}</th>
                    <th>{t.action}</th>
                  </tr>
                </thead>

                <tbody>
                  {listings.map((item, index) => {
                    const id = getId(item);

                    return (
                      <tr key={id || index}>
                        <td>{cropName(item, isBn)}</td>

                        <td>
                          {formatNumber(item.quantity)}{" "}
                          {getUnit(item.unit)}
                        </td>

                        <td>
                          {formatNumber(
                            item.available_quantity ??
                            item.quantity
                          )}{" "}
                          {getUnit(item.unit)}
                        </td>

                        <td>
                          {formatMoney(item.price_per_unit)}
                        </td>

                        <td>
                          {item.status === "ACTIVE"
                            ? t.active
                            : item.status === "INACTIVE"
                              ? t.inactive
                              : item.status || t.unavailable}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="fms-delete"
                            title={t.remove}
                            disabled={
                              !id ||
                              deletingId === id ||
                              item.status === "INACTIVE"
                            }
                            onClick={() => deleteListing(id)}
                          >
                            {deletingId === id
                              ? <LoaderCircle size={16} className="fms-spin" />
                              : <Trash2 size={16} />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* MY SALES */}

      {activeSection === "sales" && (
        <div className="fms-panel">

          <div className="fms-panel-heading">
            <div>
              <h3>{t.salesTitle}</h3>
              <p>{t.salesDescription}</p>
            </div>

            <button
              type="button"
              className="fms-primary"
              onClick={() =>
                setShowSaleForm((value) => !value)
              }
            >
              <Plus size={17} />
              {showSaleForm ? t.close : t.recordSale}
            </button>
          </div>

          {showSaleForm && (
            <form
              className="fms-form"
              onSubmit={submitSale}
            >

              <label>
                {t.selectYourCrop} *
                <select
                  name="farmer_crop_id"
                  value={saleForm.farmer_crop_id}
                  onChange={handleSaleChange}
                  required
                >
                  <option value="">{t.selectCrop}</option>

                  {myCrops.map((crop) => (
                    <option
                      key={cropId(crop)}
                      value={cropId(crop)}
                    >
                      {cropName(crop, isBn)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                {t.quantity} *
                <input
                  name="quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={saleForm.quantity}
                  onChange={handleSaleChange}
                  required
                />
              </label>

              <label>
                {t.unit}
                <select
                  name="unit"
                  value={saleForm.unit}
                  onChange={handleSaleChange}
                >
                  <option value="KG">{getUnit("KG")}</option>
                  <option value="TON">{getUnit("TON")}</option>
                  <option value="BAG">{getUnit("BAG")}</option>
                  <option value="PIECE">{getUnit("PIECE")}</option>
                </select>
              </label>

              <label>
                {t.sellingPrice} *
                <input
                  name="unit_price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={saleForm.unit_price}
                  onChange={handleSaleChange}
                  required
                />
              </label>

              <label>
                {t.saleDate} *
                <input
                  name="sale_date"
                  type="date"
                  value={saleForm.sale_date}
                  onChange={handleSaleChange}
                  required
                />
              </label>

              <label>
                {t.buyerName}
                <input
                  name="buyer_name"
                  value={saleForm.buyer_name}
                  onChange={handleSaleChange}
                />
              </label>

              <label className="fms-full">
                {t.notes}
                <textarea
                  name="notes"
                  rows="2"
                  value={saleForm.notes}
                  onChange={handleSaleChange}
                />
              </label>

              <button
                className="fms-primary fms-full"
                type="submit"
                disabled={saving || myCrops.length === 0}
              >
                {saving ? t.saving : t.saveSale}
              </button>

            </form>
          )}

          {sales.length === 0 ? (
            <div className="fms-empty">
              <ShoppingBag size={35} />
              <h3>{t.noSales}</h3>
              <p>{t.noSalesDescription}</p>
            </div>
          ) : (
            <div className="fms-table-wrap">
              <table className="fms-table">
                <thead>
                  <tr>
                    <th>{t.crop}</th>
                    <th>{t.quantity}</th>
                    <th>{t.pricePerUnit}</th>
                    <th>{t.total}</th>
                    <th>{t.saleDate}</th>
                    <th>{t.buyer}</th>
                  </tr>
                </thead>

                <tbody>
                  {sales.map((sale, index) => (
                    <tr key={sale.id || index}>
                      <td>{cropName(sale, isBn)}</td>

                      <td>
                        {formatNumber(sale.quantity)}{" "}
                        {getUnit(sale.unit)}
                      </td>

                      <td>
                        {formatMoney(sale.unit_price)}
                      </td>

                      <td>
                        {formatMoney(sale.total_amount)}
                      </td>

                      <td>
                        {formatDate(sale.sale_date)}
                      </td>

                      <td>
                        {sale.buyer_name || "â€”"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* PROFIT & LOSS */}

      {activeSection === "profit" && (
        <div className="fms-panel">

          <div className="fms-panel-heading">
            <div>
              <h3>{t.profitTitle}</h3>
              <p>{t.profitDescription}</p>
            </div>
          </div>

          <div className="fms-summary">

            <div className="fms-summary-card">
              <ShoppingBag size={22} />
              <span>{t.totalRevenue}</span>
              <strong>{formatMoney(totalRevenue)}</strong>
            </div>

            <div className="fms-summary-card">
              <Wallet size={22} />
              <span>{t.totalExpenses}</span>
              <strong>{formatMoney(totalExpense)}</strong>
            </div>

            <div className="fms-summary-card">
              {totalProfit >= 0
                ? <TrendingUp size={22} />
                : <TrendingDown size={22} />}

              <span>
                {totalProfit >= 0 ? t.profit : t.loss}
              </span>

              <strong
                className={
                  totalProfit >= 0
                    ? "fms-positive"
                    : "fms-negative"
                }
              >
                {formatMoney(totalProfit)}
              </strong>
            </div>

          </div>

          {profitRows.length > 0 && (
            <div className="fms-table-wrap">
              <table className="fms-table">
                <thead>
                  <tr>
                    <th>{t.crop}</th>
                    <th>{t.cropRevenue}</th>
                    <th>{t.cropExpense}</th>
                    <th>{t.profitLoss}</th>
                  </tr>
                </thead>

                <tbody>
                  {profitRows.map((row, index) => {
                    const revenue = getRowRevenue(row);
                    const expense = getRowExpense(row);
                    const profit = getRowProfit(row);

                    return (
                      <tr
                        key={
                          row.farmer_crop_id ||
                          row.id ||
                          index
                        }
                      >
                        <td>{cropName(row, isBn)}</td>

                        <td>{formatMoney(revenue)}</td>

                        <td>{formatMoney(expense)}</td>

                        <td
                          className={
                            profit >= 0
                              ? "fms-positive"
                              : "fms-negative"
                          }
                        >
                          {formatMoney(profit)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <p className="fms-note">
            {t.salesNote} {t.profitNote}
          </p>

        </div>
      )}

    </section>
  );
}

export default FarmerMarketplaceSales;

