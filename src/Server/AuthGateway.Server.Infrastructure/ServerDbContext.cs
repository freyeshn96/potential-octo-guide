using Microsoft.EntityFrameworkCore;

namespace AuthGateway.Server.Infrastructure;

public sealed class ServerDbContext(DbContextOptions<ServerDbContext> options) : DbContext(options);
