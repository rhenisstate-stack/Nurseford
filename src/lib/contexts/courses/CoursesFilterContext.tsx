"use client";

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";

export interface CoursesFilterContextType {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedProgram: string;
  setSelectedProgram: (p: string) => void;
  selectedSchool: string;
  setSelectedSchool: (s: string) => void;
  selectedYear: string;
  setSelectedYear: (y: string) => void;
  selectedSeason: string;
  setSelectedSeason: (s: string) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
  dynamicPrograms: string[];
  setDynamicPrograms: (programs: string[]) => void;
  dynamicYears: number[];
  setDynamicYears: (years: number[]) => void;
  dynamicSeasons: string[];
  setDynamicSeasons: (seasons: string[]) => void;
  totalCoursesCount: number;
  setTotalCoursesCount: (n: number) => void;
  filteredCount: number;
  setFilteredCount: (n: number) => void;
}

const CoursesFilterContext = createContext<CoursesFilterContextType | null>(null);

export function CoursesFilterProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(() => searchParams?.get("q") || "");
  const [selectedProgram, setSelectedProgram] = useState<string>(() => {
    return searchParams?.get("program") || "All Programmes";
  });
  const [selectedSchool, setSelectedSchool] = useState<string>(() => {
    return searchParams?.get("school") || "All Schools";
  });
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    return searchParams?.get("year") || "All Years";
  });
  const [selectedSeason, setSelectedSeason] = useState<string>(() => {
    return searchParams?.get("season") || "All Seasons";
  });

  const [dynamicPrograms, setDynamicPrograms] = useState<string[]>([]);
  const [dynamicYears, setDynamicYears] = useState<number[]>([]);
  const [dynamicSeasons, setDynamicSeasons] = useState<string[]>([]);
  const [totalCoursesCount, setTotalCoursesCount] = useState<number>(0);
  const [filteredCount, setFilteredCount] = useState<number>(0);

  // Sync state to URL without full page reload when on courses page
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.location.pathname.includes("/courses")) return;

    const url = new URL(window.location.href);

    if (searchQuery.trim()) url.searchParams.set("q", searchQuery.trim());
    else url.searchParams.delete("q");

    if (selectedProgram !== "All Programmes") url.searchParams.set("program", selectedProgram);
    else url.searchParams.delete("program");

    if (selectedSchool !== "All Schools") url.searchParams.set("school", selectedSchool);
    else url.searchParams.delete("school");

    if (selectedYear !== "All Years") url.searchParams.set("year", selectedYear);
    else url.searchParams.delete("year");

    if (selectedSeason !== "All Seasons") url.searchParams.set("season", selectedSeason);
    else url.searchParams.delete("season");

    window.history.replaceState(null, "", url.pathname + url.search);
  }, [searchQuery, selectedProgram, selectedSchool, selectedYear, selectedSeason]);

  const hasActiveFilters = useMemo(() => {
    return (
      Boolean(searchQuery.trim()) ||
      selectedProgram !== "All Programmes" ||
      selectedSchool !== "All Schools" ||
      selectedYear !== "All Years" ||
      selectedSeason !== "All Seasons"
    );
  }, [searchQuery, selectedProgram, selectedSchool, selectedYear, selectedSeason]);

  const clearAllFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedProgram("All Programmes");
    setSelectedSchool("All Schools");
    setSelectedYear("All Years");
    setSelectedSeason("All Seasons");
  }, []);

  const value = useMemo(
    () => ({
      searchQuery,
      setSearchQuery,
      selectedProgram,
      setSelectedProgram,
      selectedSchool,
      setSelectedSchool,
      selectedYear,
      setSelectedYear,
      selectedSeason,
      setSelectedSeason,
      clearAllFilters,
      hasActiveFilters,
      dynamicPrograms,
      setDynamicPrograms,
      dynamicPrograms,
      dynamicYears,
      setDynamicYears,
      dynamicSeasons,
      setDynamicSeasons,
      totalCoursesCount,
      setTotalCoursesCount,
      filteredCount,
      setFilteredCount,
    }),
    [
      searchQuery,
      selectedProgram,
      selectedSchool,
      selectedYear,
      selectedSeason,
      clearAllFilters,
      hasActiveFilters,
      dynamicPrograms,
      dynamicYears,
      dynamicSeasons,
      totalCoursesCount,
      filteredCount,
    ]
  );

  return (
    <CoursesFilterContext.Provider value={value}>
      {children}
    </CoursesFilterContext.Provider>
  );
}

export function useCoursesFilter() {
  const context = useContext(CoursesFilterContext);
  if (!context) {
    throw new Error("useCoursesFilter must be used within a CoursesFilterProvider");
  }
  return context;
}
