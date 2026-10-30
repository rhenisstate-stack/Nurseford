import { Fragment } from "react";

const BRAND = "NurseFord";

export default function BrandText({ text }: { text: string }) {
  const parts = text.split(BRAND);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < parts.length - 1 && (
            <span className="font-medium text-[#1d4ed8] dark:text-[#38bdf8]">{BRAND}</span>
          )}
        </Fragment>
      ))}
    </>
  );
}
