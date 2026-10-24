"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiArrowLeft, FiSave, FiUser } from "react-icons/fi";
import { useFlexPageClasp } from "@/lib/contexts/panel/layout/utils/FlexPageClasp";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";

const CURRENT_PANEL = "ati-teas";

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

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase font-bold opacity-50 tracking-wide text-[var(--text-color)]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-[var(--text-color)]/20 bg-[var(--content-bg)] px-3 py-2 text-sm text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase font-bold opacity-50 tracking-wide text-[var(--text-color)]">
        {label}
      </span>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="mt-1 w-full rounded-lg border border-[var(--text-color)]/20 bg-[var(--content-bg)] px-3 py-2 text-sm text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-indigo-400/50 resize-none"
      />
    </label>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export default function ProfileEditPage() {
  const { leftWidth, rightWidth, navHeight } = useFlexPageClasp();
  const { user, loading } = useCurrentSystemUser();

  const [form, setForm] = useState<ProfileFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string; ok: boolean } | null>(null);

  // Seed the form once the user loads
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

  const updateField = (key: keyof ProfileFormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      // ⚠️ ASSUMPTION: swap this stub for your real service call, e.g.:
      // const result = await updateCurrentUserProfile(form);
      // if (result?.error) throw new Error(result.error);
      await new Promise((resolve) => setTimeout(resolve, 400)); // simulated latency

      setSaveMessage({ text: "Profile updated successfully ⚓", ok: true });
    } catch (err) {
      console.error("❌ [ProfileEditPage] Failed to save profile:", err);
      setSaveMessage({ text: "Failed to update profile. Please try again.", ok: false });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main
        className="pt-14 flex items-center justify-center"
        style={{ marginLeft: leftWidth, marginRight: rightWidth, minHeight: `calc(100vh - ${navHeight}px)` }}
      >
        <p className="text-sm font-bold opacity-60 text-[var(--text-color)]">Loading profile . . . ⚓</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main
        className="pt-14 flex flex-col items-center justify-center gap-4 text-center px-4"
        style={{ marginLeft: leftWidth, marginRight: rightWidth, minHeight: `calc(100vh - ${navHeight}px)` }}
      >
        <p className="text-sm font-bold opacity-70 text-[var(--text-color)]">
          You need to be signed in to edit your profile.
        </p>
        <Link
          href={`/dashboards/${CURRENT_PANEL}/auth/login`}
          className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:scale-105 transition-transform"
        >
          Log In
        </Link>
      </main>
    );
  }

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
      <div className="p-3 md:p-4 space-y-5 w-full max-w-7xl mx-auto">

        {/* ─────────────────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <Link
            href={`/dashboards/${CURRENT_PANEL}/auth/account/show`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold opacity-60 hover:opacity-100 text-[var(--text-color)] transition-opacity"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            Back to Profile
          </Link>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-[var(--text-color)]/15 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-xl px-5 py-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="h-20 w-20 rounded-full overflow-hidden bg-gradient-to-br from-emerald-200 via-indigo-200 to-cyan-200 flex items-center justify-center shrink-0">
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-lg md:text-xl font-bold text-[var(--text-color)]">Edit Profile</h1>
            <p className="text-xs opacity-60 text-[var(--text-color)]">
              {user.userName} · {user.email}
            </p>
            <p className="text-[10px] opacity-50 text-[var(--text-color)] mt-1">
              Profile picture is pulled automatically from Gravatar based on your email — upload support isn&apos;t wired up yet.
            </p>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-[var(--text-color)]/15 bg-[var(--content-bg)] p-4 md:p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <FiUser className="w-4 h-4 text-[var(--text-color)] opacity-70" />
            <h2 className="text-sm font-bold text-[var(--text-color)]">Personal Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Gender" value={form.gender} onChange={updateField("gender")} placeholder="e.g. Female" />
            <Field label="Date of Birth" type="date" value={form.dateOfBirth} onChange={updateField("dateOfBirth")} />
            <Field label="Ethnicity" value={form.ethnicity} onChange={updateField("ethnicity")} />
            <Field label="Race" value={form.race} onChange={updateField("race")} />
            <Field label="Religion" value={form.religion} onChange={updateField("religion")} />
            <Field label="Language" value={form.language} onChange={updateField("language")} placeholder="e.g. English" />
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--text-color)]/15 bg-[var(--content-bg)] p-4 md:p-5 space-y-4">
          <h2 className="text-sm font-bold text-[var(--text-color)]">About You</h2>
          <Field label="Website" value={form.website} onChange={updateField("website")} placeholder="https://" />
          <TextAreaField label="Bio" value={form.bio} onChange={updateField("bio")} placeholder="A short line about yourself" />
          <TextAreaField label="About" value={form.about} onChange={updateField("about")} placeholder="More detail about your background" />
        </div>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3">
          {saveMessage && (
            <p className={`text-xs font-semibold ${saveMessage.ok ? "text-emerald-600" : "text-rose-600"}`}>
              {saveMessage.text}
            </p>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="ml-auto inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            <FiSave className="w-4 h-4" />
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>

      </div>
    </main>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  SkewBlanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────