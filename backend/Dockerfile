FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS kedoai
WORKDIR /app

# 拷贝所有发布文件到容器中
COPY . .

# 直接运行已编译的 DLL
ENTRYPOINT ["dotnet", "Kedo.Web.Entry.dll"]