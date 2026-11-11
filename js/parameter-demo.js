/* Session 02: bounded, read-only examples using the four starter students. */
(() => {
  'use strict';
  const students=Object.freeze([
    Object.freeze({id:1,name:'Lina'}),Object.freeze({id:2,name:'Omar'}),
    Object.freeze({id:3,name:'Reem'}),Object.freeze({id:4,name:'Sara'})
  ]);
  const examples=Object.freeze({normal:'Lina',apostrophe:"O'Brien",injection:"' OR 1=1 --"});
  function compare(key){
    const value=examples[key];if(typeof value!=='string')return null;
    const rows=students.filter(s=>s.name===value).map(s=>({...s}));
    const unsafe=key==='apostrophe'
      ?{kind:'syntax-error',rows:[],message:'The apostrophe ends the SQL text value early. The concatenated statement has a syntax error.'}
      :key==='injection'
        ?{kind:'injection',rows:students.map(s=>({...s})),message:'OR 1=1 makes the condition true. The -- comments out the remaining quote. All four students are returned.'}
        :{kind:'success',rows:rows.map(s=>({...s})),message:'This ordinary input produces the intended lookup. Now compare the other examples.'};
    const safe={kind:'success',rows:rows.map(s=>({...s})),message:key==='injection'
      ?'The entire input stays one name value. OR and -- do not become instructions. No student has that full name in the starter records.'
      :key==='apostrophe'
        ?"The apostrophe stays part of the name. O'Brien is not in the four starter records, so this is a normal zero-row result."
        :'The value is sent separately with its SQL type. Only the matching student is returned.'};
    return {key,value,unsafe,safe,
      concatenatedSql:"SELECT StudentId, FullName\nFROM dbo.Students\nWHERE FullName = '"+value+"';",
      parameterizedSql:'SELECT StudentId, FullName\nFROM dbo.Students\nWHERE FullName = @fullName;',
      binding:{name:'@fullName',type:'NVarChar',size:80,value}};
  }
  if(typeof module==='object'&&module.exports)module.exports={compare};
  if(typeof document==='undefined')return;
  const root=document.getElementById('s2-parameter-explainer');
  if(!root||root.dataset.parameterReady==='true')return;
  root.dataset.parameterReady='true';
  const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];
  const escape=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const table=rows=>rows.length?`<div class="s2-table-wrap"><table class="s2-table"><thead><tr><th scope="col">StudentId</th><th scope="col">FullName</th></tr></thead><tbody>${rows.map(s=>`<tr><td>${s.id}</td><td>${escape(s.name)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="muted">No matching student rows.</p>';
  let selected='normal';
  function choose(key){
    const r=compare(key);if(!r)return;selected=key;
    $('#s2ParamValue').value=r.value;
    $('#s2ParamConcatSql').textContent=r.concatenatedSql;
    $('#s2ParamBoundSql').textContent=r.parameterizedSql;
    $('#s2ParamBinding').textContent=`Name: ${r.binding.name}\nSQL type: ${r.binding.type}(${r.binding.size})\nValue: ${JSON.stringify(r.binding.value)}`;
    $$('[data-s2-param-case]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.s2ParamCase===key)));
    $$('[data-s2-param-result]').forEach(n=>{n.hidden=true;});
    $('#s2ParamSummary').textContent='Predict: one match, no rows, a syntax error or every student? Then compare.';
  }
  $$('[data-s2-param-case]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.s2ParamCase)));
  $('#s2ParamCompare').addEventListener('click',()=>{
    const r=compare(selected);
    for(const [prefix,result] of [['Concat',r.unsafe],['Bound',r.safe]]){
      const outcome=result.kind==='syntax-error'?'Syntax error — the statement cannot run.':`${result.rows.length} student row${result.rows.length===1?'':'s'} returned.`;
      $('#s2Param'+prefix+'Outcome').textContent=outcome+' '+result.message;
      $('#s2Param'+prefix+'Rows').innerHTML=result.kind==='syntax-error'?'':table(result.rows);
    }
    $$('[data-s2-param-result]').forEach(n=>{n.hidden=false;});
    $('#s2ParamSummary').textContent=selected==='injection'
      ?'The concatenated instruction changed. The parameterized SQL stayed fixed; the entire input remained data.'
      :selected==='apostrophe'
        ?'An apostrophe can be part of an ordinary name. A missing name should return no rows, not break SQL syntax.'
        :'Both find Lina. Try the apostrophe and injection examples to see why parameters are needed.';
  });
  $('#s2ParamReset').addEventListener('click',()=>choose('normal'));
  choose('normal');
})();
