using System.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace AuthGateway.Admin.Presentation;

public static class PresentationRegistration
{
    public static IServiceCollection AddAdminPresentation(this IServiceCollection services)
    {
        services.AddProblemDetails(options => options.CustomizeProblemDetails = context =>
            context.ProblemDetails.Extensions["traceId"] =
                Activity.Current?.Id ?? context.HttpContext.TraceIdentifier);
        services.AddExceptionHandler<ApiExceptionHandler>();
        services.AddOpenApi();
        return services;
    }
}
