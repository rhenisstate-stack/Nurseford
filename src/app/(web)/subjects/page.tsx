"use client";

import { Suspense } from "react";
import SubjectsCatalogView from "./SubjectsCatalogView";

export default function SubjectsPage() {
  return (
    <Suspense fallback={null}>
      <SubjectsCatalogView />
    </Suspense>
  );
}
