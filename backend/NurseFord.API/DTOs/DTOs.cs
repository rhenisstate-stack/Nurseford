using System;
using System.Collections.Generic;

namespace NurseFord.API.DTOs
{
    // Auth DTOs
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? Role { get; set; } // default "Learner"
    }

    public class AuthResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Token { get; set; }
        public UserDto? User { get; set; }
    }

    public class UserDto
    {
        public int Id { get; set; }
        public string GuidId { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string Role { get; set; } = "Learner";
        public int RoleRank { get; set; } = 4;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CastoLine { get; set; }
        public string? CastoBadge { get; set; }
        public List<UserSubscriptionDto> Subscriptions { get; set; } = new();
    }

    // Role DTOs
    public class RoleDto
    {
        public int Id { get; set; }
        public string GuidId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public int Rank { get; set; }
        public string Description { get; set; } = string.Empty;
        public int UserCount { get; set; }
    }

    public class AssignRoleRequest
    {
        public int UserId { get; set; }
        public int RoleId { get; set; }
    }

    // Hierarchy DTOs
    public class CourseDto
    {
        public int Id { get; set; }
        public string GuidId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Icon { get; set; } = "GraduationCap";
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public int SubjectCount { get; set; }
        public List<SubjectDto> Subjects { get; set; } = new();
    }

    public class SubjectDto
    {
        public int Id { get; set; }
        public string GuidId { get; set; } = string.Empty;
        public int CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
        public int ExamCount { get; set; }
    }

    // Exam & Question DTOs
    public class ExamDto
    {
        public int Id { get; set; }
        public string GuidId { get; set; } = string.Empty;
        public int SubjectId { get; set; }
        public string SubjectName { get; set; } = string.Empty;
        public string CourseName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int DurationMinutes { get; set; }
        public int PassingScorePercentage { get; set; }
        public int TotalQuestions { get; set; }
        public int QuestionsCount { get; set; }
        public int SectionsCount { get; set; } = 1;
        public decimal TotalMarks { get; set; } = 100;
        public bool IsActive { get; set; }
        public bool IsFreePreview { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<QuestionDto> Questions { get; set; } = new();
    }

    public class QuestionDto
    {
        public int Id { get; set; }
        public string GuidId { get; set; } = string.Empty;
        public int ExamId { get; set; }
        public int? SectionId { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public string Type { get; set; } = "singlechoice";
        public string Rationale { get; set; } = string.Empty;
        public double Weight { get; set; } = 1.0;
        public string Difficulty { get; set; } = "Medium";
        public bool IsCaseStudy { get; set; }
        public string? CaseStudyDataJson { get; set; }
        public int OrderIndex { get; set; }
        public List<QuestionOptionDto> Options { get; set; } = new();
        public List<QuestionMatrixDto> Matrices { get; set; } = new();
    }

    public class QuestionOptionDto
    {
        public int Id { get; set; }
        public string GuidId { get; set; } = string.Empty;
        public string OptionText { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
        public int OrderIndex { get; set; }
        public string? Explanation { get; set; }
    }

    public class QuestionMatrixDto
    {
        public int Id { get; set; }
        public string RowHeadersJson { get; set; } = "[]";
        public string ColumnHeadersJson { get; set; } = "[]";
        public string CorrectCellsJson { get; set; } = "[]";
        public string ResponseType { get; set; } = "singleChoice";
    }

    // Bulk Import DTO
    public class BulkExamImportRequest
    {
        public int SubjectId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int DurationMinutes { get; set; } = 120;
        public int PassingScorePercentage { get; set; } = 75;
        public List<ImportQuestionItem> Questions { get; set; } = new();
    }

    public class ImportQuestionItem
    {
        public string QuestionText { get; set; } = string.Empty;
        public string Type { get; set; } = "singlechoice";
        public string Rationale { get; set; } = string.Empty;
        public string Difficulty { get; set; } = "Medium";
        public bool IsCaseStudy { get; set; } = false;
        public string? CaseStudyDataJson { get; set; }
        public List<ImportOptionItem> Options { get; set; } = new();
        public ImportMatrixItem? Matrix { get; set; }
    }

    public class ImportOptionItem
    {
        public string OptionText { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
        public string? Explanation { get; set; }
    }

    public class ImportMatrixItem
    {
        public List<string> RowHeaders { get; set; } = new();
        public List<string> ColumnHeaders { get; set; } = new();
        public List<string> CorrectCells { get; set; } = new();
        public string ResponseType { get; set; } = "singleChoice";
    }

    // Subscription DTOs
    public class SubscriptionPackageDto
    {
        public int Id { get; set; }
        public string GuidId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int DurationDays { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; } = "USD";
        public string FeaturesJson { get; set; } = "[]";
        public bool IsActive { get; set; }
    }

    public class UserSubscriptionDto
    {
        public int Id { get; set; }
        public string GuidId { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string UserEmail { get; set; } = string.Empty;
        public string UserFullName { get; set; } = string.Empty;
        public int PackageId { get; set; }
        public string PackageTitle { get; set; } = string.Empty;
        public string Status { get; set; } = "Active";
        public string HasPaid { get; set; } = "paid";
        public DateTime ValidFrom { get; set; }
        public DateTime ValidUntil { get; set; }
        public string? TransactionReference { get; set; }
    }

    public class CreateSubscriptionRequest
    {
        public int UserId { get; set; }
        public int PackageId { get; set; }
        public string HasPaid { get; set; } = "paid";
        public string Status { get; set; } = "Active";
        public int DurationDays { get; set; } = 30;
    }
}
