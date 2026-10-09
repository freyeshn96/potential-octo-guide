FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /source
COPY src/global.json ./global.json
COPY src/ src/
RUN dotnet restore src/Server/AuthGateway.Server.Host/AuthGateway.Server.Host.csproj --configfile src/NuGet.Config
RUN dotnet publish src/Server/AuthGateway.Server.Host/AuthGateway.Server.Host.csproj -c Release --no-restore -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
USER root
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/publish .
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "AuthGateway.Server.Host.dll"]
