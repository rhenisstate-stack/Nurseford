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
    public class HierarchyController : ControllerBase
    {
        private readonly AppDbContext _context;

        public HierarchyController(AppDbContext context)
        {
            _context = context;
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // ═══════════════════════════════════════════════════════════════════════════
        // PROGRAMS (Top-level academic disciplines for learning strata)
        // ═══════════════════════════════════════════════════════════════════════════

        [HttpGet]
        [Route("/api/castoline/strata/learning/programs/list/absolute")]
        [Route("/api/castoline/strata/learning/programs/list/distinct")]
        [Route("/api/castoline/strata/learning/programs/list/nominal")]
        public async Task<IActionResult> GetPrograms()
        {
            var courses = await _context.Courses.OrderBy(c => c.DisplayOrder).ToListAsync();
            var programs = new List<object>
            {
                new { id = 1, guidId = "course-rn-0001", name = "RN Nursing Exams", programName = "RN Nursing Exams" },
                new { id = 2, guidId = "course-lpn-0002", name = "LPN Nursing Exams", programName = "LPN Nursing Exams" },
                new { id = 3, guidId = "course-nclex-rn-0003", name = "NCLEX RN", programName = "NCLEX RN" },
                new { id = 4, guidId = "course-nclex-pn-0004", name = "NCLEX PN", programName = "NCLEX PN" },
                new { id = 5, guidId = "course-ati-teas-0005", name = "ATI TEAS", programName = "ATI TEAS" },
                new { id = 6, guidId = "course-hesi-a2-0006", name = "HESI A2", programName = "HESI A2" }
            };

            return Ok(new
            {
                success = true,
                data = new
                {
                    items = programs,
                    total = programs.Count
                },
                items = programs
            });
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // COURSES
        // ═══════════════════════════════════════════════════════════════════════════

        [HttpGet("courses")]
        [Route("/api/courses")]
        [Route("/api/admin/courses")]
        [Route("/api/castoline/strata/learning/courses")]
        [Route("/api/castoline/strata/learning/courses/list/distinct")]
        [Route("/api/castoline/strata/learning/courses/list/nominal")]
        [Route("/api/castoline/strata/learning/courses/list/absolute")]
        [Route("/api/castoline/strata/learning/courses/list/relative")]
        public async Task<IActionResult> GetCourses([FromQuery] string? identifier)
        {
            var query = _context.Courses.Include(c => c.Subjects).AsQueryable();

            if (!string.IsNullOrWhiteSpace(identifier))
            {
                if (int.TryParse(identifier, out int courseId))
                {
                    query = query.Where(c => c.Id == courseId);
                }
                else
                {
                    query = query.Where(c => c.GuidId == identifier || c.Slug.ToLower() == identifier.ToLower());
                }
            }

            var courses = await query.OrderBy(c => c.DisplayOrder).ToListAsync();

            var dtos = courses.Select(c => new CourseDto
            {
                Id = c.Id,
                GuidId = c.GuidId,
                Name = c.Name,
                Slug = c.Slug,
                Description = c.Description,
                Icon = c.Icon,
                DisplayOrder = c.DisplayOrder,
                IsActive = c.IsActive,
                SubjectCount = c.Subjects.Count,
                Subjects = c.Subjects.Select(s => new SubjectDto
                {
                    Id = s.Id,
                    GuidId = s.GuidId,
                    CourseId = s.CourseId,
                    CourseName = c.Name,
                    Name = s.Name,
                    Slug = s.Slug,
                    Description = s.Description,
                    DisplayOrder = s.DisplayOrder,
                    IsActive = s.IsActive
                }).ToList()
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

        [HttpPost("courses")]
        public async Task<IActionResult> CreateCourse([FromBody] CourseDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Slug))
            {
                return BadRequest(new { message = "Course name and slug are required." });
            }

            var course = new Course
            {
                Name = dto.Name.Trim(),
                Slug = dto.Slug.Trim().ToLower(),
                Description = dto.Description,
                Icon = string.IsNullOrWhiteSpace(dto.Icon) ? "GraduationCap" : dto.Icon,
                DisplayOrder = dto.DisplayOrder,
                IsActive = dto.IsActive
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            dto.Id = course.Id;
            dto.GuidId = course.GuidId;
            return Ok(new { success = true, message = "Course created successfully.", data = dto });
        }

        [HttpPut("courses/{id}")]
        public async Task<IActionResult> UpdateCourse(int id, [FromBody] CourseDto dto)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null) return NotFound(new { message = "Course not found." });

            course.Name = dto.Name.Trim();
            course.Slug = dto.Slug.Trim().ToLower();
            course.Description = dto.Description;
            course.Icon = dto.Icon;
            course.DisplayOrder = dto.DisplayOrder;
            course.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Course updated successfully.", data = dto });
        }

        [HttpDelete("courses/{id}")]
        public async Task<IActionResult> DeleteCourse(int id)
        {
            var course = await _context.Courses.Include(c => c.Subjects).FirstOrDefaultAsync(c => c.Id == id);
            if (course == null) return NotFound(new { message = "Course not found." });

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Course deleted successfully." });
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // SUBJECTS
        // ═══════════════════════════════════════════════════════════════════════════

        [HttpGet("subjects")]
        [Route("/api/subjects")]
        [Route("/api/admin/subjects")]
        [Route("/api/castoline/strata/learning/subjects")]
        [Route("/api/castoline/strata/learning/subjects/list/distinct")]
        [Route("/api/castoline/strata/learning/subjects/list/nominal")]
        [Route("/api/castoline/strata/learning/subjects/list/absolute")]
        [Route("/api/castoline/strata/learning/subjects/list/relative")]
        public async Task<IActionResult> GetSubjects([FromQuery] int? courseId, [FromQuery] string? courseSlug, [FromQuery] string? identifier)
        {
            var query = _context.Subjects.Include(s => s.Course).Include(s => s.Exams).AsQueryable();

            if (courseId.HasValue)
            {
                query = query.Where(s => s.CourseId == courseId.Value);
            }
            else if (!string.IsNullOrWhiteSpace(identifier))
            {
                if (int.TryParse(identifier, out int idVal))
                {
                    query = query.Where(s => s.CourseId == idVal || s.Id == idVal);
                }
                else
                {
                    query = query.Where(s => (s.Course != null && s.Course.GuidId == identifier) || s.GuidId == identifier);
                }
            }
            else if (!string.IsNullOrWhiteSpace(courseSlug))
            {
                query = query.Where(s => s.Course != null && s.Course.Slug.ToLower() == courseSlug.ToLower());
            }

            var subjects = await query.OrderBy(s => s.DisplayOrder).ToListAsync();

            var dtos = subjects.Select(s => new SubjectDto
            {
                Id = s.Id,
                GuidId = s.GuidId,
                CourseId = s.CourseId,
                CourseName = s.Course?.Name ?? "",
                Name = s.Name,
                Slug = s.Slug,
                Description = s.Description,
                DisplayOrder = s.DisplayOrder,
                IsActive = s.IsActive,
                ExamCount = s.Exams.Count
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
        // UNITS
        // ═══════════════════════════════════════════════════════════════════════════

        [HttpGet]
        [Route("/api/castoline/strata/learning/units/list/distinct")]
        [Route("/api/castoline/strata/learning/units/list/nominal")]
        [Route("/api/castoline/strata/learning/units/list/absolute")]
        [Route("/api/castoline/strata/learning/units/list/relative")]
        public IActionResult GetUnits([FromQuery] string? identifier)
        {
            return Ok(new
            {
                success = true,
                data = new
                {
                    items = Array.Empty<object>(),
                    total = 0
                },
                items = Array.Empty<object>()
            });
        }

        [HttpPost("subjects")]
        public async Task<IActionResult> CreateSubject([FromBody] SubjectDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || dto.CourseId <= 0)
            {
                return BadRequest(new { message = "Subject name and CourseId are required." });
            }

            var subject = new Subject
            {
                CourseId = dto.CourseId,
                Name = dto.Name.Trim(),
                Slug = string.IsNullOrWhiteSpace(dto.Slug)
                    ? dto.Name.Trim().ToLower().Replace(" ", "-")
                    : dto.Slug.Trim().ToLower(),
                Description = dto.Description,
                DisplayOrder = dto.DisplayOrder,
                IsActive = dto.IsActive
            };

            _context.Subjects.Add(subject);
            await _context.SaveChangesAsync();

            dto.Id = subject.Id;
            dto.GuidId = subject.GuidId;
            return Ok(new { success = true, message = "Subject created successfully.", data = dto });
        }

        [HttpPut("subjects/{id}")]
        public async Task<IActionResult> UpdateSubject(int id, [FromBody] SubjectDto dto)
        {
            var subject = await _context.Subjects.FindAsync(id);
            if (subject == null) return NotFound(new { message = "Subject not found." });

            subject.CourseId = dto.CourseId;
            subject.Name = dto.Name.Trim();
            subject.Slug = dto.Slug.Trim().ToLower();
            subject.Description = dto.Description;
            subject.DisplayOrder = dto.DisplayOrder;
            subject.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Subject updated successfully.", data = dto });
        }

        [HttpDelete("subjects/{id}")]
        public async Task<IActionResult> DeleteSubject(int id)
        {
            var subject = await _context.Subjects.Include(s => s.Exams).FirstOrDefaultAsync(s => s.Id == id);
            if (subject == null) return NotFound(new { message = "Subject not found." });

            _context.Subjects.Remove(subject);
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Subject deleted successfully." });
        }
    }
}
