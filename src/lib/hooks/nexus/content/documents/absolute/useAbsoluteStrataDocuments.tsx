'use client';

import { useEffect, useState } from "react";
import { strataService } from "@/lib/services/nexus/strata/strataService";

export interface StrataItem {
  id: number;
  name: string;
}

export const useAbsoluteStrataDocuments = () => {
  const [documents, setDocuments] = useState<StrataItem[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<StrataItem[]>([]);
  const [documentSearch, setDocumentSearch] = useState('');
  const FETCH_TYPE = 'AbsoluteFetch';

  // Fetch documents from backend
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        console.log("🚀 [useAbsoluteStrataDocuments] Fetching Documents . . . ");

        const result = await strataService<StrataItem[]>("Course", FETCH_TYPE);

        console.log("📥 [useAbsoluteStrataDocuments] Raw result:", result);
        console.log("📦 [useAbsoluteStrataDocuments] result.data:", result?.data);
        console.log(
          "🔢 [useAbsoluteStrataDocuments] Count:",
          Array.isArray(result?.data) ? result.data.length : "Not an array"
        );

        if (Array.isArray(result?.data)) {
          console.log(
            "🧪 [useAbsoluteStrataDocuments] First 3 items:",
            result.data.slice(0, 3)
          );
        }

        if (result?.error) {
          throw new Error(result.error);
        }

        const data = result?.data ?? [];

        setDocuments(data);
        setFilteredDocuments(data.slice(0, 20));

      } catch (err) {
        console.error("❌ [useAbsoluteStrataDocuments] Failed to fetch documents:", err);
        setDocuments([]);
        setFilteredDocuments([]);
      }
    };

    fetchDocuments();
  }, []);

  // Filter documents when search changes
  useEffect(() => {
    const filtered = documents
      .filter(course =>
        course.name?.toLowerCase().includes(documentSearch.toLowerCase())
      )
      .slice(0, 20);

    console.log(
      `🔍 [useAbsoluteStrataDocuments] Filtered ${filtered.length} documents for search: "${documentSearch}"`
    );

    setFilteredDocuments(filtered);
  }, [documentSearch, documents]);

  return {
    documents,
    filteredDocuments,
    documentSearch,
    setDocumentSearch,
  };
};
