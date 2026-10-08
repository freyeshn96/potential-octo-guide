using Npgsql;

namespace AuthGateway.Admin.Infrastructure;

public sealed class DatabaseOptions
{
    public const string SectionName = "Database";
    public string ConnectionString { get; set; } = string.Empty;

    public bool IsValid()
    {
        try
        {
            var builder = new NpgsqlConnectionStringBuilder(ConnectionString);
            return !string.IsNullOrWhiteSpace(builder.Host)
                && !string.IsNullOrWhiteSpace(builder.Database)
                && !string.IsNullOrWhiteSpace(builder.Username)
                && builder.Timeout is > 0 and <= 30
                && builder.CommandTimeout is > 0 and <= 30;
        }
        catch (ArgumentException)
        {
            return false;
        }
    }
}
