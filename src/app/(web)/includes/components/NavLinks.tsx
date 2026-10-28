import Link from "next/link";

const links = [
  { href: "#exams", label: "Exam Tracks" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#faq", label: "FAQ" },
];

interface NavLinksProps {
  mobile?: boolean;
  onClick?: () => void;
}

export function NavLinks({ mobile = false, onClick }: NavLinksProps) {
  return (
    <>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onClick}
          className={
            mobile
              ? "block px-3 py-2.5 rounded-lg text-sm font-medium text-navy hover:bg-paper transition-colors"
              : "text-sm font-medium text-navy/70 hover:text-navy transition-colors"
          }
        >
          {link.label}
        </Link>
      ))}
    </>
  );
}
