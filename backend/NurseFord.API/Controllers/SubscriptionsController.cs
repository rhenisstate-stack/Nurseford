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
    public class SubscriptionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SubscriptionsController(AppDbContext context)
        {
            _context = context;
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // SUBSCRIPTION PACKAGES LIST
        // Compatible with useDominionSubscriptionPackages & frontend packages page
        // ═══════════════════════════════════════════════════════════════════════════

        [HttpGet("packages")]
        [Route("/api/castoline/nexus/subscription/packages")]
        [Route("/api/castoline/nexus/subscription/packages/list/nominal")]
        public async Task<IActionResult> GetPackages()
        {
            var packages = await _context.SubscriptionPackages
                .Where(p => p.IsActive)
                .ToListAsync();

            var dtos = packages
                .OrderBy(p => p.Price)
                .Select(p => new SubscriptionPackageDto
            {
                Id = p.Id,
                GuidId = p.GuidId,
                Title = p.Title,
                Description = p.Description,
                DurationDays = p.DurationDays,
                Price = p.Price,
                Currency = p.Currency,
                FeaturesJson = p.FeaturesJson,
                IsActive = p.IsActive
            }).ToList();

            return Ok(new { success = true, data = dtos });
        }

        [HttpPost("packages")]
        public async Task<IActionResult> CreatePackage([FromBody] SubscriptionPackageDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title) || dto.Price < 0)
            {
                return BadRequest(new { message = "Package title and valid price are required." });
            }

            var package = new SubscriptionPackage
            {
                Title = dto.Title.Trim(),
                Description = dto.Description,
                DurationDays = dto.DurationDays > 0 ? dto.DurationDays : 30,
                Price = dto.Price,
                Currency = string.IsNullOrWhiteSpace(dto.Currency) ? "USD" : dto.Currency,
                FeaturesJson = string.IsNullOrWhiteSpace(dto.FeaturesJson) ? "[]" : dto.FeaturesJson,
                IsActive = dto.IsActive
            };

            _context.SubscriptionPackages.Add(package);
            await _context.SaveChangesAsync();

            dto.Id = package.Id;
            dto.GuidId = package.GuidId;
            return Ok(new { success = true, message = "Subscription package created successfully.", data = dto });
        }

        [HttpPut("packages/{id}")]
        public async Task<IActionResult> UpdatePackage(int id, [FromBody] SubscriptionPackageDto dto)
        {
            var package = await _context.SubscriptionPackages.FindAsync(id);
            if (package == null) return NotFound(new { message = "Package not found." });

            package.Title = dto.Title.Trim();
            package.Description = dto.Description;
            package.DurationDays = dto.DurationDays;
            package.Price = dto.Price;
            package.Currency = dto.Currency;
            package.FeaturesJson = dto.FeaturesJson;
            package.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Package updated successfully.", data = dto });
        }

        [HttpDelete("packages/{id}")]
        public async Task<IActionResult> DeletePackage(int id)
        {
            var package = await _context.SubscriptionPackages.FindAsync(id);
            if (package == null) return NotFound(new { message = "Package not found." });

            package.IsActive = false; // Soft delete
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Package deactivated successfully." });
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // USER SUBSCRIPTIONS (List & Access Verification)
        // ═══════════════════════════════════════════════════════════════════════════

        [HttpGet("user-subscriptions")]
        [Route("/api/castoline/nexus/subscription/item")]
        public async Task<IActionResult> GetUserSubscriptions([FromQuery] int? userId, [FromQuery] string? email)
        {
            var query = _context.UserSubscriptions
                .Include(s => s.User)
                .Include(s => s.Package)
                .AsQueryable();

            if (userId.HasValue)
            {
                query = query.Where(s => s.UserId == userId.Value);
            }
            else if (!string.IsNullOrWhiteSpace(email))
            {
                query = query.Where(s => s.User != null && s.User.Email.ToLower() == email.ToLower());
            }

            var subscriptions = await query.OrderByDescending(s => s.CreatedAt).ToListAsync();

            var dtos = subscriptions.Select(s => new UserSubscriptionDto
            {
                Id = s.Id,
                GuidId = s.GuidId,
                UserId = s.UserId,
                UserEmail = s.User?.Email ?? "",
                UserFullName = s.User?.FullName ?? "",
                PackageId = s.PackageId,
                PackageTitle = s.Package?.Title ?? "",
                Status = s.Status,
                HasPaid = s.HasPaid,
                ValidFrom = s.ValidFrom,
                ValidUntil = s.ValidUntil,
                TransactionReference = s.TransactionReference
            }).ToList();

            return Ok(new { success = true, data = dtos });
        }

        [HttpPost("grant")]
        public async Task<IActionResult> GrantSubscription([FromBody] CreateSubscriptionRequest request)
        {
            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null) return NotFound(new { message = "User not found." });

            var package = await _context.SubscriptionPackages.FindAsync(request.PackageId);
            if (package == null) return NotFound(new { message = "Subscription package not found." });

            var duration = request.DurationDays > 0 ? request.DurationDays : package.DurationDays;

            var subscription = new UserSubscription
            {
                UserId = request.UserId,
                PackageId = request.PackageId,
                Status = string.IsNullOrWhiteSpace(request.Status) ? "Active" : request.Status,
                HasPaid = string.IsNullOrWhiteSpace(request.HasPaid) ? "paid" : request.HasPaid,
                ValidFrom = DateTime.UtcNow,
                ValidUntil = DateTime.UtcNow.AddDays(duration),
                TransactionReference = $"MANUAL-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}"
            };

            _context.UserSubscriptions.Add(subscription);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = $"Successfully granted '{package.Title}' to {user.Email}.",
                subscriptionId = subscription.Id,
                validUntil = subscription.ValidUntil
            });
        }
    }
}
