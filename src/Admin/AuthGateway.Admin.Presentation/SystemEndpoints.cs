using AuthGateway.Contracts;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace AuthGateway.Admin.Presentation;

public static class SystemEndpoints
{
    public static IEndpointRouteBuilder MapAdminEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapHealthChecks("/health/live", new HealthCheckOptions
        {
            Predicate = _ => false
        });
        endpoints.MapHealthChecks("/health/ready", new HealthCheckOptions
        {
            Predicate = check => check.Tags.Contains("ready"),
            AllowCachingResponses = false
        });
        endpoints.MapGet("/api/v1/system/info", () =>
            new SystemInformation("AuthGateway.Admin", "running",
                typeof(SystemEndpoints).Assembly.GetName().Version?.ToString(3) ?? "1.0.0"))
            .WithName("GetAdminSystemInfo")
            .WithTags("System")
            .Produces<SystemInformation>();
        return endpoints;
    }
}
