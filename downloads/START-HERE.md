# DB3 Session 02 — Student starter

1. Extract the ZIP into a normal writable folder.
2. In Visual Studio, open DB3.Session02.csproj (not a .NET Framework project).
3. Allow NuGet package restore. This requires internet unless packages are cached.
4. Run with Ctrl+F5. The untouched starter prints honest TODO messages and asks for an ID; it does not contact SQL Server.
5. Use the website to complete TODO 00 through TODO 04 one at a time. TODO 05 is the guided extension.
6. Run setup.sql in SSMS against the same instance before implementing database queries.

Project: .NET 8, C# 12, Microsoft.Data.SqlClient 6.1.4 (pinned package reference).
Use Visual Studio 2022 17.8+ with .NET 8 SDK and .NET desktop development workload.
This package version was verified on NuGet; compilation and SQL Server execution were not performed in the authoring environment. Instructor must verify the classroom configuration.

Copy the exact SSMS server name into TODO 00. The example is Windows authentication. LocalDB names work only on Windows with that instance installed.
Encrypt=True keeps encryption enabled. TrustServerCertificate=True bypasses certificate validation for a local classroom instance only. Production needs a trusted certificate and validation.
Never submit real SQL passwords. Ask the instructor for approved SQL-authentication configuration if required.

Submit Program.cs containing your name, TODO 04 implementation, correct invalid/not-found handling, and a comment explaining the typed parameter. You do not need a menu or full CRUD.
