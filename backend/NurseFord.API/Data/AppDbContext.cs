using System;
using Microsoft.EntityFrameworkCore;
using NurseFord.API.Models;

namespace NurseFord.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Role> Roles => Set<Role>();
        public DbSet<User> Users => Set<User>();
        public DbSet<Course> Courses => Set<Course>();
        public DbSet<Subject> Subjects => Set<Subject>();
        public DbSet<Exam> Exams => Set<Exam>();
        public DbSet<Section> Sections => Set<Section>();
        public DbSet<Question> Questions => Set<Question>();
        public DbSet<QuestionOption> QuestionOptions => Set<QuestionOption>();
        public DbSet<QuestionMatrix> QuestionMatrices => Set<QuestionMatrix>();
        public DbSet<SubscriptionPackage> SubscriptionPackages => Set<SubscriptionPackage>();
        public DbSet<UserSubscription> UserSubscriptions => Set<UserSubscription>();
        public DbSet<UserExamSession> UserExamSessions => Set<UserExamSession>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Indexes
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
            modelBuilder.Entity<Course>().HasIndex(c => c.Slug).IsUnique();
            modelBuilder.Entity<Subject>().HasIndex(s => s.Slug);

            // 1. Seed Roles (Owner, Executive, Admin, Learner)
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, GuidId = "role-owner-0001", Name = "Owner", Rank = 1, Description = "Supreme authority over all roles, database records, and system settings." },
                new Role { Id = 2, GuidId = "role-exec-0002", Name = "Executive", Rank = 2, Description = "Executive leadership: package pricing, analytics, financial oversight, and system administration." },
                new Role { Id = 3, GuidId = "role-admin-0003", Name = "Admin", Rank = 3, Description = "Operational manager: loading courses, subjects, exams, questions, and reviewing student sessions." },
                new Role { Id = 4, GuidId = "role-learn-0004", Name = "Learner", Rank = 4, Description = "Front-end student user: take exams, subscribe to packages, review study resources." }
            );

            // 2. Seed Default Owner Account (Password: Admin2026!#)
            string defaultOwnerHash = BCrypt.Net.BCrypt.HashPassword("Admin2026!#");
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    GuidId = "user-owner-0001",
                    Email = "admin@nurseford.com",
                    FullName = "NurseFord Administrator",
                    PasswordHash = defaultOwnerHash,
                    RoleId = 1, // Owner
                    IsActive = true,
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                }
            );

            // 3. Seed Standard Courses
            modelBuilder.Entity<Course>().HasData(
                new Course { Id = 1, GuidId = "course-rn-0001", Name = "RN Nursing", Slug = "rn-nursing", Description = "Registered Nurse degree prep, practice tests, and comprehensive exit exams.", Icon = "HeartPulse", DisplayOrder = 1, IsActive = true },
                new Course { Id = 2, GuidId = "course-lpn-0002", Name = "LPN Nursing", Slug = "lpn-nursing", Description = "Licensed Practical Nurse question banks, skill assessments, and exit predictor tests.", Icon = "Stethoscope", DisplayOrder = 2, IsActive = true },
                new Course { Id = 3, GuidId = "course-nclex-rn-0003", Name = "NCLEX-RN", Slug = "nclex-rn", Description = "Next Generation NCLEX (NGN) computerized adaptive testing practice for RN licensure.", Icon = "Award", DisplayOrder = 3, IsActive = true },
                new Course { Id = 4, GuidId = "course-nclex-pn-0004", Name = "NCLEX-PN", Slug = "nclex-pn", Description = "NGN Practice test banks, case studies, and clinical simulations for PN licensure.", Icon = "BookOpen", DisplayOrder = 4, IsActive = true },
                new Course { Id = 5, GuidId = "course-ati-teas-0005", Name = "ATI TEAS", Slug = "ati-teas", Description = "TEAS 7 Nursing school entrance examination preparation.", Icon = "GraduationCap", DisplayOrder = 5, IsActive = true },
                new Course { Id = 6, GuidId = "course-hesi-a2-0006", Name = "HESI A2", Slug = "hesi-a2", Description = "Health Education Systems Inc. Nursing entrance exam prep.", Icon = "Sparkles", DisplayOrder = 6, IsActive = true }
            );

            // 4. Seed Subjects for RN Nursing & LPN Nursing
            modelBuilder.Entity<Subject>().HasData(
                // RN Nursing Subjects
                new Subject { Id = 1, GuidId = "subj-ati-rn-0001", CourseId = 1, Name = "ATI Exams (RN)", Slug = "ati-exams-rn", DisplayOrder = 1, IsActive = true },
                new Subject { Id = 2, GuidId = "subj-exit-ati-rn-0002", CourseId = 1, Name = "EXIT ATI Exams-RN", Slug = "exit-ati-exams-rn", DisplayOrder = 2, IsActive = true },
                new Subject { Id = 3, GuidId = "subj-hesi-rn-0003", CourseId = 1, Name = "HESI Exam (RN)", Slug = "hesi-exams-rn", DisplayOrder = 3, IsActive = true },
                new Subject { Id = 4, GuidId = "subj-exit-hesi-rn-0004", CourseId = 1, Name = "EXIT HESI Exams-RN", Slug = "exit-hesi-exams-rn", DisplayOrder = 4, IsActive = true },
                new Subject { Id = 5, GuidId = "subj-examplify-rn-0005", CourseId = 1, Name = "EXAMPLIFY Practice (RN)", Slug = "examplify-practice-rn", DisplayOrder = 5, IsActive = true },
                new Subject { Id = 6, GuidId = "subj-general-rn-0006", CourseId = 1, Name = "GENERAL Exams", Slug = "general-exams", DisplayOrder = 6, IsActive = true },

                // LPN Nursing Subjects
                new Subject { Id = 7, GuidId = "subj-ati-lpn-0007", CourseId = 2, Name = "ATI Exams (LPN)", Slug = "ati-exams-lpn", DisplayOrder = 1, IsActive = true },
                new Subject { Id = 8, GuidId = "subj-exit-ati-lpn-0008", CourseId = 2, Name = "EXIT ATI Exams-LPN", Slug = "exit-ati-exams-lpn", DisplayOrder = 2, IsActive = true },
                new Subject { Id = 9, GuidId = "subj-hesi-lpn-0009", CourseId = 2, Name = "HESI Exams (LPN)", Slug = "hesi-exams-lpn", DisplayOrder = 3, IsActive = true },
                new Subject { Id = 10, GuidId = "subj-exit-hesi-lpn-0010", CourseId = 2, Name = "EXIT HESI Exams-LPN", Slug = "exit-hesi-exams-lpn", DisplayOrder = 4, IsActive = true },
                new Subject { Id = 11, GuidId = "subj-examplify-pn-0011", CourseId = 2, Name = "EXAMPLIFY Practice (PN)", Slug = "examplify-practice-pn", DisplayOrder = 5, IsActive = true },
                new Subject { Id = 12, GuidId = "subj-kaplan-0012", CourseId = 2, Name = "KAPLAN EXAMS", Slug = "kaplan-exams", DisplayOrder = 6, IsActive = true }
            );

            // 5. Seed Subscription Packages
            modelBuilder.Entity<SubscriptionPackage>().HasData(
                new SubscriptionPackage
                {
                    Id = 1,
                    GuidId = "pkg-30-day",
                    Title = "30-Day Complete Pass",
                    Description = "Full access to all RN & LPN question banks, rationales, and live practice simulations for 30 days.",
                    DurationDays = 30,
                    Price = 49.00m,
                    Currency = "USD",
                    FeaturesJson = "[\"All Question Banks (RN & LPN)\",\"Complete Exit Predictors\",\"Detailed Rationales & NGN Cases\",\"Full Progress Analytics\"]",
                    IsActive = true
                },
                new SubscriptionPackage
                {
                    Id = 2,
                    GuidId = "pkg-90-day",
                    Title = "90-Day Comprehensive Mastery",
                    Description = "Most popular! Comprehensive study pass for mid-semester and graduation prep with unlimited CAT practice tests.",
                    DurationDays = 90,
                    Price = 89.00m,
                    Currency = "USD",
                    FeaturesJson = "[\"Everything in 30-Day Pass\",\"Unlimited Adaptive CAT Exams\",\"Priority Support\",\"Downloadable Study Outlines\"]",
                    IsActive = true
                },
                new SubscriptionPackage
                {
                    Id = 3,
                    GuidId = "pkg-365-day",
                    Title = "1-Year Unlimited Nursing Suite",
                    Description = "Complete NCLEX + Nursing School guarantee pass for 1 full year with all tracks and regular updates.",
                    DurationDays = 365,
                    Price = 149.00m,
                    Currency = "USD",
                    FeaturesJson = "[\"All Current & Future Exam Packs\",\"1-Year Guaranteed Access\",\"Personalized Study Schedule\",\"Pass Guarantee or Free Extension\"]",
                    IsActive = true
                }
            );
        }
    }
}
