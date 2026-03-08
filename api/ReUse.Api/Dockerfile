# 1. Usa o SDK do .NET 8 para compilar o projeto
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# 2. Copia o arquivo de configuração e restaura os pacotes (Npgsql, JWT, etc)
COPY *.csproj ./
RUN dotnet restore

# 3. Copia o resto do código e compila a versão final otimizada (Release)
COPY . ./
RUN dotnet publish -c Release -o out

# 4. Cria uma imagem super leve apenas com o motor de execução (Runtime)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .

# 5. Configura a porta que os serviços de nuvem modernos (como o Render) exigem no .NET 8
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

# 6. Dá o comando de inicialização
ENTRYPOINT ["dotnet", "ReUse.Api.dll"]
