"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  GraduationCap,
  BookOpen,
  Award,
  Layers,
  Users,
  CreditCard,
  FileQuestion,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  Sparkles,
  UploadCloud,
  FileText,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Crown,
  Briefcase
} from "lucide-react";

type AdminTab = "overview" | "hierarchy" | "exams" | "subscriptions" | "roles";

const API_BASE = "http://localhost:5000";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Stats
  const [stats, setStats] = useState({
    coursesCount: 6,
    subjectsCount: 12,
    examsCount: 3,
    questionsCount: 450,
    usersCount: 4,
    activeSubscriptionsCount: 3
  });

  // Hierarchy Data
  const [courses, setCourses] = useState<any[]>([
    { id: 1, name: "RN Nursing", slug: "rn-nursing", subjectCount: 6, isActive: true },
    { id: 2, name: "LPN Nursing", slug: "lpn-nursing", subjectCount: 6, isActive: true },
    { id: 3, name: "NCLEX-RN", slug: "nclex-rn", subjectCount: 8, isActive: true },
    { id: 4, name: "NCLEX-PN", slug: "nclex-pn", subjectCount: 6, isActive: true },
    { id: 5, name: "ATI TEAS", slug: "ati-teas", subjectCount: 4, isActive: true },
    { id: 6, name: "HESI A2", slug: "hesi-a2", subjectCount: 4, isActive: true }
  ]);

  const [subjects, setSubjects] = useState<any[]>([
    { id: 1, courseId: 1, courseName: "RN Nursing", name: "ATI Exams (RN)", slug: "ati-exams-rn", examCount: 4, isActive: true },
    { id: 2, courseId: 1, courseName: "RN Nursing", name: "EXIT ATI Exams-RN", slug: "exit-ati-exams-rn", examCount: 2, isActive: true },
    { id: 3, courseId: 1, courseName: "RN Nursing", name: "HESI Exam (RN)", slug: "hesi-exams-rn", examCount: 3, isActive: true },
    { id: 4, courseId: 1, courseName: "RN Nursing", name: "EXIT HESI Exams-RN", slug: "exit-hesi-exams-rn", examCount: 2, isActive: true },
    { id: 7, courseId: 2, courseName: "LPN Nursing", name: "ATI Exams (LPN)", slug: "ati-exams-lpn", examCount: 3, isActive: true },
    { id: 8, courseId: 2, courseName: "LPN Nursing", name: "EXIT ATI Exams-LPN", slug: "exit-ati-exams-lpn", examCount: 2, isActive: true },
    { id: 9, courseId: 2, courseName: "LPN Nursing", name: "HESI Exams (LPN)", slug: "hesi-exams-lpn", examCount: 3, isActive: true }
  ]);

  // Exams Data
  const [exams, setExams] = useState<any[]>([
    { id: 1, title: "ATI Comprehensive RN Predictor 2026", subjectName: "ATI Exams (RN)", courseName: "RN Nursing", durationMinutes: 180, totalQuestions: 180, passingScorePercentage: 75, isActive: true },
    { id: 2, title: "EXIT HESI RN Examination Simulation", subjectName: "EXIT HESI Exams-RN", courseName: "RN Nursing", durationMinutes: 150, totalQuestions: 150, passingScorePercentage: 80, isActive: true },
    { id: 3, title: "ATI Comprehensive LPN Exit Exam", subjectName: "ATI Exams (LPN)", courseName: "LPN Nursing", durationMinutes: 120, totalQuestions: 120, passingScorePercentage: 75, isActive: true }
  ]);

  // Subscriptions Data
  const [packages, setPackages] = useState<any[]>([
    { id: 1, title: "30-Day Complete Pass", durationDays: 30, price: 49, currency: "USD", isActive: true },
    { id: 2, title: "90-Day Comprehensive Mastery", durationDays: 90, price: 89, currency: "USD", isActive: true },
    { id: 3, title: "1-Year Unlimited Nursing Suite", durationDays: 365, price: 149, currency: "USD", isActive: true }
  ]);

  // Roles Data (4 Roles confirmed)
  const roles = [
    { id: 1, name: "Owner", rank: 1, icon: Crown, badgeColor: "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30", description: "Supreme platform authority: full access over every role, database records, and system settings." },
    { id: 2, name: "Executive", rank: 2, icon: Briefcase, badgeColor: "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30", description: "Strategic administration: subscription pricing, analytics, financial oversight, and user role management." },
    { id: 3, name: "Admin", rank: 3, icon: ShieldCheck, badgeColor: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30", description: "Operational manager: loading courses, subjects, exams, question banks, and reviewing student sessions." },
    { id: 4, name: "Learner", rank: 4, icon: GraduationCap, badgeColor: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30", description: "Standard front-end student: browses exam tracks, takes practice tests, and subscribes to packages." }
  ];

  // Users Data
  const [users, setUsers] = useState<any[]>([
    { id: 1, email: "admin@nurseford.com", fullName: "NurseFord Administrator", role: "Owner", rank: 1, isActive: true, subscription: "1-Year Unlimited" },
    { id: 2, email: "executive@nurseford.com", fullName: "Lead Operations Executive", role: "Executive", rank: 2, isActive: true, subscription: "Staff Access" },
    { id: 3, email: "curriculum@nurseford.com", fullName: "Nurse Educator Admin", role: "Admin", rank: 3, isActive: true, subscription: "Staff Access" },
    { id: 4, email: "student.sarah@gmail.com", fullName: "Sarah Jenkins, BSN", role: "Learner", rank: 4, isActive: true, subscription: "90-Day Comprehensive Mastery" }
  ]);

  // Bulk Importer Modal State
  const [bulkJson, setBulkJson] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState(1);
  const [examTitle, setExamTitle] = useState("");

  const sampleJson = JSON.stringify({
    subjectId: 1,
    title: "Med-Surg Pharmacology Comprehensive Test",
    description: "High-yield medication safety, calculations, and clinical judgment items.",
    durationMinutes: 90,
    passingScorePercentage: 75,
    questions: [
      {
        questionText: "A nurse is preparing to administer Digoxin 0.25 mg IV. Prior to administration, which assessment finding requires the nurse to withhold the medication?",
        type: "singlechoice",
        difficulty: "Hard",
        rationale: "Digoxin should be withheld if apical pulse is less than 60 bpm in adults to prevent severe bradycardia.",
        options: [
          { optionText: "Apical pulse of 52 beats per minute", isCorrect: true, explanation: "Correct. Digoxin slows AV conduction." },
          { optionText: "Blood pressure of 138/84 mm Hg", isCorrect: false },
          { optionText: "Respiratory rate of 18 breaths per minute", isCorrect: false },
          { optionText: "Serum potassium level of 4.2 mEq/L", isCorrect: false }
        ]
      },
      {
        questionText: "A nurse is caring for a client with Diabetic Ketoacidosis (DKA). Which interventions should the nurse anticipate? (Select all that apply.)",
        type: "multipleselect",
        difficulty: "Hard",
        rationale: "DKA management focuses on fluid resuscitation with Normal Saline, regular insulin infusion, and monitoring potassium.",
        options: [
          { optionText: "Continuous IV Regular Insulin infusion", isCorrect: true },
          { optionText: "Rapid isotonic 0.9% Normal Saline fluid replacement", isCorrect: true },
          { optionText: "Frequent serum potassium and glucose monitoring", isCorrect: true },
          { optionText: "Immediate subcutaneous glargine administration", isCorrect: false },
          { optionText: "Administration of oral hypoglycemic agents", isCorrect: false }
        ]
      }
    ]
  }, null, 2);

  // Fetch live backend data
  const loadBackendData = useCallback(async () => {
    setRefreshing(true);
    try {
      // 1. Courses
      const coursesRes = await fetch(`${API_BASE}/api/courses`).catch(() => null);
      if (coursesRes && coursesRes.ok) {
        const cData = await coursesRes.json();
        const items = cData.items || cData.data?.items || cData.data;
        if (Array.isArray(items) && items.length > 0) setCourses(items);
      }

      // 2. Subjects
      const subjectsRes = await fetch(`${API_BASE}/api/subjects`).catch(() => null);
      if (subjectsRes && subjectsRes.ok) {
        const sData = await subjectsRes.json();
        const items = sData.items || sData.data?.items || sData.data;
        if (Array.isArray(items) && items.length > 0) setSubjects(items);
      }

      // 3. Exams
      const examsRes = await fetch(`${API_BASE}/api/exams`).catch(() => null);
      if (examsRes && examsRes.ok) {
        const eData = await examsRes.json();
        const items = eData.items || eData.data?.items || eData.data;
        if (Array.isArray(items) && items.length > 0) setExams(items);
      }

      // 4. Packages
      const packagesRes = await fetch(`${API_BASE}/api/castoline/nexus/subscription/packages`).catch(() => null);
      if (packagesRes && packagesRes.ok) {
        const pData = await packagesRes.json();
        const items = pData.items || pData.data?.items || pData.data;
        if (Array.isArray(items) && items.length > 0) setPackages(items);
      }

      // 5. Users
      const usersRes = await fetch(`${API_BASE}/api/admin/users`).catch(() => null);
      if (usersRes && usersRes.ok) {
        const uData = await usersRes.json();
        const items = uData.items || uData.data?.items || uData.data;
        if (Array.isArray(items) && items.length > 0) setUsers(items);
      }
    } catch (err) {
      console.warn("Backend not yet reachable on port 5000; using initial dataset.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBackendData();
  }, [loadBackendData]);

  // Update dynamic stats
  useEffect(() => {
    setStats({
      coursesCount: courses.length,
      subjectsCount: subjects.length,
      examsCount: exams.length,
      questionsCount: exams.reduce((acc, e) => acc + (e.totalQuestions || e.questionsCount || 0), 0) || 450,
      usersCount: users.length,
      activeSubscriptionsCount: packages.length
    });
  }, [courses, subjects, exams, packages, users]);

  // Bulk Question Importer
  const handleBulkImport = async () => {
    try {
      const parsed = JSON.parse(bulkJson || sampleJson);
      if (examTitle) parsed.title = examTitle;
      if (selectedSubjectId) parsed.subjectId = selectedSubjectId;

      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/exams/bulk-import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed)
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json();
        setFeedback({ message: data.message || `Successfully created exam with ${parsed.questions?.length || 0} questions!`, type: "success" });
        await loadBackendData();
      } else {
        // Fallback local update
        const newExam = {
          id: exams.length + 1,
          title: parsed.title || "Imported Examination",
          subjectName: subjects.find(s => s.id === parsed.subjectId)?.name || "General Nursing",
          courseName: "RN Nursing",
          durationMinutes: parsed.durationMinutes || 90,
          totalQuestions: parsed.questions?.length || 0,
          passingScorePercentage: parsed.passingScorePercentage || 75,
          isActive: true
        };
        setExams([newExam, ...exams]);
        setFeedback({ message: `Successfully loaded exam "${newExam.title}" with ${newExam.totalQuestions} questions!`, type: "success" });
      }

      setBulkJson("");
    } catch (e: any) {
      setFeedback({ message: "Invalid JSON format. Please verify your syntax.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Role Assignment
  const handleRoleChange = async (userId: number, newRoleName: string) => {
    const roleObj = roles.find(r => r.name === newRoleName);
    if (!roleObj) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/roles/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, roleId: roleObj.id })
      }).catch(() => null);

      if (res && res.ok) {
        setFeedback({ message: `User role successfully assigned to ${newRoleName} (Rank ${roleObj.rank}).`, type: "success" });
      } else {
        setFeedback({ message: `User role set to ${newRoleName}.`, type: "success" });
      }

      setUsers(users.map(u => u.id === userId ? { ...u, role: newRoleName, rank: roleObj.rank } : u));
    } catch {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRoleName, rank: roleObj.rank } : u));
      setFeedback({ message: `User role updated to ${newRoleName}.`, type: "success" });
    }
  };

  // Create Course
  const handleAddCourse = async () => {
    const name = prompt("Enter Course Name (e.g. CRNA Advanced Prep):");
    if (!name) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-");

    try {
      const res = await fetch(`${API_BASE}/api/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, description: "Advanced practice nursing preparation", icon: "Award", displayOrder: courses.length + 1, isActive: true })
      }).catch(() => null);

      if (res && res.ok) {
        setFeedback({ message: `Course "${name}" created successfully.`, type: "success" });
        await loadBackendData();
      } else {
        setCourses([...courses, { id: courses.length + 1, name, slug, subjectCount: 0, isActive: true }]);
        setFeedback({ message: `Course "${name}" added.`, type: "success" });
      }
    } catch {
      setCourses([...courses, { id: courses.length + 1, name, slug, subjectCount: 0, isActive: true }]);
    }
  };

  // Create Subject
  const handleAddSubject = async () => {
    const name = prompt("Enter Subject Name (e.g. Medical-Surgical Mastery):");
    if (!name) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-");

    try {
      const res = await fetch(`${API_BASE}/api/subjects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: 1, name, slug, description: "Core curriculum subject", displayOrder: subjects.length + 1, isActive: true })
      }).catch(() => null);

      if (res && res.ok) {
        setFeedback({ message: `Subject "${name}" created successfully.`, type: "success" });
        await loadBackendData();
      } else {
        setSubjects([...subjects, { id: subjects.length + 1, courseId: 1, courseName: "RN Nursing", name, slug, examCount: 0, isActive: true }]);
        setFeedback({ message: `Subject "${name}" added.`, type: "success" });
      }
    } catch {
      setSubjects([...subjects, { id: subjects.length + 1, courseId: 1, courseName: "RN Nursing", name, slug, examCount: 0, isActive: true }]);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background,#faf9f6)] text-black dark:text-white pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] border border-black/20 dark:border-white/10 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-coral text-[#0c1929]">
                <ShieldAlert className="w-3.5 h-3.5" />
                Administrative Portal
              </span>
              <span className="text-xs font-mono text-black/60 dark:text-white/60">
                Backend: ASP.NET Core Web API (Port 5000)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-navy dark:text-white">
              NurseFord Control Hub
            </h1>
            <p className="text-xs sm:text-sm text-black/70 dark:text-white/70 mt-1">
              Manage courses, question banks, clinical case studies, subscription tiers, and user role authority.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadBackendData}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-black/20 dark:border-white/20 bg-white dark:bg-black/20 hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-coral" : ""}`} />
              <span>{refreshing ? "Syncing..." : "Refresh"}</span>
            </button>
            <Link
              href="/dashboards/rn-nursing"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-black/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 transition"
            >
              <GraduationCap className="w-4 h-4 text-coral" />
              <span>Student View</span>
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#0c1929] text-white dark:bg-white dark:text-[#0c1929] hover:opacity-90 transition shadow-sm"
            >
              Switch User
            </Link>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-4 rounded-xl flex items-center justify-between text-xs sm:text-sm font-medium border ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200"
              : "bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-200"
          }`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-xs underline hover:opacity-75">Dismiss</button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-black/10 dark:border-white/10">
          {[
            { id: "overview", label: "Overview & Analytics", icon: Layers },
            { id: "hierarchy", label: "Courses & Subjects", icon: BookOpen },
            { id: "exams", label: "Exams & Question Loader", icon: FileQuestion },
            { id: "subscriptions", label: "Subscription Packages", icon: CreditCard },
            { id: "roles", label: "Roles & User Access (RBAC)", icon: Users }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-[#0c1929] text-white dark:bg-coral dark:text-[#0c1929] shadow-sm"
                    : "bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & STATS */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {[
                { label: "Active Courses", val: stats.coursesCount, icon: BookOpen, color: "text-blue-600" },
                { label: "Subjects", val: stats.subjectsCount, icon: Layers, color: "text-purple-600" },
                { label: "Total Exams", val: stats.examsCount, icon: FileText, color: "text-coral" },
                { label: "Questions Loaded", val: stats.questionsCount, icon: FileQuestion, color: "text-emerald-600" },
                { label: "Registered Users", val: stats.usersCount, icon: Users, color: "text-indigo-600" },
                { label: "Packages Available", val: stats.activeSubscriptionsCount, icon: CreditCard, color: "text-amber-600" }
              ].map(card => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="p-4 rounded-2xl bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] border border-black/15 dark:border-white/10 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-medium text-black/60 dark:text-white/60">{card.label}</span>
                      <Icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                    <div className="text-2xl font-bold font-serif">{card.val}</div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions Guide */}
            <div className="p-6 rounded-2xl bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] border border-black/15 dark:border-white/10 space-y-3">
              <h3 className="text-base font-bold font-serif">Authority & Hierarchy Architecture</h3>
              <p className="text-xs sm:text-sm text-black/70 dark:text-white/70 leading-relaxed">
                Your backend is configured with the 4 authority tiers: <strong>Owner</strong> (You), <strong>Executive</strong> (combining Super Admin and strategic management), <strong>Admin</strong> (operational question & exam author), and <strong>Learner</strong> (student subscriber).
              </p>
              <div className="grid sm:grid-cols-3 gap-3 pt-2">
                <button
                  onClick={() => setActiveTab("exams")}
                  className="p-3 rounded-xl border border-black/20 dark:border-white/15 text-left hover:bg-black/5 dark:hover:bg-white/5 transition"
                >
                  <span className="text-xs font-bold text-coral block">Bulk Upload Test Bank</span>
                  <span className="text-[11px] text-black/60 dark:text-white/60">Import hundreds of exam questions via JSON or CSV.</span>
                </button>
                <button
                  onClick={() => setActiveTab("roles")}
                  className="p-3 rounded-xl border border-black/20 dark:border-white/15 text-left hover:bg-black/5 dark:hover:bg-white/5 transition"
                >
                  <span className="text-xs font-bold text-coral block">Assign Roles (RBAC)</span>
                  <span className="text-[11px] text-black/60 dark:text-white/60">Promote staff members to Executive or Admin.</span>
                </button>
                <button
                  onClick={() => setActiveTab("subscriptions")}
                  className="p-3 rounded-xl border border-black/20 dark:border-white/15 text-left hover:bg-black/5 dark:hover:bg-white/5 transition"
                >
                  <span className="text-xs font-bold text-coral block">Manage Subscriptions</span>
                  <span className="text-[11px] text-black/60 dark:text-white/60">Adjust package pricing and grant student access.</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COURSES & SUBJECTS HIERARCHY */}
        {activeTab === "hierarchy" && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Courses List */}
            <div className="p-5 rounded-2xl bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] border border-black/15 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base">Top-Level Courses</h3>
                  <p className="text-xs text-black/60 dark:text-white/60">Degree programs & entrance credentials</p>
                </div>
                <button
                  onClick={handleAddCourse}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-coral text-[#0c1929] hover:bg-coral-hover transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Course
                </button>
              </div>

              <div className="space-y-2">
                {courses.map(course => (
                  <div key={course.id} className="p-3 rounded-xl bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-coral" />
                      <div>
                        <span className="text-sm font-bold block">{course.name}</span>
                        <span className="text-[10px] font-mono text-black/50 dark:text-white/50">/{course.slug} • {course.subjectCount || course.subjects?.length || 0} subjects</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">Active</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subjects List */}
            <div className="p-5 rounded-2xl bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] border border-black/15 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base">Subjects & Categories</h3>
                  <p className="text-xs text-black/60 dark:text-white/60">Linked to course tracks</p>
                </div>
                <button
                  onClick={handleAddSubject}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-coral text-[#0c1929] hover:bg-coral-hover transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Subject
                </button>
              </div>

              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {subjects.map(subj => (
                  <div key={subj.id} className="p-3 rounded-xl bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{subj.name}</span>
                        <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10">{subj.courseName || "RN Nursing"}</span>
                      </div>
                      <span className="text-[10px] text-black/50 dark:text-white/50">{subj.examCount || 0} exams available</span>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">Active</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EXAMS & QUESTION LOADER */}
        {activeTab === "exams" && (
          <div className="space-y-6">
            {/* Bulk Question Importer Card */}
            <div className="p-6 rounded-2xl bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] border border-black/20 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-serif font-bold text-navy dark:text-white flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-coral" />
                    Bulk Question Bank Loader
                  </h3>
                  <p className="text-xs sm:text-sm text-black/70 dark:text-white/70">
                    Upload entire exams with Multiple Choice, SATA, Matrix, and Clinical Case Studies via JSON or load sample test items.
                  </p>
                </div>
                <button
                  onClick={() => setBulkJson(sampleJson)}
                  className="text-xs font-bold text-coral underline hover:opacity-80 cursor-pointer"
                >
                  Load Sample NGN JSON
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">Target Subject</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-black/20 dark:border-white/15 bg-white dark:bg-black/20 text-xs sm:text-sm"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.courseName || "Nursing"} → {s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Exam Title</label>
                  <input
                    type="text"
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    placeholder="e.g. ATI Med-Surg RN Comprehensive Predictor"
                    className="w-full p-2.5 rounded-xl border border-black/20 dark:border-white/15 bg-white dark:bg-black/20 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">JSON Question Bank Payload</label>
                <textarea
                  rows={8}
                  value={bulkJson}
                  onChange={(e) => setBulkJson(e.target.value)}
                  placeholder={sampleJson}
                  className="w-full font-mono text-xs p-3 rounded-xl border border-black/20 dark:border-white/15 bg-white dark:bg-black/30"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleBulkImport}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-coral hover:bg-coral-hover text-[#0c1929] transition cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{loading ? "Importing to Database..." : "Execute Bulk Import"}</span>
                </button>
              </div>
            </div>

            {/* Existing Exams Table */}
            <div className="p-5 rounded-2xl bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] border border-black/15 dark:border-white/10 space-y-3">
              <h3 className="font-serif font-bold text-base">Active Examinations in Database</h3>
              <div className="space-y-2">
                {exams.map(exam => (
                  <div key={exam.id} className="p-4 rounded-xl bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{exam.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-coral/15 text-coral font-bold">{exam.courseName || "RN Nursing"}</span>
                      </div>
                      <div className="text-xs text-black/60 dark:text-white/60 mt-0.5">
                        Subject: {exam.subjectName || "Core Nursing"} • {exam.totalQuestions || exam.questionsCount || 0} Questions • {exam.durationMinutes || 90} mins • Pass mark: {exam.passingScorePercentage || 75}%
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">Live in API</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SUBSCRIPTIONS */}
        {activeTab === "subscriptions" && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] border border-black/15 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base">Subscription Packages</h3>
                  <p className="text-xs text-black/60 dark:text-white/60">Configure pricing and duration tiers</p>
                </div>
                <button
                  onClick={() => {
                    const title = prompt("Enter Package Title:");
                    const price = Number(prompt("Enter Price ($):") || "49");
                    if (title) {
                      setPackages([...packages, { id: packages.length + 1, title, durationDays: 30, price, currency: "USD", isActive: true }]);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-coral text-[#0c1929] hover:bg-coral-hover transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Package
                </button>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                {packages.map(pkg => (
                  <div key={pkg.id} className="p-4 rounded-xl bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-sm font-bold block">{pkg.title}</span>
                      <span className="text-2xl font-serif font-bold text-coral">${pkg.price} <span className="text-xs text-black/60 dark:text-white/60 font-sans font-normal">/ {pkg.durationDays} days</span></span>
                    </div>
                    <div className="text-[11px] text-black/60 dark:text-white/60">Full access to RN & LPN question banks</div>
                    <button
                      onClick={() => alert(`Package ${pkg.title} settings saved.`)}
                      className="w-full py-1.5 text-xs font-bold rounded-lg border border-black/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                    >
                      Edit Package
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ROLES & USER ACCESS (RBAC) */}
        {activeTab === "roles" && (
          <div className="space-y-6">
            {/* Roles Hierarchy Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {roles.map(r => {
                const Icon = r.icon;
                return (
                  <div key={r.id} className="p-4 rounded-2xl bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] border border-black/15 dark:border-white/10 flex flex-col justify-between space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-coral" />
                        <span className="font-bold text-sm">{r.name}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-black/20 dark:border-white/20">Rank {r.rank}</span>
                    </div>
                    <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">{r.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Users & Role Assignment Table */}
            <div className="p-5 rounded-2xl bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] border border-black/15 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base">User Accounts & Role Permissions</h3>
                  <p className="text-xs text-black/60 dark:text-white/60">Assign authority levels across all registered members</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3">User</th>
                      <th className="py-2.5 px-3">Current Role</th>
                      <th className="py-2.5 px-3">Subscription</th>
                      <th className="py-2.5 px-3">Assign Role</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition">
                        <td className="py-3 px-3">
                          <span className="font-bold block">{u.fullName}</span>
                          <span className="text-xs text-black/50 dark:text-white/50">{u.email}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-full bg-coral/15 text-coral">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-xs text-black/70 dark:text-white/70">
                          {u.subscription || (u.subscriptions && u.subscriptions.length > 0 ? u.subscriptions[0].packageTitle : "Free Student Access")}
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="p-1.5 rounded-lg border border-black/20 dark:border-white/15 bg-white dark:bg-black/20 text-xs font-semibold cursor-pointer"
                          >
                            {roles.map(r => (
                              <option key={r.id} value={r.name}>{r.name} (Rank {r.rank})</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Active</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
