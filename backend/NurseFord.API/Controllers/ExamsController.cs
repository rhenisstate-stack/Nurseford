using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NurseFord.API.Data;
using NurseFord.API.DTOs;
using NurseFord.API.Models;

namespace NurseFord.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExamsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ExamsController(AppDbContext context)
        {
            _context = context;
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // EXAMS LIST (Compatible with frontend Strata hooks & nominal/absolute calls)
        // ═══════════════════════════════════════════════════════════════════════════

        [HttpGet]
        [Route("/api/exams")]
        [Route("/api/admin/exams")]
        [Route("/api/castoline/strata/assessment/exams")]
        [Route("/api/castoline/strata/assessment/exams/list")]
        [Route("/api/castoline/strata/assessment/exams/list/nominal")]
        [Route("/api/castoline/strata/assessment/exams/list/absolute")]
        [Route("/api/castoline/strata/assessment/exams/list/relative")]
        [Route("/api/castoline/strata/assessment/exams/list/live")]
        public async Task<IActionResult> GetExams([FromQuery] int? subjectId, [FromQuery] int? courseId, [FromQuery] string? identifier)
        {
            var query = _context.Exams
                .Include(e => e.Subject)
                    .ThenInclude(s => s!.Course)
                .Include(e => e.Questions)
                .AsQueryable();

            if (subjectId.HasValue)
            {
                query = query.Where(e => e.SubjectId == subjectId.Value);
            }
            else if (!string.IsNullOrWhiteSpace(identifier))
            {
                if (int.TryParse(identifier, out int sId))
                {
                    query = query.Where(e => e.SubjectId == sId);
                }
                else
                {
                    query = query.Where(e => e.Subject != null && e.Subject.GuidId == identifier);
                }
            }
            if (courseId.HasValue)
            {
                query = query.Where(e => e.Subject != null && e.Subject.CourseId == courseId.Value);
            }

            var exams = await query.OrderByDescending(e => e.CreatedAt).ToListAsync();

            var dtos = exams.Select(e => new ExamDto
            {
                Id = e.Id,
                GuidId = e.GuidId,
                SubjectId = e.SubjectId,
                SubjectName = e.Subject?.Name ?? "",
                CourseName = e.Subject?.Course?.Name ?? "",
                Title = e.Title,
                Description = e.Description,
                DurationMinutes = e.DurationMinutes,
                PassingScorePercentage = e.PassingScorePercentage,
                TotalQuestions = e.Questions.Count,
                QuestionsCount = e.Questions.Count,
                SectionsCount = 1,
                TotalMarks = 100,
                IsActive = e.IsActive,
                IsFreePreview = e.IsFreePreview,
                CreatedAt = e.CreatedAt
            }).ToList();

            return Ok(new
            {
                success = true,
                data = new
                {
                    items = dtos,
                    total = dtos.Count
                },
                items = dtos
            });
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // EXAM RESULTS & SESSIONS (Compatible with results route)
        // ═══════════════════════════════════════════════════════════════════════════

        [HttpGet]
        [Route("/api/castoline/strata/assessment/exams/results/list/relative")]
        [Route("/api/castoline/strata/assessment/exams/results/list/nominal")]
        [Route("/api/castoline/strata/assessment/exams/results/list/absolute")]
        public async Task<IActionResult> GetExamResults([FromQuery] int? userId)
        {
            var query = _context.UserExamSessions
                .Include(s => s.Exam)
                .Include(s => s.User)
                .AsQueryable();

            if (userId.HasValue)
            {
                query = query.Where(s => s.UserId == userId.Value);
            }

            var sessions = await query.OrderByDescending(s => s.StartedAt).Take(50).ToListAsync();

            var dtos = sessions.Select(s => new
            {
                id = s.Id,
                guidId = s.GuidId,
                examId = s.ExamId,
                examTitle = s.Exam?.Title ?? "Exam Practice",
                userId = s.UserId,
                userName = s.User?.FullName ?? "Learner",
                score = s.Score,
                totalAnswered = s.TotalAnswered,
                status = s.Status,
                startedAt = s.StartedAt,
                completedAt = s.CompletedAt
            }).ToList();

            int totalCount = dtos.Count;

            return Ok(new
            {
                success = true,
                data = new
                {
                    items = dtos,
                    total = totalCount
                },
                items = dtos
            });
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // LIVE EXAM SESSION PAYLOAD (Full questions, options, matrices, and case studies)
        // Compatible with useLiveStrataExamsHook & QuestionTypes.tsx dispatcher
        // ═══════════════════════════════════════════════════════════════════════════

        [HttpGet("{id}")]
        [Route("/api/castoline/strata/assessment/exams/{id}")]
        [Route("/api/castoline/strata/assessment/exams/{id}/live")]
        public async Task<IActionResult> GetExamById(int id)
        {
            var exam = await _context.Exams
                .Include(e => e.Subject)
                    .ThenInclude(s => s!.Course)
                .Include(e => e.Sections)
                .Include(e => e.Questions)
                    .ThenInclude(q => q.Options)
                .Include(e => e.Questions)
                    .ThenInclude(q => q.Matrices)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (exam == null)
            {
                return NotFound(new { success = false, message = "Exam not found." });
            }

            // Map into the format expected by the live exam runner
            var mappedQuestions = exam.Questions.OrderBy(q => q.OrderIndex).Select(q => new
            {
                id = q.Id,
                guidId = q.GuidId,
                questionText = q.QuestionText,
                type = q.Type.ToLowerInvariant(),
                description = q.Rationale,
                weight = q.Weight,
                difficulty = q.Difficulty,
                isFeatured = q.IsFeatured,
                isCaseStudy = q.IsCaseStudy,
                caseStudyData = q.CaseStudyDataJson,
                questionOptions = q.Options.OrderBy(o => o.OrderIndex).Select(o => new
                {
                    id = o.Id,
                    guidId = o.GuidId,
                    questionId = q.Id,
                    optionText = o.OptionText,
                    isCorrect = o.IsCorrect,
                    orderIndex = o.OrderIndex,
                    explanation = o.Explanation
                }).ToList(),
                questionMatrices = q.Matrices.Select(m => new
                {
                    id = m.Id,
                    questionId = q.Id,
                    rowHeaders = m.RowHeadersJson,
                    columnHeaders = m.ColumnHeadersJson,
                    correctCells = m.CorrectCellsJson,
                    responseType = m.ResponseType
                }).ToList(),
                questionCorrectAnswers = q.Options.Where(o => o.IsCorrect).Select(o => new
                {
                    id = o.Id,
                    guidId = o.GuidId,
                    questionId = q.Id,
                    questionOptionId = o.Id,
                    isCorrect = true,
                    description = q.Rationale
                }).ToList()
            }).ToList();

            var responsePayload = new
            {
                success = true,
                message = "Exam loaded successfully.",
                id = exam.Id,
                guidId = exam.GuidId,
                title = exam.Title,
                description = exam.Description,
                durationMinutes = exam.DurationMinutes,
                passingScorePercentage = exam.PassingScorePercentage,
                totalQuestions = exam.Questions.Count,
                subjectId = exam.SubjectId,
                subjectName = exam.Subject?.Name ?? "",
                courseName = exam.Subject?.Course?.Name ?? "",
                sections = exam.Sections.Select(s => new
                {
                    id = s.Id,
                    guidId = s.GuidId,
                    name = s.Name,
                    orderIndex = s.OrderIndex
                }).ToList(),
                questions = mappedQuestions
            };

            return Ok(new { success = true, data = responsePayload });
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // ADMIN: CREATE / EDIT / DELETE EXAM
        // ═══════════════════════════════════════════════════════════════════════════

        [HttpPost]
        public async Task<IActionResult> CreateExam([FromBody] ExamDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title) || dto.SubjectId <= 0)
            {
                return BadRequest(new { message = "Title and SubjectId are required." });
            }

            var exam = new Exam
            {
                SubjectId = dto.SubjectId,
                Title = dto.Title.Trim(),
                Description = dto.Description,
                DurationMinutes = dto.DurationMinutes > 0 ? dto.DurationMinutes : 120,
                PassingScorePercentage = dto.PassingScorePercentage > 0 ? dto.PassingScorePercentage : 75,
                IsActive = dto.IsActive,
                IsFreePreview = dto.IsFreePreview,
                CreatedAt = DateTime.UtcNow
            };

            // Default Section
            exam.Sections.Add(new Section { Name = "General Questions", OrderIndex = 1 });

            _context.Exams.Add(exam);
            await _context.SaveChangesAsync();

            dto.Id = exam.Id;
            dto.GuidId = exam.GuidId;
            return Ok(new { success = true, message = "Exam created successfully.", data = dto });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateExam(int id, [FromBody] ExamDto dto)
        {
            var exam = await _context.Exams.FindAsync(id);
            if (exam == null) return NotFound(new { message = "Exam not found." });

            exam.SubjectId = dto.SubjectId;
            exam.Title = dto.Title.Trim();
            exam.Description = dto.Description;
            exam.DurationMinutes = dto.DurationMinutes;
            exam.PassingScorePercentage = dto.PassingScorePercentage;
            exam.IsActive = dto.IsActive;
            exam.IsFreePreview = dto.IsFreePreview;

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Exam updated successfully.", data = dto });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExam(int id)
        {
            var exam = await _context.Exams
                .Include(e => e.Questions)
                    .ThenInclude(q => q.Options)
                .Include(e => e.Sections)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (exam == null) return NotFound(new { message = "Exam not found." });

            _context.Exams.Remove(exam);
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Exam deleted successfully." });
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // ADMIN: BULK EXAM & QUESTION LOADER
        // Loads complete question banks with options, correct answers, matrices, and NGN case studies
        // ═══════════════════════════════════════════════════════════════════════════

        [HttpPost("bulk-import")]
        [Route("/api/admin/exams/bulk-import")]
        public async Task<IActionResult> BulkImportExam([FromBody] BulkExamImportRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Title) || request.SubjectId <= 0)
            {
                return BadRequest(new { message = "Exam Title and SubjectId are required." });
            }

            var subject = await _context.Subjects.FindAsync(request.SubjectId);
            if (subject == null)
            {
                return NotFound(new { message = $"Subject with ID {request.SubjectId} does not exist." });
            }

            var exam = new Exam
            {
                SubjectId = request.SubjectId,
                Title = request.Title.Trim(),
                Description = request.Description,
                DurationMinutes = request.DurationMinutes > 0 ? request.DurationMinutes : 120,
                PassingScorePercentage = request.PassingScorePercentage > 0 ? request.PassingScorePercentage : 75,
                TotalQuestions = request.Questions.Count,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var defaultSection = new Section { Name = "Comprehensive Assessment", OrderIndex = 1 };
            exam.Sections.Add(defaultSection);

            int qIndex = 1;
            foreach (var qItem in request.Questions)
            {
                var question = new Question
                {
                    Section = defaultSection,
                    QuestionText = qItem.QuestionText,
                    Type = string.IsNullOrWhiteSpace(qItem.Type) ? "singlechoice" : qItem.Type.ToLowerInvariant(),
                    Rationale = qItem.Rationale ?? "",
                    Difficulty = string.IsNullOrWhiteSpace(qItem.Difficulty) ? "Medium" : qItem.Difficulty,
                    IsCaseStudy = qItem.IsCaseStudy,
                    CaseStudyDataJson = qItem.CaseStudyDataJson,
                    OrderIndex = qIndex++
                };

                // Add Options
                int oIndex = 1;
                foreach (var opt in qItem.Options)
                {
                    question.Options.Add(new QuestionOption
                    {
                        OptionText = opt.OptionText,
                        IsCorrect = opt.IsCorrect,
                        Explanation = opt.Explanation,
                        OrderIndex = oIndex++
                    });
                }

                // Add Matrix if matrix question type
                if (qItem.Matrix != null && (question.Type.Contains("matrix") || qItem.Matrix.RowHeaders.Any()))
                {
                    question.Matrices.Add(new QuestionMatrix
                    {
                        RowHeadersJson = System.Text.Json.JsonSerializer.Serialize(qItem.Matrix.RowHeaders),
                        ColumnHeadersJson = System.Text.Json.JsonSerializer.Serialize(qItem.Matrix.ColumnHeaders),
                        CorrectCellsJson = System.Text.Json.JsonSerializer.Serialize(qItem.Matrix.CorrectCells),
                        ResponseType = qItem.Matrix.ResponseType
                    });
                }

                exam.Questions.Add(question);
            }

            _context.Exams.Add(exam);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = $"Successfully imported exam '{exam.Title}' with {exam.Questions.Count} questions.",
                examId = exam.Id,
                totalQuestions = exam.Questions.Count
            });
        }
    }
}
