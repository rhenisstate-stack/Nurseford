using System;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using NurseFord.API.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. JSON formatting (camelCase for Next.js frontend compatibility)
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

// 2. Database Provider Configuration (PostgreSQL with SQLite local fallback)
var provider = builder.Configuration["DatabaseProvider"] ?? "Sqlite";
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

if (provider.Equals("PostgreSQL", StringComparison.OrdinalIgnoreCase) && !string.IsNullOrWhiteSpace(connectionString))
{
    Console.WriteLine($"[Database] Connecting to PostgreSQL Database...");
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(connectionString));
}
else
{
    var sqliteConnection = builder.Configuration.GetConnectionString("SqliteConnection") ?? "Data Source=nurseford.db";
    Console.WriteLine($"[Database] Running in SQLite Mode ({sqliteConnection})...");
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlite(sqliteConnection));
}

// 3. CORS for Next.js frontend (localhost:3000)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 4. JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "NurseFordSuperSecretJWTKey2026!#NurseFord";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "NurseFordAPI",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "NurseFordWeb",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

// 5. Swagger / OpenAPI Configuration
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "NurseFord API", Version = "v1", Description = "Custom ASP.NET Core Backend for NurseFord Platform" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using Bearer scheme. Example: 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 6. Database auto-init & seed
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        db.Database.EnsureCreated();
        Console.WriteLine("[Database] Database initialized and seeded successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[Database Error] Initialization warning: {ex.Message}");
    }
}

// 7. Pipeline configuration
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
