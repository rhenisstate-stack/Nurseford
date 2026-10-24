'use client';

import { useEffect, useState } from "react";
import { strataService } from "@/lib/services/nexus/strata/strataService";

export interface StrataItem {
  id: number;
  guid_id: string;

  // hierarchy
  exam_id: number;
  section_id: number;

  // file
  file_name: string;
  file_path: string;
  file_description: string;
  file_tag: string;
  file_size: number;

  // metadata
  target: string;
  type: string;
  status: string;
  segment: string;
  fragment: string;
  link: string;
  weight: number;

  // timestamps
  created_at: string;
  updated_at: string | null;
}

export const useDistinctStrataDocuments = (sectionId?: number) => {

  // 👇 LOG IMMEDIATELY WHEN HOOK IS CALLED
  console.log(
    '🧠 [useDistinctStrataDocuments] Hook invoked with sectionId:',
    sectionId
  );

  const [documents, setDocuments] = useState<StrataItem[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<StrataItem[]>([]);
  const [documentSearch, setDocumentSearch] = useState('');
  const FETCH_TYPE = 'DistinctFetch';

  // Fetch documents whenever sectionId changes
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!sectionId) {
        setDocuments([]);
        setFilteredDocuments([]);
        return;
      }

      try {
        console.log(`🚀 [useDistinctStrataDocuments] Fetching Documents for Section ${sectionId}...`);

        console.log("🧪 [useDistinctStrataDocuments] About to call strataService with:");
        console.log("  resource:", "Document");
        console.log("  action (FETCH_TYPE):", FETCH_TYPE);
        console.log("  payload:", { section_id: sectionId });

        const result = await strataService<StrataItem[]>(
          "Document",       //  Resource is "Document"
          FETCH_TYPE,      //  Action type
          { section_id: sectionId } //  Payload
        );

        console.log("📥 [useDistinctStrataDocuments] Raw result:", result);
        console.log("📦 [useDistinctStrataDocuments] result.data:", result?.data);

        if (result?.error) {
          throw new Error(result.error);
        }

        const data = result?.data ?? [];
        setDocuments(data);
        setFilteredDocuments(data.slice(0, 20));

      } catch (err) {
        console.error("❌ [useDistinctStrataDocuments] Failed to fetch documents:", err);
        setDocuments([]);
        setFilteredDocuments([]);
      }
    };

    fetchDocuments();
  }, [sectionId]);

  // Filter documents when search changes
  useEffect(() => {
    const filtered = documents
      .filter(document =>
        document.file_name?.toLowerCase().includes(documentSearch.toLowerCase())
      )
      .slice(0, 20);

    setFilteredDocuments(filtered);
  }, [documentSearch, documents]);

  return {
    documents,
    filteredDocuments,
    documentSearch,
    setDocumentSearch,
  };
};
