"use client";

import { useState, type FormEvent } from "react";

interface FormData {
  name: string;
  email: string;
  phoneCode: string;
  phoneNumber: string;
  subject: string;
  message: string;
}

const initialFormData: FormData = {
  name: "",
  email: "",
  phoneCode: "+1",
  phoneNumber: "",
  subject: "",
  message: "",
};

const countryCodes = [
  { code: "+1", label: "US (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+254", label: "KE (+254)" },
  { code: "+91", label: "IN (+91)" },
  { code: "+61", label: "AU (+61)" },
  { code: "+234", label: "NG (+234)" },
  { code: "+27", label: "ZA (+27)" },
  { code: "+971", label: "AE (+971)" },
  { code: "+1", label: "CA (+1)" },
];

const inputBase =
  "w-full rounded-xl border border-border bg-paper-dim px-4 py-3 text-sm text-navy placeholder:text-navy/40 outline-none transition-colors focus:border-coral";

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-black/50 dark:border-border bg-paper p-8 md:p-10 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h3 className="font-serif text-xl font-semibold text-navy mb-2">
          Message Sent!
        </h3>
        <p className="text-sm text-navy/60 leading-relaxed">
          Thank you for reaching out. We&apos;ll get back to you within 24
          hours.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setFormData(initialFormData);
          }}
          className="mt-6 inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-semibold text-[#0c1929] bg-coral hover:bg-coral-hover transition-colors"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-black/50 dark:border-border bg-paper p-7 md:p-10 space-y-5"
    >
      <h3 className="font-serif text-xl font-semibold text-navy mb-1">
        Send Us a Message
      </h3>
      <p className="text-sm text-navy/60 leading-relaxed mb-4">
        Fill out the form below and our team will respond as soon as possible.
      </p>

      {/* Name */}
      <div>
        <label
          htmlFor="contact-name"
          className="block font-mono text-xs tracking-wider uppercase text-navy/50 mb-1.5"
        >
          Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleChange}
          placeholder="Your full name"
          className={inputBase}
        />
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="contact-email"
          className="block font-mono text-xs tracking-wider uppercase text-navy/50 mb-1.5"
        >
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          className={inputBase}
        />
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="contact-phone"
          className="block font-mono text-xs tracking-wider uppercase text-navy/50 mb-1.5"
        >
          Phone Number
        </label>
        <div className="flex gap-2">
          <select
            name="phoneCode"
            value={formData.phoneCode}
            onChange={handleChange}
            className="shrink-0 w-[120px] rounded-xl border border-border bg-paper-dim px-3 py-3 text-sm text-navy outline-none transition-colors focus:border-coral"
          >
            {countryCodes.map((c) => (
              <option key={c.code + c.label} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
          <input
            id="contact-phone"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Phone number"
            className={inputBase}
          />
        </div>
      </div>

      {/* Subject */}
      <div>
        <label
          htmlFor="contact-subject"
          className="block font-mono text-xs tracking-wider uppercase text-navy/50 mb-1.5"
        >
          Subject
        </label>
        <select
          id="contact-subject"
          name="subject"
          required
          value={formData.subject}
          onChange={handleChange}
          className={inputBase}
        >
          <option value="" disabled>
            Select a topic…
          </option>
          <optgroup label="Exam & Study Materials Support">
            <option value="request-study-materials">
              🏷️ Request Study Materials
            </option>
            <option value="help-difficult-topics">
              🏷️ Help with Difficult Topics
            </option>
            <option value="extended-access">
              🏷️ Extended Access to Practice Questions
            </option>
            <option value="mock-exam-feedback">
              🏷️ Mock Exam Feedback
            </option>
            <option value="study-recommendations">
              🏷️ Study Resource Recommendations
            </option>
          </optgroup>
          <optgroup label="Technical Support">
            <option value="login-issues">🔰 Account Login Issues</option>
            <option value="bug-report">🔰 Website/App Bug Report</option>
            <option value="feature-request">🔰 Feature Request</option>
          </optgroup>
          <optgroup label="Content Requests">
            <option value="more-practice-questions">
              ✔️ More Content Request on Practice Questions
            </option>
            <option value="case-studies">
              ✔️ Case Studies/Clinical Scenarios
            </option>
            <option value="custom-study-plan">✔️ Custom Study Plan</option>
          </optgroup>
          <optgroup label="Billing & Subscriptions">
            <option value="payment-issue">💸 Payment/Subscription Issue</option>
            <option value="refund-request">💸 Refund Request</option>
            <option value="upgrade-plan">💸 Upgrade/Downgrade Plan</option>
          </optgroup>
        </select>
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="contact-message"
          className="block font-mono text-xs tracking-wider uppercase text-navy/50 mb-1.5"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          value={formData.message}
          onChange={handleChange}
          placeholder="Tell us how we can help…"
          className={`${inputBase} resize-y min-h-[120px]`}
        />
      </div>

      <button
        type="submit"
        className="w-full inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-semibold text-[#0c1929] bg-coral hover:bg-coral-hover transition-colors"
      >
        Send Message
      </button>
    </form>
  );
}
