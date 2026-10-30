using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NurseFord.API.Models
{
    public class Role
    {
        [Key]
        public int Id { get; set; }
        public string GuidId { get; set; } = Guid.NewGuid().ToString();
        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty; // Owner, Executive, Admin, Learner
        public int Rank { get; set; } // 1: Owner, 2: Executive, 3: Admin, 4: Learner
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<User> Users { get; set; } = new List<User>();
    }

    public class User
    {
        [Key]
        public int Id { get; set; }
        public string GuidId { get; set; } = Guid.NewGuid().ToString();
        [Required, MaxLength(255)]
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public int RoleId { get; set; }
        [ForeignKey(nameof(RoleId))]
        public Role? Role { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public ICollection<UserSubscription> Subscriptions { get; set; } = new List<UserSubscription>();
        public ICollection<UserExamSession> ExamSessions { get; set; } = new List<UserExamSession>();
    }

    public class Course
    {
        [Key]
        public int Id { get; set; }
        public string GuidId { get; set; } = Guid.NewGuid().ToString();
        [Required, MaxLength(200)]
        public string Name { get; set; } = string.Empty; // e.g. "RN Nursing", "LPN Nursing"
        [Required, MaxLength(100)]
        public string Slug { get; set; } = string.Empty; // e.g. "rn-nursing", "lpn-nursing"
        public string Description { get; set; } = string.Empty;
        public string Icon { get; set; } = "GraduationCap";
        public int DisplayOrder { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Subject> Subjects { get; set; } = new List<Subject>();
    }

    public class Subject
    {
        [Key]
        public int Id { get; set; }
        public string GuidId { get; set; } = Guid.NewGuid().ToString();
        public int CourseId { get; set; }
        [ForeignKey(nameof(CourseId))]
        public Course? Course { get; set; }
        [Required, MaxLength(200)]
        public string Name { get; set; } = string.Empty; // e.g. "ATI Exams (RN)", "EXIT ATI Exams-RN"
        [Required, MaxLength(100)]
        public string Slug { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int DisplayOrder { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Exam> Exams { get; set; } = new List<Exam>();
    }

    public class Exam
    {
        [Key]
        public int Id { get; set; }
        public string GuidId { get; set; } = Guid.NewGuid().ToString();
        public int SubjectId { get; set; }
        [ForeignKey(nameof(SubjectId))]
        public Subject? Subject { get; set; }
        [Required, MaxLength(255)]
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int DurationMinutes { get; set; } = 120;
        public int PassingScorePercentage { get; set; } = 75;
        public int TotalQuestions { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        public bool IsFreePreview { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Section> Sections { get; set; } = new List<Section>();
        public ICollection<Question> Questions { get; set; } = new List<Question>();
    }

    public class Section
    {
        [Key]
        public int Id { get; set; }
        public string GuidId { get; set; } = Guid.NewGuid().ToString();
        public int ExamId { get; set; }
        [ForeignKey(nameof(ExamId))]
        public Exam? Exam { get; set; }
        [Required, MaxLength(200)]
        public string Name { get; set; } = "General Section";
        public string Description { get; set; } = string.Empty;
        public int OrderIndex { get; set; } = 0;

        public ICollection<Question> Questions { get; set; } = new List<Question>();
    }

    public class Question
    {
        [Key]
        public int Id { get; set; }
        public string GuidId { get; set; } = Guid.NewGuid().ToString();
        public int ExamId { get; set; }
        [ForeignKey(nameof(ExamId))]
        public Exam? Exam { get; set; }
        public int? SectionId { get; set; }
        [ForeignKey(nameof(SectionId))]
        public Section? Section { get; set; }

        [Required]
        public string QuestionText { get; set; } = string.Empty;
        public string Type { get; set; } = "singlechoice"; // singlechoice, multipleselect, truefalse, numericresponse, matrixsinglechoice, hotspot, casebasedsinglechoice, etc.
        public string Rationale { get; set; } = string.Empty;
        public double Weight { get; set; } = 1.0;
        public string Difficulty { get; set; } = "Medium"; // Easy, Medium, Hard
        public bool IsFeatured { get; set; } = false;
        public bool IsCaseStudy { get; set; } = false;
        public string? CaseStudyDataJson { get; set; } // Nurse Notes, History, Vitals, Labs

        public int OrderIndex { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<QuestionOption> Options { get; set; } = new List<QuestionOption>();
        public ICollection<QuestionMatrix> Matrices { get; set; } = new List<QuestionMatrix>();
    }

    public class QuestionOption
    {
        [Key]
        public int Id { get; set; }
        public string GuidId { get; set; } = Guid.NewGuid().ToString();
        public int QuestionId { get; set; }
        [ForeignKey(nameof(QuestionId))]
        public Question? Question { get; set; }
        [Required]
        public string OptionText { get; set; } = string.Empty;
        public bool IsCorrect { get; set; } = false;
        public int OrderIndex { get; set; } = 0;
        public string? Explanation { get; set; }
    }

    public class QuestionMatrix
    {
        [Key]
        public int Id { get; set; }
        public int QuestionId { get; set; }
        [ForeignKey(nameof(QuestionId))]
        public Question? Question { get; set; }
        public string RowHeadersJson { get; set; } = "[]";
        public string ColumnHeadersJson { get; set; } = "[]";
        public string CorrectCellsJson { get; set; } = "[]";
        public string ResponseType { get; set; } = "singleChoice";
    }

    public class SubscriptionPackage
    {
        [Key]
        public int Id { get; set; }
        public string GuidId { get; set; } = Guid.NewGuid().ToString();
        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int DurationDays { get; set; } = 30;
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; } = 0.00m;
        public string Currency { get; set; } = "USD";
        public string FeaturesJson { get; set; } = "[]";
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<UserSubscription> Subscriptions { get; set; } = new List<UserSubscription>();
    }

    public class UserSubscription
    {
        [Key]
        public int Id { get; set; }
        public string GuidId { get; set; } = Guid.NewGuid().ToString();
        public int UserId { get; set; }
        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
        public int PackageId { get; set; }
        [ForeignKey(nameof(PackageId))]
        public SubscriptionPackage? Package { get; set; }
        public string Status { get; set; } = "Active"; // Active, Pending, Expired
        public string HasPaid { get; set; } = "paid"; // paid, true, unpaid
        public DateTime ValidFrom { get; set; } = DateTime.UtcNow;
        public DateTime ValidUntil { get; set; } = DateTime.UtcNow.AddDays(30);
        public string? TransactionReference { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class UserExamSession
    {
        [Key]
        public int Id { get; set; }
        public string GuidId { get; set; } = Guid.NewGuid().ToString();
        public int UserId { get; set; }
        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
        public int ExamId { get; set; }
        [ForeignKey(nameof(ExamId))]
        public Exam? Exam { get; set; }
        public double Score { get; set; } = 0.0;
        public int TotalAnswered { get; set; } = 0;
        public string Status { get; set; } = "In Progress"; // In Progress, Completed
        public string UserAnswersJson { get; set; } = "[]";
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
    }
}
