import ContactForm from "./contact-form";
import BrandText from "../BrandText";

const contactMethods = [
  {
    icon: "📞",
    title: "Call Us",
    details: [
      { type: "tel" as const, value: "+1 (870) 259-6083", href: "tel:+18702596083" },
    ],
  },
  {
    icon: "✉️",
    title: "Email Us",
    details: [
      { type: "mailto" as const, value: "support@rhenisnursing.com", href: "mailto:support@rhenisnursing.com" },
    ],
  },
];

export default function ContactUs() {
  return (
    <section id="contact" className="py-12 md:py-16">
      <div className="mx-auto w-full max-w-[1600px] px-4 md:px-6 lg:px-8">
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block font-mono text-xs tracking-widest uppercase text-sage mb-3">
            Get in Touch
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-navy tracking-tight">
            Contact Us
          </h2>
          <p className="mt-4 text-navy/60 leading-relaxed">
            <BrandText text="Unlock Your Potential in Healthcare Education with Rhenis Nursing! Rhenis Nursing helps support you in comprehending the complexities of healthcare education and giving personalized guidance to help you excel academically." />
          </p>
        </div>

        {/* Contact info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {contactMethods.map((method) => (
            <article
              key={method.title}
              className="rounded-2xl border border-black/50 dark:border-border bg-paper p-7 md:p-8 transition-colors hover:border-border-light"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl" aria-hidden="true">
                  {method.icon}
                </span>
                <h3 className="font-serif text-xl font-semibold text-navy">
                  {method.title}
                </h3>
              </div>
              <ul className="space-y-2">
                {method.details.map((detail, i) => (
                  <li key={i}>
                    {detail.href ? (
                      <a
                        href={detail.href}
                        className="text-sm text-navy/60 hover:text-coral transition-colors"
                      >
                        {detail.value}
                      </a>
                    ) : (
                      <span className="text-sm text-navy/60">
                        {detail.value}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {/* Contact form */}
        <div className="max-w-2xl mx-auto">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
