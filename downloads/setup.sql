-- DB3 Session 02. Run this entire file in SSMS on the SAME instance as C#.
-- Non-destructive: never drops databases/tables or overwrites existing rows.
-- If this database belongs to another exercise, ask the instructor for a NEW name.
USE master;
GO
IF DB_ID(N'TVET_DBM_Lab01') IS NULL
    EXEC(N'CREATE DATABASE TVET_DBM_Lab01;');
GO
USE TVET_DBM_Lab01;
GO
SET XACT_ABORT ON;
BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID(N'dbo.Students') IS NOT NULL AND OBJECT_ID(N'dbo.Students', N'U') IS NULL
        THROW 50001, 'dbo.Students exists but is not a user table. Use a new lab database.', 1;
    IF OBJECT_ID(N'dbo.Courses') IS NOT NULL AND OBJECT_ID(N'dbo.Courses', N'U') IS NULL
        THROW 50001, 'dbo.Courses exists but is not a user table. Use a new lab database.', 1;
    IF OBJECT_ID(N'dbo.Enrollments') IS NOT NULL AND OBJECT_ID(N'dbo.Enrollments', N'U') IS NULL
        THROW 50001, 'dbo.Enrollments exists but is not a user table. Use a new lab database.', 1;

    IF OBJECT_ID(N'dbo.Students', N'U') IS NULL
        CREATE TABLE dbo.Students (
            StudentId INT NOT NULL CONSTRAINT PK_Students PRIMARY KEY,
            FullName NVARCHAR(80) NOT NULL
        );
    IF OBJECT_ID(N'dbo.Courses', N'U') IS NULL
        CREATE TABLE dbo.Courses (
            CourseId INT NOT NULL CONSTRAINT PK_Courses PRIMARY KEY,
            CourseName NVARCHAR(100) NOT NULL,
            CreditHours INT NOT NULL
        );
    -- Validate columns BEFORE creating FKs or seeding any existing tables.
    DECLARE @Expected TABLE (TableName SYSNAME, ColumnName SYSNAME, TypeName SYSNAME, MaxLength SMALLINT);
    INSERT @Expected VALUES
        ('Students','StudentId','int',4), ('Students','FullName','nvarchar',160),
        ('Courses','CourseId','int',4), ('Courses','CourseName','nvarchar',200), ('Courses','CreditHours','int',4);
    IF EXISTS (
        SELECT 1 FROM @Expected e LEFT JOIN sys.columns c
        ON c.object_id = OBJECT_ID(N'dbo.' + e.TableName) AND c.name = e.ColumnName
        WHERE c.column_id IS NULL OR TYPE_NAME(c.user_type_id) <> e.TypeName
          OR c.max_length <> e.MaxLength OR c.is_nullable <> 0 OR c.is_identity <> 0 OR c.is_computed <> 0
    ) OR (SELECT COUNT(*) FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Students')) <> 2
      OR (SELECT COUNT(*) FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Courses')) <> 3
        THROW 50002, 'Existing Students/Courses schema is incompatible. Nothing was seeded; use a new lab database.', 1;

    IF OBJECT_ID(N'dbo.Enrollments', N'U') IS NULL
        CREATE TABLE dbo.Enrollments (
            EnrollmentId INT NOT NULL CONSTRAINT PK_Enrollments PRIMARY KEY,
            StudentId INT NOT NULL,
            CourseId INT NOT NULL,
            CONSTRAINT FK_Enrollments_Students FOREIGN KEY(StudentId) REFERENCES dbo.Students(StudentId),
            CONSTRAINT FK_Enrollments_Courses FOREIGN KEY(CourseId) REFERENCES dbo.Courses(CourseId),
            CONSTRAINT UQ_Enrollments UNIQUE(StudentId, CourseId)
        );
    INSERT @Expected VALUES ('Enrollments','EnrollmentId','int',4), ('Enrollments','StudentId','int',4), ('Enrollments','CourseId','int',4);
    IF EXISTS (
        SELECT 1 FROM @Expected e LEFT JOIN sys.columns c
        ON c.object_id = OBJECT_ID(N'dbo.' + e.TableName) AND c.name = e.ColumnName
        WHERE c.column_id IS NULL OR TYPE_NAME(c.user_type_id) <> e.TypeName
          OR c.max_length <> e.MaxLength OR c.is_nullable <> 0 OR c.is_identity <> 0 OR c.is_computed <> 0
    ) OR (SELECT COUNT(*) FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Enrollments')) <> 3
        THROW 50003, 'Existing Enrollments schema is incompatible. Use a new lab database.', 1;

    -- Each table must have the expected SINGLE-column primary key.
    IF EXISTS (
        SELECT 1 FROM (VALUES ('Students','StudentId'),('Courses','CourseId'),('Enrollments','EnrollmentId')) e(T,C)
        WHERE NOT EXISTS (
            SELECT 1 FROM sys.indexes i JOIN sys.index_columns ic ON ic.object_id=i.object_id AND ic.index_id=i.index_id
            JOIN sys.columns c ON c.object_id=ic.object_id AND c.column_id=ic.column_id
            WHERE i.object_id=OBJECT_ID(N'dbo.'+e.T) AND i.is_primary_key=1 AND c.name=e.C AND ic.key_ordinal=1
              AND (SELECT COUNT(*) FROM sys.index_columns k WHERE k.object_id=i.object_id AND k.index_id=i.index_id AND k.key_ordinal>0)=1
        )
    ) THROW 50004, 'Expected primary keys are missing or incompatible. Use a new lab database.', 1;

    IF EXISTS (
        SELECT 1 FROM (VALUES ('Students','StudentId'),('Courses','CourseId')) e(T,C)
        WHERE NOT EXISTS (
            SELECT 1 FROM sys.foreign_keys f JOIN sys.foreign_key_columns k ON f.object_id=k.constraint_object_id
            WHERE f.parent_object_id=OBJECT_ID(N'dbo.Enrollments') AND f.referenced_object_id=OBJECT_ID(N'dbo.'+e.T)
              AND COL_NAME(k.parent_object_id,k.parent_column_id)=e.C
              AND COL_NAME(k.referenced_object_id,k.referenced_column_id)=e.C
              AND f.is_disabled=0 AND f.is_not_trusted=0
              AND (SELECT COUNT(*) FROM sys.foreign_key_columns z WHERE z.constraint_object_id=f.object_id)=1
        )
    ) THROW 50005, 'Expected trusted foreign keys are missing. Use a new lab database.', 1;

    IF NOT EXISTS (
        SELECT 1 FROM sys.indexes i WHERE i.object_id=OBJECT_ID(N'dbo.Enrollments') AND i.is_unique=1 AND i.has_filter=0
        AND (SELECT COUNT(*) FROM sys.index_columns k WHERE k.object_id=i.object_id AND k.index_id=i.index_id AND k.key_ordinal>0)=2
        AND EXISTS (SELECT 1 FROM sys.index_columns k JOIN sys.columns c ON c.object_id=k.object_id AND c.column_id=k.column_id WHERE k.object_id=i.object_id AND k.index_id=i.index_id AND k.key_ordinal>0 AND c.name='StudentId')
        AND EXISTS (SELECT 1 FROM sys.index_columns k JOIN sys.columns c ON c.object_id=k.object_id AND c.column_id=k.column_id WHERE k.object_id=i.object_id AND k.index_id=i.index_id AND k.key_ordinal>0 AND c.name='CourseId')
    ) THROW 50006, 'Expected unique enrollment pair is missing. Use a new lab database.', 1;

    -- Dynamic batch compiles only after schema validation has succeeded.
    EXEC sp_executesql N'
        IF EXISTS (SELECT 1 FROM dbo.Students s JOIN (VALUES (1,N''Lina''),(2,N''Omar''),(3,N''Reem''),(4,N''Sara'')) v(Id,Name) ON s.StudentId=v.Id WHERE s.FullName<>v.Name)
            THROW 50007, ''Seed student IDs conflict with existing data. Use a new lab database.'', 1;
        IF EXISTS (SELECT 1 FROM dbo.Courses c JOIN (VALUES (101,N''Database Management'',3),(102,N''Web Development'',3),(103,N''Computer Networks'',2)) v(Id,Name,Hours) ON c.CourseId=v.Id WHERE c.CourseName<>v.Name OR c.CreditHours<>v.Hours)
            THROW 50008, ''Seed course IDs conflict with existing data. Use a new lab database.'', 1;
        IF EXISTS (SELECT 1 FROM dbo.Enrollments e JOIN (VALUES (1,1,101),(2,1,102),(3,2,103),(4,3,101)) v(Id,Student,Course) ON e.EnrollmentId=v.Id WHERE e.StudentId<>v.Student OR e.CourseId<>v.Course)
            THROW 50009, ''Seed enrollment IDs conflict with existing data. Use a new lab database.'', 1;
        INSERT dbo.Students(StudentId,FullName) SELECT v.Id,v.Name FROM (VALUES (1,N''Lina''),(2,N''Omar''),(3,N''Reem''),(4,N''Sara'')) v(Id,Name) WHERE NOT EXISTS (SELECT 1 FROM dbo.Students s WHERE s.StudentId=v.Id);
        INSERT dbo.Courses(CourseId,CourseName,CreditHours) SELECT v.Id,v.Name,v.Hours FROM (VALUES (101,N''Database Management'',3),(102,N''Web Development'',3),(103,N''Computer Networks'',2)) v(Id,Name,Hours) WHERE NOT EXISTS (SELECT 1 FROM dbo.Courses c WHERE c.CourseId=v.Id);
        INSERT dbo.Enrollments(EnrollmentId,StudentId,CourseId) SELECT v.Id,v.Student,v.Course FROM (VALUES (1,1,101),(2,1,102),(3,2,103),(4,3,101)) v(Id,Student,Course) WHERE NOT EXISTS (SELECT 1 FROM dbo.Enrollments e WHERE e.EnrollmentId=v.Id);
    ';
    COMMIT;
    SELECT StudentId, FullName FROM dbo.Students ORDER BY StudentId;
    PRINT 'Setup complete. Existing extra records were preserved; expected examples assume only the fixed starter dataset.';
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK;
    THROW;
END CATCH;
