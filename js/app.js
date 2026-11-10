/* DB3 Session 02. No external runtime dependencies. */
(() => {
    'use strict';
    const KEY = 'db3-session02-todo-v1', THEME = 'db3-codelab-theme';
    const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const escape = x => String(x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const empty = () => ({ completed: [], checks: {}, quizzes: { warmup: {}, exit: {} } });
    let state = empty(); try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && Array.isArray(s.completed)) { state = { ...empty(), ...s }; state.completed = state.completed.filter(x => Number.isInteger(x) && x >= 0 && x < 10); state.checks = state.checks || {}; state.quizzes = { warmup: {}, exit: {}, ...state.quizzes }; } } catch { }
    let storageWarned = false;
    function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { if (!storageWarned) { toast('Progress cannot be saved in this browser. You can still use every lesson step.'); storageWarned = true; } } }
    let toastTimer;
    function toast(t) { $('#toast').textContent = t; $('#toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').hidden = true, 2800); }
    let current = 0, lastLesson = 0;
    function parseHash() { const h = location.hash.slice(1); if (h === 'sources') return 'sources'; if (/^step-(?:[1-9]|10)$/.test(h)) return Number(h.split('-')[1]) - 1; return 0; }
    function showStep(n, { updateHash = true, focus = true } = {}) {
        if (n !== 'sources' && (!Number.isInteger(n) || n < 0 || n > 9)) n = 0;
        if (n !== 'sources') lastLesson = n; current = n;
        $$('[data-panel]').forEach(p => { const active = p.dataset.panel === String(n); p.hidden = !active; p.classList.toggle('active', active); });
        $$('[data-step]').forEach(b => { const on = b.dataset.step === String(n); b.classList.toggle('active', on); if (on) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
        $('#lessonFooter').hidden = n === 'sources';
        if (n !== 'sources') { $('#previousStep').disabled = n === 0; $('#nextStep').disabled = n === 9; $('#stepCounter').textContent = `STEP ${String(n + 1).padStart(2, '0')} OF 10`; $('#completeStep').textContent = n === 9 ? 'Complete session ✓' : state.completed.includes(n) ? 'Completed · continue →' : 'Complete & continue →'; }
        if (updateHash) history.pushState(null, '', n === 'sources' ? '#sources' : `#step-${n + 1}`);
        closeMenu();
        if (focus) { window.scrollTo({ top: 0, behavior: 'instant' }); $('[data-panel="' + n + '"] [tabindex="-1"]')?.focus({ preventScroll: true }); }
        updateProgress();
    }
    function updateProgress() { const count = state.completed.length; $('#progressText').textContent = `${count} / 10`; $('#progressFill').style.width = count * 10 + '%'; $('#progressBar').setAttribute('aria-valuenow', count); $$('[data-step]').forEach(b => b.classList.toggle('done', state.completed.includes(Number(b.dataset.step)))); $('#completionCard').hidden = count !== 10; }
    $$('[data-step]').forEach(b => b.addEventListener('click', () => showStep(Number(b.dataset.step))));
    $('#previousStep').addEventListener('click', () => showStep(current - 1)); $('#nextStep').addEventListener('click', () => showStep(current + 1));
    $('#completeStep').addEventListener('click', () => { if (current === 'sources') return; if (!state.completed.includes(current)) state.completed.push(current); save(); updateProgress(); if (current < 9) showStep(current + 1); else if (state.completed.length === 10) { $('#completionCard').hidden = false; $('#completionCard').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' }); toast('Session 02 completed. Keep your Program.cs for next time.'); } else { toast('Review the remaining steps and mark them complete when ready.'); $('#completeStep').textContent = 'Review remaining steps'; } });
    $('#sourcesLink').addEventListener('click', e => { e.preventDefault(); showStep('sources'); }); $('#returnLesson').addEventListener('click', () => showStep(lastLesson)); $('#reviewSession').addEventListener('click', () => showStep(0));
    addEventListener('popstate', () => showStep(parseHash(), { updateHash: false })); addEventListener('hashchange', () => { const n = parseHash(); if (current !== n) showStep(n, { updateHash: false }); });
    function closeMenu() { $('#sidebar').classList.remove('open'); $('#scrim').hidden = true; $('#menuBtn').setAttribute('aria-expanded', 'false'); }
    $('#menuBtn').addEventListener('click', () => { const open = $('#sidebar').classList.toggle('open'); $('#scrim').hidden = !open; $('#menuBtn').setAttribute('aria-expanded', String(open)); if (open) $('[data-step].active')?.focus(); }); $('#closeMenu').addEventListener('click', () => { closeMenu(); $('#menuBtn').focus(); }); $('#scrim').addEventListener('click', closeMenu);
    addEventListener('keydown', e => { if (e.key === 'Escape' && $('#sidebar').classList.contains('open')) { closeMenu(); $('#menuBtn').focus(); } if (e.key === 'Tab' && $('#sidebar').classList.contains('open')) { const a = $$('button,a', $('#sidebar')).filter(x => !x.hidden && getComputedStyle(x).display !== 'none'); const first = a[0], last = a.at(-1); if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } } });
    function setTheme(t) { document.documentElement.dataset.theme = t; $('#themeBtn').setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'); try { localStorage.setItem(THEME, t); } catch { } }
    let theme = 'light'; try { theme = localStorage.getItem(THEME) || 'light'; } catch { } setTheme(theme); $('#themeBtn').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
    $$('[data-check]').forEach(c => { c.checked = Boolean(state.checks[c.dataset.check]); c.addEventListener('change', () => { state.checks[c.dataset.check] = c.checked; save(); }); });
    $('#resetProgress').addEventListener('click', () => { if (!confirm('Reset Session 02 progress, answers and checklists on this browser? Your C# files are unaffected.')) return; state = empty(); save(); $$('[data-check]').forEach(c => c.checked = false); renderQuiz('warmup'); renderQuiz('exit'); showStep(0); toast('Session 02 progress reset.'); });
    const quizzes = { "warmup": [{ "q": "An instructor types SELECT in SSMS. Which component executes it?", "options": ["The C# compiler", "SQL Server", "SSMS\u2019s text editor", "Entity Framework Core"], "answer": 1, "hint": "Distinguish the client window from the database engine.", "why": "SQL Server executes SQL. SSMS sends the statement and displays the response." }, { "q": "Why does a C# application use ADO.NET or another data-access approach?", "options": ["SQL Server cannot store rows.", "C# is a different name for T-SQL.", "The program needs APIs to communicate with the database.", "The user must launch SSMS every time."], "answer": 2, "hint": "Think about the missing bridge discussed in Session 01.", "why": "The application calls data-access APIs to communicate with SQL Server. It does not operate the SSMS interface." }, { "q": "What does EF Core provide?", "options": ["Object-relational mapping and querying through C# objects.", "A replacement SQL Server database engine.", "A replacement for all SQL knowledge.", "A graphical SQL editor equivalent to SSMS."], "answer": 0, "hint": "Recall the relationship between tables, rows, classes and objects.", "why": "EF Core is an ORM. The database engine still executes SQL, and understanding SQL remains useful." }, { "q": "Students contains four rows. What does SELECT COUNT(*) FROM dbo.Students return?", "options": ["Four student names", "The highest StudentId, by definition", "The number of columns", "One value: 4"], "answer": 3, "hint": "Separate the number of source rows from the shape of the result.", "why": "COUNT(*) counts rows. Its result here is a single aggregate value: 4." }, { "q": "Which query retrieves only StudentId and FullName for StudentId 2?", "options": ["SELECT StudentId, FullName FROM dbo.Students WHERE StudentId = 2;", "SELECT StudentId, FullName FROM dbo.Students ORDER BY StudentId;", "UPDATE dbo.Students SET StudentId = 2;", "SELECT StudentId, FullName FROM dbo.Students;"], "answer": 0, "hint": "Which clause filters matching rows?", "why": "WHERE restricts the result to StudentId 2. ORDER BY sorts rows; it does not filter them." }, { "q": "How are students associated with courses in real scenarios?", "options": ["By matching FullName to CourseName.", "By counting the columns in both tables.", "Through the StudentId and CourseId foreign keys in Enrollments.", "By storing all course names inside Students.FullName."], "answer": 2, "hint": "Find the junction table between the two entities.", "why": "Enrollments links each student key to a course key. One student can have several enrollment rows." }], "exit": [{ "q": "Which method fits SELECT COUNT(*) FROM dbo.Students?", "options": ["ExecuteScalarAsync", "ExecuteReaderAsync only", "ExecuteNonQueryAsync"], "answer": 0, "hint": "What is the shape of the required result?", "why": "A scalar is one value. ExecuteScalarAsync takes the first column of the first returned row." }, { "q": "What must happen before reading a SqlDataReader\u2019s first row?", "options": ["Dispose the connection.", "Call ReadAsync and check that it returned true.", "Concatenate input into the SQL."], "answer": 1, "hint": "The reader begins before the first row.", "why": "ReadAsync advances the reader. Only access column values after it returns true." }, { "q": "Why use a typed @studentId parameter?", "options": ["It replaces a table name.", "It opens the connection automatically.", "It sends an integer value separately from the SQL text."], "answer": 2, "hint": "Separate a SQL instruction from its input value.", "why": "A typed parameter supplies data without joining it into SQL text. Table and column names are not value parameters." }, { "q": "Sara exists but has no enrollment rows. What should the INNER JOIN report say?", "options": ["Student does not exist.", "No enrollments found for this ID.", "The server connection failed."], "answer": 1, "hint": "Each row in this report represents an enrollment.", "why": "No enrollment rows does not prove the student is absent. The single-table lookup distinguishes these cases." }, { "q": "When does await using dispose the connection?", "options": ["As soon as the first row is read.", "Only when the app exits normally.", "When its scope exits, including when an exception leaves it."], "answer": 2, "hint": "Think about the braces, not the number of result rows.", "why": "Disposal follows scope lifetime. Readers declared later in the same scope are disposed first." }] };
    function renderQuiz(kind) {
        const qs = quizzes[kind], root = $('#' + (kind === 'warmup' ? 'warmupQuiz' : 'exitQuiz')); root.innerHTML = qs.map((q, i) => { const saved = state.quizzes[kind][i] || {}; return `<article class="quiz-card"><fieldset><legend><span class="q-number">QUESTION ${String(i + 1).padStart(2, '0')} / ${qs.length}</span>${escape(q.q)}</legend>${q.options.map((a, j) => `<label class="answer"><input type="radio" name="${kind}-${i}" value="${j}" ${saved.choice === j ? 'checked' : ''}><span>${escape(a)}</span></label>`).join('')}</fieldset><details><summary>Need a hint?</summary><p class="muted">${escape(q.hint)}</p></details><div class="actions"><button class="s2-btn small" data-check-answer="${i}">Check answer</button></div><div class="feedback" id="${kind}-feedback-${i}" role="status" hidden></div></article>`; }).join('');
        $$('input', root).forEach(input => input.addEventListener('change', () => { const i = Number(input.name.split('-').at(-1)); state.quizzes[kind][i] = { choice: Number(input.value), checked: false }; $('#' + kind + '-feedback-' + i).hidden = true; save(); score(kind); }));
        $$('[data-check-answer]', root).forEach(b => b.addEventListener('click', () => { const i = Number(b.dataset.checkAnswer), s = state.quizzes[kind][i]; if (!s || !Number.isInteger(s.choice)) { const f = $('#' + kind + '-feedback-' + i); f.hidden = false; f.className = 'feedback'; f.textContent = 'Choose an answer first.'; return; } s.checked = true; save(); feedback(kind, i); score(kind); }));
        qs.forEach((_, i) => { if (state.quizzes[kind][i]?.checked) feedback(kind, i); }); score(kind);
    }
    function feedback(kind, i) { const q = quizzes[kind][i], s = state.quizzes[kind][i], good = s.choice === q.answer, f = $('#' + kind + '-feedback-' + i); f.hidden = false; f.className = 'feedback ' + (good ? 'correct' : 'incorrect'); f.innerHTML = `<strong>${good ? 'Correct.' : 'Review this one.'}</strong> ${escape(q.why)}${good ? '' : `<br><strong>Correct choice:</strong> ${escape(q.options[q.answer])}`}`; }
    function score(kind) { const qs = quizzes[kind], checked = qs.filter((q, i) => state.quizzes[kind][i]?.checked).length, right = qs.filter((q, i) => state.quizzes[kind][i]?.checked && state.quizzes[kind][i].choice === q.answer).length; $('#' + kind + 'Score').textContent = checked ? `${checked} of ${qs.length} checked · ${right} correct` : `0 of ${qs.length} checked`; }
    $$('[data-reset-quiz]').forEach(b => b.addEventListener('click', () => { state.quizzes[b.dataset.resetQuiz] = {}; save(); renderQuiz(b.dataset.resetQuiz); }));
    renderQuiz('warmup'); renderQuiz('exit');
    const providerTasks = ['Retrieve a student from SQL Server', 'Request weather data from a web API', 'Read a local text file']; const providerNames = ['Microsoft.Data.SqlClient', 'System.Net.Http.HttpClient', 'System.IO.File'];
    $('#providerMatch').innerHTML = providerTasks.map((t, i) => `<div class="match-item"><label for="provider-${i}"><strong>${escape(t)}</strong></label><select id="provider-${i}"><option value="">Choose the tool…</option>${providerNames.map((a, j) => `<option value="${j}">${escape(a)}</option>`).join('')}</select></div>`).join('');
    $('#checkProvider').addEventListener('click', () => { const choices = providerTasks.map((_, i) => $('#provider-' + i).value), f = $('#providerFeedback'); f.hidden = false; if (choices.includes('')) { f.className = 'feedback'; f.textContent = 'Choose a tool for all three tasks first.'; return; } const n = choices.filter((v, i) => Number(v) === i).length; f.className = 'feedback ' + (n === 3 ? 'correct' : 'incorrect'); f.innerHTML = `<strong>${n} / 3 correct.</strong><br>SQL Server → SqlClient; web API → HttpClient; local file → System.IO.File. Explain which external resource each task uses.`; });
    const components = [['Connection', 'SqlConnection describes and opens the route to SQL Server. Creating the object is different from calling OpenAsync.'], ['Command', 'SqlCommand combines SQL text and its connection. Choose the execute method by the required result shape.'], ['Parameter', 'SqlParameter supplies a typed value separately from the SQL text. In this lab the command owns an @studentId parameter.'], ['Reader', 'SqlDataReader advances through a result set. ReadAsync moves to the next row; typed getters read the current row’s values.']];
    $('#componentTabs').innerHTML = components.map((x, i) => `<button class="s2-btn" data-component="${i}" aria-pressed="${i === 0}">${escape(x[0])}</button>`).join(''); function component(i) { $$('[data-component]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.component) === i))); $('#componentText').textContent = components[i][1]; } $$('[data-component]').forEach(b => b.addEventListener('click', () => component(Number(b.dataset.component)))); component(0);
    const students = [[1, 'Lina'], [2, 'Omar'], [3, 'Reem'], [4, 'Sara']], courses = [[101, 'Database Management', 3], [102, 'Web Development', 3], [103, 'Computer Networks', 2]], enrollments = [[1, 1, 101], [2, 1, 102], [3, 2, 103], [4, 3, 101]];
    function table(headers, rows, { highlight = () => false, caption = '' } = {}) { return `<div class="s2-table-wrap"><table class="s2-table">${caption ? `<caption class="sr-only">${escape(caption)}</caption>` : ''}<thead><tr>${headers.map(t => `<th scope="col">${escape(t)}</th>`).join('')}</tr></thead><tbody>${rows.map((r, i) => `<tr class="data-row ${highlight(r, i) ? 'highlight' : ''}">${r.map(c => `<td>${escape(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`; }
    $('#traceChoices').innerHTML = [1, 2, 3, 4, 99].map(id => `<button class="s2-btn small" data-trace="${id}" aria-pressed="false">ID ${id}</button>`).join('');
    function trace(id) { const es = enrollments.filter(e => e[1] === id), cs = es.map(e => e[2]), student = students.find(s => s[0] === id); $$('[data-trace]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.trace) === id))); $('#datasetTables').innerHTML = '<h3>Students</h3>' + table(['StudentId · PK', 'FullName'], students, { highlight: r => r[0] === id }) + '<h3>Enrollments</h3>' + table(['EnrollmentId · PK', 'StudentId · FK', 'CourseId · FK'], enrollments, { highlight: r => r[1] === id }) + '<h3>Courses</h3>' + table(['CourseId · PK', 'CourseName', 'CreditHours'], courses, { highlight: r => cs.includes(r[0]) }); $('#traceFeedback').textContent = !student ? 'ID 99: no matching student, so there are no matching enrollment rows.' : !es.length ? `${student[1]} exists in Students but has no enrollment rows.` : `${student[1]} → ${es.length} enrollment row${es.length > 1 ? 's' : ''} → ${cs.map(x => courses.find(c => c[0] === x)[1]).join(', ')}.`; }
    $$('[data-trace]').forEach(b => b.addEventListener('click', () => trace(Number(b.dataset.trace)))); trace(1);
    let life = 0; $$('[data-lifecycle]').forEach(b => b.addEventListener('click', () => { const a = b.dataset.lifecycle, o = $('#lifecycleOutput'); if (a === 'reset') { life = 0; o.textContent = 'No connection object has been created.'; } else if (a === 'create') { life = 1; o.textContent = 'new SqlConnection(...)\nObject created. State: Closed.\nNo connection has been opened.'; } else if (a === 'open') { if (life !== 1) { o.textContent = 'Create the connection object first. After disposal, start with a new object.'; return; } life = 2; o.textContent = 'await connection.OpenAsync()\nConceptual successful path → State: Open.\nThe real operation can fail; run it in Visual Studio to verify.'; } else if (a === 'dispose') { if (life < 1 || life === 3) { o.textContent = 'Create a connection object first.'; return; } life = 3; o.textContent = 'Scope exited → DisposeAsync() runs.\nWith pooling enabled, the physical connection can be reused.\nDo not use this disposed object for the next task.'; } }));
    $$('[data-scalar]').forEach(b => b.addEventListener('click', () => { const f = $('#scalarFeedback'), good = b.dataset.scalar === 'value'; f.hidden = false; f.className = 'feedback ' + (good ? 'correct' : 'incorrect'); f.textContent = good ? 'Correct. COUNT(*) returns one aggregate value: 4 for this fixed dataset.' : 'COUNT(*) returns one aggregate value, 4. To retrieve student records, select their columns and use a reader.'; }));
    let cursor = -1; function renderReader() { const active = cursor >= 0 && cursor < students.length; $('#readerTable').innerHTML = table(['StudentId · column 0', 'FullName · column 1'], students, { highlight: (_, i) => i === cursor }); $('#readerStatus').textContent = cursor < 0 ? 'Before first row · no current values' : active ? `Current row ${cursor + 1} of 4` : 'After last row · ReadAsync returned false'; $('#readerOutput').textContent = cursor < 0 ? 'Call ReadAsync() to advance to the first row.' : active ? `ReadAsync() → true\nGetInt32(0) → ${students[cursor][0]}\nGetString(1) → ${students[cursor][1]}` : 'ReadAsync() → false\nThe loop ends. Do not read column values here.'; $('#readerNext').disabled = cursor >= students.length; }
    $('#readerNext').addEventListener('click', () => { cursor++; renderReader(); }); $('#readerReset').addEventListener('click', () => { cursor = -1; renderReader(); }); renderReader();
    function parseStudentId(s) { const clean = s.trim(); if (!/^[+-]?\d+$/.test(clean)) return null; const value = Number(clean); return Number.isInteger(value) && value > 0 && value <= 2147483647 ? value : null; }
    function lookup() { const raw = $('#lookupInput').value, id = parseStudentId(raw), o = $('#lookupOutput'); if (id === null) { o.textContent = 'int.TryParse / positive ID validation failed.\nLookup command is not sent to SQL Server.'; return; } const s = students.find(s => s[0] === id); o.textContent = `Fixed SQL: WHERE StudentId = @studentId\nParameter: @studentId · SqlDbType.Int · Value = ${id}\n${s ? `Student: ${s[0]} — ${s[1]}` : 'Student not found.'}`; }
    $('#lookupRun').addEventListener('click', lookup); $('#lookupInput').addEventListener('keydown', e => { if (e.key === 'Enter') lookup(); }); $$('[data-lookup-value]').forEach(b => b.addEventListener('click', () => { $('#lookupInput').value = b.dataset.lookupValue; lookup(); }));
    function join() { const id = Number($('#joinInput').value), s = students.find(s => s[0] === id), es = enrollments.filter(e => e[1] === id), rows = es.map(e => { const c = courses.find(c => c[0] === e[2]); return [id, s[1], c[1], c[2]]; }); $('#joinResult').innerHTML = `<div class="feedback"><strong>Single-table lookup:</strong> ${s ? escape(s[1]) + ' exists.' : 'Student not found.'}</div>` + (rows.length ? table(['StudentId', 'FullName', 'CourseName', 'CreditHours'], rows) : '<div class="terminal">No enrollments found for this ID.</div>') + `<p class="muted">INNER JOIN returned ${rows.length} enrollment row${rows.length === 1 ? '' : 's'}. ${id === 4 ? 'Sara is present in Students; absence of enrollments is not absence of the student.' : id === 99 ? 'This ID is absent from Students. The report message alone does not tell you that.' : 'The repeated name belongs to two different enrollments.'}</p>`; }
    $('#joinInput').addEventListener('change', join); join();
    async function copyText(text) { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return; } const el = document.createElement('textarea'); el.value = text; el.style.position = 'fixed'; el.style.opacity = '0'; document.body.appendChild(el); el.select(); const success = document.execCommand('copy'); el.remove(); if (!success) throw Error('Copy unavailable'); }
    $$('.copy-btn').forEach(b => b.addEventListener('click', async () => { try { await copyText($('pre code', b.closest('.code-shell')).textContent); const old = b.textContent; b.textContent = 'Copied ✓'; setTimeout(() => b.textContent = old, 1500); } catch { toast('Copy is unavailable. Select the code or use its checkpoint download.'); } }));
    $('#downloadProgress').addEventListener('click', () => { const lines = ['DB3 Session 02 — learning record', `Date: ${new Date().toLocaleDateString()}`, `Completed steps: ${state.completed.length}/10`, '', ...quizzes.exit.map((q, i) => `${i + 1}. ${q.q}\nChecked: ${state.quizzes.exit[i]?.checked ? 'yes' : 'no'}; correct: ${state.quizzes.exit[i]?.checked && state.quizzes.exit[i]?.choice === q.answer ? 'yes' : 'no'}`), '', 'Remember to submit Program.cs separately. This browser record does not contain or execute your C# work.']; const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain' })); const a = document.createElement('a'); a.href = url; a.download = 'DB3_Session02_Learning_Record.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); });
    showStep(parseHash(), { updateHash: false, focus: false });
})();
(function () {
    const root = document.getElementById("countWalkthrough");
    if (!root || root.dataset.initialized === "true") return;

    root.dataset.initialized = "true";

    const detail = root.querySelector("#countWalkthroughDetail");
    const buttons = root.querySelectorAll("[data-count-stage]");

    const stages = {
        prepare: `
            <strong>1 · Prepare the connection settings</strong>

            <p>
                Identify the SQL Server instance, database name,
                and authentication method. Store these settings
                in a <strong>connection string</strong>.
            </p>

            <p>
                This is configuration information.
                No connection object has been created,
                no database connection has been opened,
                and no SQL has been executed.
            </p>
        `,

        connection: `
            <strong>2 · Create the connection object</strong>

            <pre class="code-block"><code>var connection = new SqlConnection(connectionString);</code></pre>

            <p>
                <code>new</code> creates a C# object that holds
                the connection settings. Its initial
                <code>State</code> is <code>Closed</code>.
            </p>

            <p>
                Creating this object does not establish a connection
                to SQL Server. It does not yet prove that the server
                is available or that the login details are accepted.
            </p>
        `,

        open: `
            <strong>3 · Open the connection</strong>

            <pre class="code-block"><code>await connection.OpenAsync();</code></pre>

            <p>
                Now the provider attempts to open a connection
                using the prepared settings.
                Server availability, authentication, and database
                access permissions matter at this stage.
            </p>

            <p>
                If opening succeeds, the connection’s
                <code>State</code> becomes <code>Open</code>.
                Opening the connection does not execute
                our COUNT query.
            </p>
        `,

        command: `
            <strong>4 · Prepare the SQL command</strong>

            <pre class="code-block"><code>const string sql = "SELECT COUNT(*) FROM dbo.Students;";
using var command = new SqlCommand(sql, connection);</code></pre>

            <p>
                The command associates the SQL instruction
                with the connection through which it will run.
            </p>

            <p>
                Creating a <code>SqlCommand</code> does not execute
                the SQL. We still need to call an execution method.
            </p>
        `,

        scalar: `
            <strong>5 · Execute the command and read one value</strong>

            <pre class="code-block"><code>object? result = await command.ExecuteScalarAsync();
int total = Convert.ToInt32(result);
Console.WriteLine(total);</code></pre>

            <p>
                <code>ExecuteScalarAsync()</code> sends the command
                for execution and retrieves the first column
                of the first returned row.
            </p>

            <p>
                Our COUNT query produces one value.
                With three rows in the starter table,
                the application prints <strong>3</strong>.
                It does not retrieve the students’ names.
            </p>
        `,

        dispose: `
            <strong>6 · Release the resources</strong>

            <p>
                After processing the result, release the command
                and connection resources.
            </p>

            <p>
                In our complete lab code, <code>using</code>
                manages command disposal, and <code>await using</code>
                manages asynchronous connection disposal.
                Cleanup happens when the corresponding scope exits,
                including when an exception leaves that scope.
            </p>

            <p>
                Dispose the command before its connection.
                With connection pooling enabled, the underlying
                connection can normally be returned to the pool
                for reuse.
            </p>
        `
    };

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            buttons.forEach(item => {
                const active = item === button;
                item.classList.toggle("active", active);
                item.setAttribute("aria-pressed", String(active));
            });

            detail.innerHTML = stages[button.dataset.countStage];
        });
    });
})();
(function () {
  const root = document.getElementById('ado-component-map');
  if (!root || root.dataset.initialized === 'true') return;
  root.dataset.initialized = 'true';
  root.classList.add('ado-js');
  const nodes = Array.from(root.querySelectorAll('[data-ado-step]'));
  const detail = root.querySelector('[data-ado-detail]');
  const count = root.querySelector('[data-ado-count]');
  const progress = root.querySelector('[data-ado-progress]');
  const next = root.querySelector('[data-ado-next]');
  const descriptions = [
    ['SqlConnection', 'Creates and opens a connection to SQL Server. Used today: new SqlConnection(cs), followed by OpenAsync().'],
    ['SqlCommand', 'Represents a SQL statement or stored procedure. Used today: ExecuteScalarAsync() returns one value, the student count.'],
    ['SqlParameter', 'Supplies typed values to parameterized SQL commands. You will use it when filtering for one student in Session 02.'],
    ['SqlDataReader', 'Reads query results forward, one row at a time, while the connection is in use. Introduced in Session 02.'],
    ['SqlTransaction', 'Groups commands in a transaction so changes can be committed together or rolled back. Architecture reference.'],
    ['SqlDataAdapter', 'A bridge that uses SqlCommand and SqlConnection to fill or update in-memory DataTable/DataSet objects. Architecture reference.'],
    ['DataTable', 'A System.Data class that holds rows and columns in memory, so they can be accessed after a connection is closed.'],
    ['DataSet', 'A System.Data class that can contain multiple DataTable objects and relations in memory.']
  ];
  let shown = 0;
  let selected = 0;
  function paint() {
    nodes.forEach(node => {
      const step = Number(node.dataset.adoStep);
      const visible = step <= shown;
      node.classList.toggle('is-visible', visible);
      node.classList.toggle('is-current', visible && step === selected);
      node.disabled = !visible;
      node.setAttribute('aria-label', visible ? descriptions[step - 1][0] + ': show explanation' : 'Class ' + step + ' not yet revealed');
    });
    count.textContent = shown + ' / ' + nodes.length;
    progress.style.width = (100 * shown / nodes.length) + '%';
    next.disabled = shown === nodes.length;
    if (selected > 0) {
      const d = descriptions[selected - 1];
      detail.replaceChildren();
      const strong = document.createElement('strong');
      strong.textContent = selected + ' · ' + d[0] + ' — ';
      detail.append(strong, document.createTextNode(d[1]));
    } else {
      detail.replaceChildren();
      const strong = document.createElement('strong');
      strong.textContent = 'Ready to explore. ';
      detail.append(strong, document.createTextNode('Select “Reveal next class” to uncover the ADO.NET components.'));
    }
  }
  next.addEventListener('click', () => { if (shown < nodes.length) { shown += 1; selected = shown; paint(); } });
  root.querySelector('[data-ado-all]').addEventListener('click', () => { shown = nodes.length; selected = 1; paint(); });
  root.querySelector('[data-ado-reset]').addEventListener('click', () => { shown = 0; selected = 0; paint(); });
  nodes.forEach(node => node.addEventListener('click', () => { const s = Number(node.dataset.adoStep); if (s <= shown) { selected = s; paint(); } }));
  paint();
})();

