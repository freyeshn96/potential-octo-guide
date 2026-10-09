using System.Diagnostics;
using AuthGateway.Server.Application.Providers;
using AuthGateway.Server.Host;
using Serilog;
using Serilog.Context;
using Serilog.Formatting.Compact;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddSerilog((services, logger) => logger
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Service", "AuthGateway.Server")
    .Enrich.WithProperty("Environment", builder.Environment.EnvironmentName)
    .WriteTo.Console(new RenderedCompactJsonFormatter()));

builder.Services.AddOptions<ApiOptions>()
    .Bind(builder.Configuration.GetSection(ApiOptions.SectionName))
    .Validate(options => options.AllowedOrigins.All(origin =>
        Uri.TryCreate(origin, UriKind.Absolute, out Uri? uri)
        && uri is not null
        && uri.Scheme is "http" or "https" && uri.AbsolutePath == "/"
        && string.IsNullOrEmpty(uri.Query) && string.IsNullOrEmpty(uri.Fragment)),
        "Api:AllowedOrigins must contain HTTP(S) origins without paths, queries, or fragments.")
    .ValidateOnStart();

builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
{
    string[] origins = builder.Configuration.GetSection("Api:AllowedOrigins").Get<string[]>() ?? [];
    if (origins.Length > 0)
    {
        policy.WithOrigins(origins).WithMethods("GET").WithHeaders("Content-Type");
    }
}));

builder.Services.AddAuthGatewayServerModule(builder.Configuration);

WebApplication app = builder.Build();
if (args.Contains("--provider-diagnostics", StringComparer.Ordinal))
{
    if (!app.Environment.IsDevelopment())
        throw new InvalidOperationException("Provider console diagnostics are restricted to Development.");
    using CancellationTokenSource cancellation = new(TimeSpan.FromMinutes(1));
    ProviderDiagnosticReport report = await app.Services.GetRequiredService<IProviderDiagnostics>()
        .DiagnoseAsync(cancellation.Token);
    foreach (ProviderDiagnosticCheck check in report.Checks)
        Console.WriteLine($"{check.Stage}: {check.Error?.ToString() ?? "Succeeded"}");
    Environment.ExitCode = report.Succeeded ? 0 : 1;
    await app.DisposeAsync();
    return;
}
app.Use(async (context, next) =>
{
    using (LogContext.PushProperty("TraceId", Activity.Current?.Id ?? context.TraceIdentifier))
    {
        await next(context);
    }
});
app.UseSerilogRequestLogging();
app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapAuthGatewayServerModule();
app.Run();

public partial class Program;
