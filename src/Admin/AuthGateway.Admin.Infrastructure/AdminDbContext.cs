using Microsoft.EntityFrameworkCore;

namespace AuthGateway.Admin.Infrastructure;

public sealed class AdminDbContext(DbContextOptions<AdminDbContext> options) : DbContext(options);
