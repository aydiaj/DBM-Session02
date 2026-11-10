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
    ['SqlConnection', 'Represents a connection to SQL Server. Used today: new SqlConnection(connectionString), followed by OpenAsync(). Creating the object alone does not open it.'],
    ['SqlCommand', 'Represents SQL text and its connection. Today, ExecuteScalarAsync returns one value; ExecuteReaderAsync returns a reader for rows and columns.'],
    ['SqlParameter', 'Supplies typed values separately from SQL text. Used today: @studentId with SqlDbType.Int and the validated student ID.'],
    ['SqlDataReader', 'Reads query results forward, one row at a time, while the connection is in use. Used today: ReadAsync advances to a row, then typed getters read its columns.'],
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



(function () {
  const root = document.getElementById('ado-pipeline');
  if (!root) return;
  const stages = [
    ['1 · SqlConnection', 'Represents the selected SQL Server instance and database. Creating the object does not open the connection.'],
    ['2 · OpenAsync', 'Attempts to open the connection. Server availability, authentication and permissions matter here.'],
    ['3 · SqlCommand', 'Associates fixed SQL text with the connection. A parameterized lookup also supplies typed values through the command’s Parameters collection.'],
    ['4 · ExecuteScalarAsync', 'Retrieves the first column of the first returned row. COUNT(*) returns 4 with only the supplied starter records. For a row set, use ExecuteReaderAsync and ReadAsync instead.'],
    ['5 · Dispose', 'The await using scope disposes the connection when the scope exits, including after exceptions. Dispose a reader before its connection; keep Console input outside open-connection scopes.']
  ];
  root.querySelectorAll('[data-stage]').forEach(button => button.addEventListener('click', () => {
    const i = Number(button.dataset.stage);
    root.querySelectorAll('[data-stage]').forEach(item => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    const target = root.querySelector('#pipelineExplanation');
    const strong = document.createElement('strong'); strong.textContent = stages[i][0];
    const p = document.createElement('p'); p.textContent = stages[i][1];
    target.replaceChildren(strong, p);
  }));
})();
