using System.Data;
using Microsoft.Data.SqlClient;

// Student name: __________________________
// DB3 Session 02 — complete ONE numbered TODO at a time.
// This is a supplied project. Supporting input and error handling are ready.
internal static class Program
{
    private static async Task Main()
    {
        // Keeps the supplied async scaffold runnable before TODO 01 is completed.
        await Task.CompletedTask;
        Console.WriteLine("DB3 — From SQL Queries to C# Results");

        // TODO 00 — Replace YOUR_SERVER using the server name shown in SSMS.
        // This example uses Windows authentication; ask your instructor if yours differs.
        // TrustServerCertificate=True is for this LOCAL classroom SQL Server only.
        // It bypasses certificate validation; do not copy it into a production app.
        string connectionString =
            @"Server=YOUR_SERVER;Database=TVET_DBM_Lab01;Integrated Security=True;Encrypt=True;TrustServerCertificate=True;Connect Timeout=10;";

        try
        {
            // TODO 01 — Completed: create, open and dispose a connection.
            await using (var connection = new SqlConnection(connectionString))
            {
                Console.WriteLine($"Before OpenAsync: {connection.State}");
                await connection.OpenAsync();
                Console.WriteLine($"After OpenAsync: {connection.State}");
            } // DisposeAsync runs here, including when the block exits by exception.

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
            Console.WriteLine("Check the instance, authentication and database setup with your instructor.");
        }
        catch (ArgumentException ex)
        {
            Console.WriteLine($"Check the connection string: {ex.Message}");
        }
    }
}
