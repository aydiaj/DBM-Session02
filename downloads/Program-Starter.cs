using System.Data;
using Microsoft.Data.SqlClient;

// DB3 Session 02 — complete ONE numbered TODO at a time.
// This is a supplied project. Supporting input and error handling are ready.

Console.WriteLine("DB3 — From SQL Queries to C# Results");

// TODO 00 — Replace YOUR_SERVER using the server name shown in SSMS.
// TrustServerCertificate=True is for this LOCAL classroom SQL Server only.
// It bypasses certificate validation; do not copy it into a production app.
string connectionString =
    @"Server=YOUR_SERVER;Database=TVET_DBM_Lab01;Integrated Security=True;Encrypt=True;TrustServerCertificate=True;Connect Timeout=10;";

try
{
    // TODO 01 — Create and open the connection.
    // Replace the message with an await using block.
    // Construct SqlConnection, print its State, then await OpenAsync().
    // Print State again. Leave the block to dispose the connection.
    Console.WriteLine("TODO 01: connection is not implemented yet.");

    // TODO 02 — Count students.
    // In a NEW short connection scope, open the connection.
    // Create a SqlCommand for SELECT COUNT(*) FROM dbo.Students;
    // Use ExecuteScalarAsync() and print the returned value.
    Console.WriteLine("TODO 02: student count is not implemented yet.");

    // TODO 03 — Read student rows.
    // In a NEW short connection scope, run the supplied SELECT.
    // Use ExecuteReaderAsync(), then while (await reader.ReadAsync()).
    // Read column 0 as int and column 1 as string.
    Console.WriteLine("TODO 03: student list is not implemented yet.");
    // Input is collected AFTER earlier connection scopes have ended.
    Console.Write("Enter a positive StudentId (try 1, 4, 99 or abc): ");
    string? input = Console.ReadLine();
    if (!int.TryParse(input, out int studentId) || studentId <= 0)
    {
        Console.WriteLine("Enter a valid positive integer. Lookup was not sent to SQL Server.");
        return;
    }
    // TODO 04 — Find a student safely.
    // studentId is already validated above. Open a NEW short connection.
    // Use WHERE StudentId = @studentId and a typed SqlDbType.Int parameter.
    // Read the matching row or print Student not found.
    Console.WriteLine("TODO 04: student lookup is not implemented yet.");

    // TODO 05 — Guided extension: read student enrollments.
    // Reuse studentId in a NEW short connection scope.
    // Use the supplied INNER JOIN, a typed parameter and a reader loop.
    // If no rows are returned, print No enrollments found for this ID.
    Console.WriteLine("TODO 05: enrollment report is not implemented yet.");
}
catch (SqlException ex)
{
    Console.WriteLine($"SQL Server error {ex.Number}: {ex.Message}");
    Console.WriteLine("Check the server connection, database setup and SQL command.");
}
catch (ArgumentException ex)
{
    Console.WriteLine($"Check the connection string: {ex.Message}");
}
