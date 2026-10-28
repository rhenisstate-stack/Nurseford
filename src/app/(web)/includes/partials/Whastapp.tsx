'use client';

const WHATSAPP_NUMBER = '14242349779'; // country code + number, digits only
const WHATSAPP_MESSAGE = 'Hello, I need help with my exam preparation.';

export default function Whastapp() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-300"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-current" aria-hidden="true">
        <path d="M16.002 3C8.82 3 3 8.82 3 16c0 2.294.6 4.53 1.74 6.5L3 29l6.68-1.72A12.94 12.94 0 0 0 16.002 29C23.18 29 29 23.18 29 16S23.18 3 16.002 3zm0 23.8c-1.99 0-3.94-.54-5.64-1.55l-.4-.24-3.96 1.02 1.06-3.86-.26-.4A10.77 10.77 0 0 1 5.2 16c0-5.96 4.85-10.8 10.8-10.8S26.8 10.04 26.8 16 21.96 26.8 16.002 26.8zm5.92-8.08c-.32-.16-1.92-.95-2.22-1.06-.3-.1-.52-.16-.74.16-.22.32-.85 1.06-1.04 1.28-.19.22-.38.24-.7.08-.32-.16-1.37-.5-2.6-1.6-.96-.86-1.6-1.9-1.8-2.22-.19-.32-.02-.5.14-.66.14-.14.32-.38.48-.57.16-.19.22-.32.32-.54.1-.22.05-.4-.03-.57-.08-.16-.74-1.78-1.01-2.44-.27-.64-.54-.55-.74-.56h-.63c-.22 0-.57.08-.87.4-.3.32-1.14 1.11-1.14 2.7s1.17 3.14 1.33 3.36c.16.22 2.3 3.5 5.56 4.92.78.34 1.38.54 1.85.69.78.25 1.49.21 2.05.13.63-.09 1.92-.78 2.19-1.54.27-.76.27-1.4.19-1.54-.08-.14-.3-.22-.62-.38z" />
      </svg>
    </a>
  );
}