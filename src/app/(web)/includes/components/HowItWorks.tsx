const steps = [
  {
    number: "01",
    title: "Assess Your Needs",
    description:
      "We begin by understanding your specific goals and knowledge level, tailoring resources for TEAS/ HESI, RN/LPN, Exit Exams or NCLEX.",
    link: undefined,
  },
  {
    number: "02",
    title: "Choose the Right Materials",
    description:
      "Select from our extensive library of practice exams, study notes, and guides. We cover ATI/ HESI, Examplify, capstone with wide coverage in Medsurge, pediatrics, Pharmacology, and much more.",
    link: { label: "View Subscription Plans", href: "#exams" },
  },
  {
    number: "03",
    title: "Practice and Review",
    description:
      "Test yourself with our realistic practice exams, and review detailed explanations to improve and gain confidence.",
    link: { label: "Take a Free Practice Test", href: "/dashboards" },
  },
  {
    number: "04",
    title: "Track Your Progress",
    description:
      "Monitor improvements with performance tracking, helping you know when you're ready for the actual exams.",
    link: { label: "Access Your Dashboard", href: "/dashboards" },
  },
  {
    number: "05",
    title: "Ace Your Exams",
    description:
      "With proper preparation, ace your exams and move closer to your nursing career goals. We're with you all the way!",
    link: undefined,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-12 md:py-16">
      <div className="mx-auto w-full max-w-[1600px] px-4 md:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block font-mono text-xs tracking-widest uppercase text-sage mb-3">
            How We Help You Succeed
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-navy tracking-tight">
            From Entrance to NCLEX
          </h2>
          <p className="mt-4 text-navy/60 leading-relaxed">
            A proven five-step path that takes you from baseline to exam day
            with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 mb-16">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-5">
              <span className="shrink-0 font-serif text-4xl font-semibold text-coral/30 leading-none mt-1">
                {step.number}
              </span>
              <div>
                <h3 className="font-serif text-lg font-semibold text-navy mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-navy/60 leading-relaxed mb-2">
                  {step.description}
                </p>
                {step.link && (
                  <a
                    href={step.link.href}
                    className="inline-block text-sm font-medium text-sage hover:text-sage-light transition-colors"
                  >
                    {step.link.label} &rarr;
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
