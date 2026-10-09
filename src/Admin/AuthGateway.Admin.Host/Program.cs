using System.Diagnostics;
using AuthGateway.Admin.Host;
using Serilog;
using Serilog.Context;
using Serilog.Formatting.Compact;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddSerilog((services, logger) => logger
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Service", "AuthGateway.Admin")
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

builder.Services.AddAuthGatewayAdminModule(builder.Configuration);

WebApplication app = builder.Build();
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

app.MapAuthGatewayAdminModule();
app.Run();

public partial class Program;
