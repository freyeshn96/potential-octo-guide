namespace AuthGateway.Admin.Host;

public sealed class ApiOptions
{
    public const string SectionName = "Api";
    public string[] AllowedOrigins { get; set; } = [];
}
