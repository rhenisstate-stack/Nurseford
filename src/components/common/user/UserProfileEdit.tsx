"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  FileText,
  Globe,
  Calendar,
  Save,
  Info,
} from "lucide-react";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { updateCurrentUserProfile } from "@/lib/services/auth/supportService";

interface UserProfileEditProps {
  currentDashboard?: string;
}

interface ProfileFormState {
  gender: string;
  ethnicity: string;
  race: string;
  religion: string;
  language: string;
  dateOfBirth: string;
  bio: string;
  website: string;
  about: string;
}

const EMPTY_FORM: ProfileFormState = {
  gender: "",
  ethnicity: "",
  race: "",
  religion: "",
  language: "",
  dateOfBirth: "",
  bio: "",
  website: "",
  about: "",
};

export default function UserProfileEdit({
  currentDashboard = "rn-nursing",
}: UserProfileEditProps) {
  const router = useRouter();
  const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();
  const { user, loading, refetch } = useCurrentSystemUser();

  const [form, setForm] = useState<ProfileFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [avatarBroken, setAvatarBroken] = useState(false);

  const panel = currentDashboard.toLowerCase();

  // Populate form with existing user profile details
  useEffect(() => {
    if (!user?.profile) return;
    setForm({
      gender: user.profile.gender ?? "",
      ethnicity: user.profile.ethnicity ?? "",
      race: user.profile.race ?? "",
      religion: user.profile.religion ?? "",
      language: user.profile.language ?? "",
      dateOfBirth: user.profile.dateOfBirth ? user.profile.dateOfBirth.slice(0, 10) : "",
      bio: user.profile.bio ?? "",
      website: user.profile.website ?? "",
      about: user.profile.about ?? "",
    });
  }, [user]);

  const updateField = (key: keyof ProfileFormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (saveMessage) setSaveMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);

    try {
      const result = await updateCurrentUserProfile(form);
      if (result && typeof result === "object" && "error" in result && result.error) {
        throw new Error(String(result.error));
      }

      if (refetch) {
        try {
          await refetch();
        } catch {
          // ignore refetch errors
        }
      }

      setSaveMessage({ text: "Profile details updated successfully.", ok: true });
    } catch (err: unknown) {
      console.error("[UserProfileEdit] Failed to save profile:", err);
      const msg = err instanceof Error ? err.message : "Failed to update profile. Please try again.";
      setSaveMessage({ text: msg, ok: false });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main
        className="pt-14 flex items-center justify-center"
        style={{
          marginLeft: leftWidth,
          marginRight: rightWidth,
          minHeight: `calc(100vh - ${navHeight}px)`,
          backgroundColor: "var(--content-bg)",
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Loading profile details...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main
        className="pt-14 flex flex-col items-center justify-center gap-4 text-center px-4"
        style={{
          marginLeft: leftWidth,
          marginRight: rightWidth,
          minHeight: `calc(100vh - ${navHeight}px)`,
          backgroundColor: "var(--content-bg)",
        }}
      >
        <div className="p-8 max-w-md w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1E293B] shadow-xs text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <User className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-lg font-bold text-navy dark:text-white">
            Sign In Required
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            You need to be signed in to edit your PubNurse profile.
          </p>
          <div className="flex flex-col gap-2.5 w-full pt-1">
            <Link
              href={`/dashboards/${panel}/auth/login`}
              className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl font-semibold text-xs bg-[#0A2540] hover:bg-teal-700 text-white transition-all shadow-2xs"
            >
              Log In to Your Account
            </Link>
            <Link
              href={`/dashboards/${panel}`}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl font-semibold text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-teal-600" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const avatarSrc =
    !avatarBroken && user.profile?.profilePicture ? user.profile.profilePicture : null;
  const userName = user.userName || user.email || "Learner";
  const userInitial = userName[0]?.toUpperCase() || "L";
  const access = user.accesses?.[0];
  const topRole = user.roles?.length
    ? [...user.roles].sort((a, b) => b.rank - a.rank)[0]?.name ?? "Learner"
    : "Learner";

  return (
    <main
      className="pt-14 transition-all duration-300 ease-in-out overflow-x-hidden"
      style={{
        marginLeft: leftWidth,
        marginRight: rightWidth,
        minHeight: `calc(100vh - ${navHeight}px)`,
        backgroundColor: "var(--content-bg)",
        color: "var(--content-text)",
      }}
    >
      <div className="p-3 sm:p-5 md:p-6 space-y-5 w-full max-w-4xl mx-auto">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/dashboards/${panel}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1E293B] text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-navy dark:hover:text-white shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-teal-600" />
            <span>Back to Dashboard</span>
          </Link>
          <Link
            href={`/dashboards/${panel}/auth/account/show`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1E293B] text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-navy dark:hover:text-white shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <span>Back to Profile</span>
          </Link>
        </div>

        {/* Profile Header Summary Card */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1E293B] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
          <div className="h-16 w-16 rounded-2xl overflow-hidden bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-center font-bold text-2xl shadow-2xs shrink-0">
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt={userName}
                width={64}
                height={64}
                className="h-full w-full object-cover"
                onError={() => setAvatarBroken(true)}
                unoptimized
              />
            ) : (
              userInitial
            )}
          </div>

          <div className="text-center sm:text-left flex-1 min-w-0">
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-navy dark:text-white truncate">
              Edit Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
              {user.userName} · {user.email}
            </p>

            <div className="mt-2.5 flex flex-wrap gap-2 justify-center sm:justify-start">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  access?.isActive !== false
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60"
                    : "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60"
                }`}
              >
                {access?.isActive !== false ? "Active Account" : "Inactive Account"}
              </span>

              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60">
                {topRole}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2.5 flex items-center justify-center sm:justify-start gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span>Avatar is automatically synced from your Gravatar account email.</span>
            </p>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-5">
          {/* Section 1: Personal Details */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1E293B] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 flex items-center justify-center text-teal-700 dark:text-teal-300 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif text-sm sm:text-base font-bold text-navy dark:text-white">
                  Personal Information
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                  Manage your demographic and identity details.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-navy dark:text-white mb-1.5">
                  Gender
                </label>
                <select
                  value={form.gender}
                  onChange={(e) => updateField("gender")(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-3.5 py-2 text-xs sm:text-sm text-navy dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#1E293B] focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-2xs cursor-pointer"
                >
                  <option value="">Select Gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy dark:text-white mb-1.5">
                  Date of Birth
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => updateField("dateOfBirth")(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-3.5 py-2 text-xs sm:text-sm text-navy dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#1E293B] focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-2xs cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy dark:text-white mb-1.5">
                  Primary Language
                </label>
                <input
                  type="text"
                  value={form.language}
                  onChange={(e) => updateField("language")(e.target.value)}
                  placeholder="e.g. English, Spanish"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-3.5 py-2 text-xs sm:text-sm text-navy dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#1E293B] focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy dark:text-white mb-1.5">
                  Ethnicity
                </label>
                <input
                  type="text"
                  value={form.ethnicity}
                  onChange={(e) => updateField("ethnicity")(e.target.value)}
                  placeholder="e.g. Hispanic, Non-Hispanic"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-3.5 py-2 text-xs sm:text-sm text-navy dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#1E293B] focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy dark:text-white mb-1.5">
                  Race
                </label>
                <input
                  type="text"
                  value={form.race}
                  onChange={(e) => updateField("race")(e.target.value)}
                  placeholder="e.g. Asian, Black, White"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-3.5 py-2 text-xs sm:text-sm text-navy dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#1E293B] focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy dark:text-white mb-1.5">
                  Religion
                </label>
                <input
                  type="text"
                  value={form.religion}
                  onChange={(e) => updateField("religion")(e.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-3.5 py-2 text-xs sm:text-sm text-navy dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#1E293B] focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Bio & Professional Background */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1E293B] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-center text-blue-700 dark:text-blue-300 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif text-sm sm:text-base font-bold text-navy dark:text-white">
                  About & Background
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                  Share your clinical interests, educational background, or personal website.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-navy dark:text-white mb-1.5">
                  Website / Portfolio
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => updateField("website")(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 pl-10 pr-3.5 py-2 text-xs sm:text-sm text-navy dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#1E293B] focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy dark:text-white mb-1.5">
                  Short Bio
                </label>
                <textarea
                  rows={2}
                  value={form.bio}
                  onChange={(e) => updateField("bio")(e.target.value)}
                  placeholder="A brief headline about your nursing specialty or academic goals..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs sm:text-sm text-navy dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#1E293B] focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-2xs resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy dark:text-white mb-1.5">
                  About You
                </label>
                <textarea
                  rows={4}
                  value={form.about}
                  onChange={(e) => updateField("about")(e.target.value)}
                  placeholder="More detail regarding your clinical experience, exam preparation timeline, or study approach..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs sm:text-sm text-navy dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-[#1E293B] focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all shadow-2xs resize-none"
                />
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div>
              {saveMessage && (
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                    saveMessage.ok
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60"
                      : "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60"
                  }`}
                >
                  {saveMessage.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  )}
                  <span>{saveMessage.text}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5 ml-auto w-full sm:w-auto justify-end">
              <Link
                href={`/dashboards/${panel}/auth/account/show`}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-xl font-semibold text-xs sm:text-sm bg-[#0A2540] hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 text-white shadow-2xs transition-all duration-200 cursor-pointer disabled:opacity-50 active:scale-95"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
