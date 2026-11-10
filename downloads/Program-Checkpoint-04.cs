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

            // TODO 02 — Completed: one value.
            await using (var connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();
                using var command = new SqlCommand(
                    "SELECT COUNT(*) FROM dbo.Students;", connection);
                object? result = await command.ExecuteScalarAsync();
                Console.WriteLine($"Student count: {result}");
            }

            // TODO 03 — Completed: multiple rows.
            await using (var connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();
                const string sql = "SELECT StudentId, FullName FROM dbo.Students ORDER BY StudentId;";
                using var command = new SqlCommand(sql, connection);
                await using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    int id = reader.GetInt32(0);
                    string name = reader.GetString(1);
                    Console.WriteLine($"{id}: {name}");
                }
            } // Reader is disposed before connection (reverse declaration order).
            // Input is collected AFTER earlier connection scopes have ended.
            Console.Write("Enter a positive StudentId (try 1, 4, 99 or abc): ");
            string? input = Console.ReadLine();
            if (!int.TryParse(input, out int studentId) || studentId <= 0)
            {
                Console.WriteLine("Enter a valid positive integer. Lookup was not sent to SQL Server.");
                return;
            }
            // TODO 04 — Completed: typed parameter and single-row lookup.
            await using (var connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();
                const string sql = "SELECT StudentId, FullName FROM dbo.Students WHERE StudentId = @studentId;";
                using var command = new SqlCommand(sql, connection);
                command.Parameters.Add("@studentId", SqlDbType.Int).Value = studentId;
                await using var reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    Console.WriteLine($"Student: {reader.GetInt32(0)} — {reader.GetString(1)}");
                }
                else
                {
                    Console.WriteLine("Student not found.");
                }
            }

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
