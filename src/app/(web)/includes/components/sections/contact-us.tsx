"use client";

import ContactForm from "./contact-form";
import BrandText from "../BrandText";
import { PhoneCall, Mail, Headphones, Clock, Sparkles } from "lucide-react";

const contactMethods = [
  {
    icon: PhoneCall,
    iconColor: "text-teal-600 dark:text-[#2FD9C4]",
    iconBg: "bg-teal-500/10 dark:bg-teal-500/15 border-teal-500/30",
    title: "Call Direct Support",
    subtitle: "Speak with an advisor",
    details: [
      { type: "tel" as const, value: "+1 (870) 259-6083", href: "tel:+18702596083" },
    ],
  },
  {
    icon: Mail,
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-500/10 dark:bg-blue-500/15 border-blue-500/30",
    title: "Email Support Desk",
    subtitle: "Fast response within 24h",
    details: [
      { type: "mailto" as const, value: "support@pubnurse.com", href: "mailto:support@pubnurse.com" },
    ],
  },
  {
    icon: Clock,
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/30",
    title: "Operating Hours",
    subtitle: "Dedicated academic support",
    details: [
      { type: "text" as const, value: "Mon – Sat: 8:00 AM – 8:00 PM EST" },
    ],
  },
];

export default function ContactUs() {
  return (
    <section id="contact" className="py-8 md:py-10" style={{ backgroundColor: "var(--content-bg)" }}>
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 md:px-10 lg:px-14 xl:px-18">
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-[#2FD9C4] text-xs font-mono font-bold tracking-widest uppercase mb-3">
            <Headphones className="w-3.5 h-3.5" />
            <span>Get in Touch</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-navy dark:text-white tracking-tight leading-tight">
            We Are Here to Support You
          </h2>

          <p className="mt-3.5 text-sm sm:text-base text-navy/65 dark:text-white/65 leading-relaxed">
            <BrandText text="Unlock your potential in nursing education with PubNurse. Have questions about our Q-Banks, Exit Exam predictors, or study packs? Reach out to our team." />
          </p>
        </div>

        {/* Contact info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-5xl mx-auto mb-6 sm:mb-8">
          {contactMethods.map((method) => {
            const Icon = method.icon;
            return (
              <article
                key={method.title}
                className="rounded-2xl border-2 border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#1E293B] p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`inline-flex items-center justify-center w-11 h-11 rounded-2xl border ${method.iconBg} ${method.iconColor} shrink-0`}
                    >
                      <Icon className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-serif text-base sm:text-lg font-bold text-navy dark:text-white leading-tight">
                        {method.title}
                      </h3>
                      <p className="text-[11px] text-navy/50 dark:text-white/50">
                        {method.subtitle}
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-1.5 mt-2">
                    {method.details.map((detail, i) => (
                      <li key={i}>
                        {"href" in detail && detail.href ? (
                          <a
                            href={detail.href}
                            className="text-xs sm:text-sm font-semibold text-teal-700 dark:text-[#2FD9C4] hover:underline transition-colors break-words"
                          >
                            {detail.value}
                          </a>
                        ) : (
                          <span className="text-xs sm:text-sm text-navy/70 dark:text-white/70 font-medium">
                            {detail.value}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>

        {/* Contact form */}
        <div className="max-w-2xl mx-auto">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
