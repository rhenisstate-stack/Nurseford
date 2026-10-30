// frontend/src/lib/config/config.ts
// Centralized config using environment variables with fallbacks

// -----------------------------------------------------------------------------
// APP INFO
// -----------------------------------------------------------------------------
export const APP_NAME = process.env.SKEW_LINE_APP_NAME || "NurseFord";
export const APP_TITLE = process.env.SKEW_LINE_APP_TITLE || "NurseFord";
export const APP_ACRONYM = process.env.SKEW_LINE_APP_ACRONNYM || "NF";
export const APP_DESCRIPTION = process.env.SKEW_LINE_APP_DESCRIPTION || "Nursing Exam Preparation and Practice Platform";
export const APP_VERSION = process.env.SKEW_LINE_APP_VERSION || "1.0.0";
export const APP_ENV = process.env.SKEW_LINE_APP_ENV || "live";
export const APP_DEBUG = process.env.SKEW_LINE_APP_DEBUG === "true";
export const APP_TIMEZONE = process.env.SKEW_LINE_APP_TIMEZONE || "UTC";
export const APP_LOCALE = process.env.SKEW_LINE_APP_LOCALE || "en";
export const APP_DOMAIN = process.env.SKEW_LINE_APP_DOMAIN || "http://localhost:3000";
export const APP_KEY = process.env.SKEW_LINE_APP_KEY || "WEBSITE_1";

// -----------------------------------------------------------------------------
// CONTACT & SOCIAL MEDIA
// -----------------------------------------------------------------------------
export const CONTACT = {
  AREA: process.env.SKEW_LINE_APP_AREA || "",
  ADDRESS: process.env.SKEW_LINE_APP_ADDRESS || "",
  TELLUNO: process.env.SKEW_LINE_APP_TELLUNO || "",
  PHONEUNO: process.env.SKEW_LINE_APP_PHONEUNO || "",
  TELTOS: process.env.SKEW_LINE_APP_TELTOS || "",
  PHONETOS: process.env.SKEW_LINE_APP_PHONETOS || "",
  EMAILUNO: process.env.SKEW_LINE_APP_EMAILUNO || "",
  EMAILTOS: process.env.SKEW_LINE_APP_EMAILTOS || "",
  WHATSAPP: process.env.SKEW_LINE_APP_WHATSAPP || "",
  INSTAGRAM: process.env.SKEW_LINE_APP_INSTAGRAM || "",
  FACEBOOK: process.env.SKEW_LINE_APP_FACEBOOK || "",
  TWITTER: process.env.SKEW_LINE_APP_TWITTER || "",
  LINKEDIN: process.env.SKEW_LINE_APP_LINKEDIN || "",
  TELEGRAM: process.env.SKEW_LINE_APP_TELEGRAM || "",
  TIKTOK: process.env.SKEW_LINE_APP_TIKTOK || "",
  REDDIT: process.env.SKEW_LINE_APP_REDDIT || "",
  YOUTUBE: process.env.SKEW_LINE_APP_YOUTUBE || "",
  PINTEREST: process.env.SKEW_LINE_APP_PINTEREST || "",
  WECHAT: process.env.SKEW_LINE_APP_WECHAT || "",
  DISCORD: process.env.SKEW_LINE_APP_DISCORD || "",
  GITHUB: process.env.SKEW_LINE_APP_GITHUB || "",
  MEDIUM: process.env.SKEW_LINE_APP_MEDIUM || "",
  SNAPCHAT: process.env.SKEW_LINE_APP_SNAPCHAT || "",
  SLACK: process.env.SKEW_LINE_APP_SLACK || "",
  CANONICALLINK: process.env.SKEW_LINE_APP_CANONICALLINK || "",
  DEVELOPER: process.env.SKEW_LINE_APP_DEVELOPER || "",
  DEVLINK: process.env.SKEW_LINE_APP_DEVLINK || "",
  SENDWHATSAPP: process.env.SKEW_LINE_APP_SENDWHATSAPP || "",
};

// -----------------------------------------------------------------------------
// EMAILS CONFIGURATION
// -----------------------------------------------------------------------------
export const EMAILS = {
  SUPPORT: process.env.SKEW_LINE_SUPPORT_EMAIL || "support@nurseford.com",
  SYSTEM: process.env.SKEW_LINE_SYSTEM_EMAIL || "support@nurseford.com",
  HELP: process.env.SKEW_LINE_HELP_EMAIL || "support@nurseford.com",
};

// -----------------------------------------------------------------------------
// PHONE NUMBERS CONFIGURATION
// -----------------------------------------------------------------------------
export const PHONES = {
  TELL: process.env.SKEW_LINE_TELL_PHONE || "",
  SUPPORT: process.env.SKEW_LINE_SUPPORT_PHONE || "",
  HELP: process.env.SKEW_LINE_HELP_PHONE || "",
};

// -----------------------------------------------------------------------------
// BACKEND API CONFIGURATION
// -----------------------------------------------------------------------------
export const BACKEND = {
  ACTIVE: process.env.SKEW_LINE_ACTIVE_BACKEND || "dotnet",
  LARAVEL_URL: (process.env.SKEW_LINE_LARAVEL_BASE_URL || "").split(","),
  FASTAPI_URL: (process.env.SKEW_LINE_FASTAPI_BASE_URL || "").split(","),
  DOTNET_URL: (process.env.SKEW_LINE_DOTNET_BASE_URL || "").split(","),
};

// -----------------------------------------------------------------------------
// DEVELOPER INFO
// -----------------------------------------------------------------------------
export const DEVELOPER = {
  NAME: process.env.SKEW_LINE_DEVELOPER_NAME || "",
  PHONE: process.env.SKEW_LINE_DEVELOPER_PHONE || "",
  EMAIL: process.env.SKEW_LINE_DEVELOPER_EMAIL || "",
  WEBSITE: process.env.SKEW_LINE_DEVELOPER_WEBSITE || "",
  GITHUB: process.env.SKEW_LINE_DEVELOPER_GITHUB || "",
};

// -----------------------------------------------------------------------------
// SEO CONFIG
// -----------------------------------------------------------------------------
export const SEO = {
  author: DEVELOPER.NAME || "NurseFord",
  keywords: "Nursing, Nursing Exams, TEAS 7 Prep, HESI A2, NCLEX, RN, LPN, CNA, GED, Exam Prep, Study Resources",
  ogImage: `${CONTACT.CANONICALLINK || "https://nurseford.com"}/images/og-banner.jpg`,
  siteUrl: CONTACT.CANONICALLINK || "https://nurseford.com",
};
