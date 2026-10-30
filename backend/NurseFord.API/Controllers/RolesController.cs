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
    public class RolesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RolesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Route("/api/roles")]
        [Route("/api/admin/roles")]
        [Route("/api/castoline/system/user/role")]
        [Route("/api/castoline/system/user/role/list/nominal")]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _context.Roles
                .Include(r => r.Users)
                .OrderBy(r => r.Rank)
                .ToListAsync();

            var dtos = roles.Select(r => new RoleDto
            {
                Id = r.Id,
                GuidId = r.GuidId,
                Name = r.Name,
                Rank = r.Rank,
                Description = r.Description,
                UserCount = r.Users.Count
            }).ToList();

            return Ok(new { success = true, data = dtos });
        }

        [HttpPost("assign")]
        [Route("/api/admin/roles/assign")]
        public async Task<IActionResult> AssignRole([FromBody] AssignRoleRequest request)
        {
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == request.UserId);
            if (user == null) return NotFound(new { message = "User not found." });

            var role = await _context.Roles.FindAsync(request.RoleId);
            if (role == null) return NotFound(new { message = "Role not found." });

            user.RoleId = role.Id;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = $"Assigned role '{role.Name}' to {user.Email}.",
                user = new
                {
                    user.Id,
                    user.Email,
                    user.FullName,
                    Role = role.Name,
                    role.Rank
                }
            });
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Route("/api/admin/users")]
        public async Task<IActionResult> GetUsers([FromQuery] string? search, [FromQuery] int? roleId)
        {
            var query = _context.Users
                .Include(u => u.Role)
                .Include(u => u.Subscriptions)
                    .ThenInclude(s => s.Package)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLower();
                query = query.Where(u => u.Email.ToLower().Contains(s) || u.FullName.ToLower().Contains(s));
            }

            if (roleId.HasValue)
            {
                query = query.Where(u => u.RoleId == roleId.Value);
            }

            var users = await query.OrderBy(u => u.Role!.Rank).ThenByDescending(u => u.CreatedAt).ToListAsync();

            var dtos = users.Select(u => new UserDto
            {
                Id = u.Id,
                GuidId = u.GuidId,
                Email = u.Email,
                FullName = u.FullName,
                PhoneNumber = u.PhoneNumber,
                Role = u.Role?.Name ?? "Learner",
                RoleRank = u.Role?.Rank ?? 4,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt,
                Subscriptions = u.Subscriptions.Select(s => new UserSubscriptionDto
                {
                    Id = s.Id,
                    GuidId = s.GuidId,
                    UserId = s.UserId,
                    PackageId = s.PackageId,
                    PackageTitle = s.Package?.Title ?? "",
                    Status = s.Status,
                    HasPaid = s.HasPaid,
                    ValidFrom = s.ValidFrom,
                    ValidUntil = s.ValidUntil
                }).ToList()
            }).ToList();

            return Ok(new { success = true, data = dtos });
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> ToggleUserStatus(int id, [FromBody] bool isActive)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "User not found." });

            user.IsActive = isActive;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = $"User status updated to {(isActive ? "Active" : "Inactive")}." });
        }
    }
}
