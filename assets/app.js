const fieldsDiv = document.getElementById('fields');
const addFieldBtn = document.getElementById('addField');
const form = document.getElementById('questionnaire');
const exportSection = document.getElementById('export');
const reportEl = document.getElementById('report');

function fieldRowTemplate(idx) {
  return `
    <div class="field-row" data-index="${idx}" style="border:1px dashed #ddd; padding: .75rem; border-radius:8px; margin:.5rem 0;">
      <label>Field Name <input name="fields[${idx}][name]" required /></label>
      <label>Type
        <select name="fields[${idx}][type]">
          <option>String</option><option>Integer</option><option>Float</option>
          <option>Date</option><option>Boolean</option><option>Geometry</option>
        </select>
      </label>
      <label>Nullable
        <select name="fields[${idx}][nullable]">
          <option value="Yes">Yes</option><option value="No">No</option>
        </select>
      </label>
      <label>Description <input name="fields[${idx}][description]" /></label>
      <label>Domain / Allowed Values <input name="fields[${idx}][domain]" placeholder="e.g., A|B|C or min..max" /></label>
      <button type="button" class="remove-field">Remove</button>
    </div>
  `;
}

let fieldIndex = 0;
function addField() {
  fieldsDiv.insertAdjacentHTML('beforeend', fieldRowTemplate(fieldIndex++));
}
addField(); // start with one row

addFieldBtn.addEventListener('click', addField);
fieldsDiv.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-field')) {
    e.target.closest('.field-row').remove();
  }
});

form.addEventListener('submit', (e) => {
  e.preventDefault();

  // Build data dictionary JSON from form inputs
  const fd = new FormData(form);
  const dict = {
    dataset_name: fd.get('dataset_name') || '',
    owner: fd.get('owner') || '',
    purpose: fd.get('purpose') || '',
    storage_location: fd.get('storage_location') || '',
    retention: fd.get('retention') || '',
    access_level: fd.get('access_level') || '',
    fields: []
  };

  // Collect fields
  const fieldEls = document.querySelectorAll('.field-row');
  fieldEls.forEach(row => {
    const i = row.dataset.index;
    dict.fields.push({
      name: fd.get(`fields[${i}][name]`) || '',
      type: fd.get(`fields[${i}][type]`) || '',
      nullable: fd.get(`fields[${i}][nullable]`) || '',
      description: fd.get(`fields[${i}][description]`) || '',
      domain: fd.get(`fields[${i}][domain]`) || ''
    });
  });

  // Populate report for printing
  document.getElementById('r_title').textContent = dict.dataset_name || 'Untitled Dataset';
  document.getElementById('r_owner').textContent = dict.owner || '—';
  document.getElementById('r_purpose').textContent = dict.purpose || '—';
  document.getElementById('r_storage').textContent = dict.storage_location || '—';
  document.getElementById('r_retention').textContent = dict.retention || '—';
  document.getElementById('r_access').textContent = dict.access_level || '—';
  document.getElementById('r_date').textContent = new Date().toLocaleString();

  const tbody = document.querySelector('#r_fields tbody');
  tbody.innerHTML = '';
  dict.fields.forEach(f => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(f.name)}</td>
      <td>${escapeHtml(f.type)}</td>
      <td>${escapeHtml(f.nullable)}</td>
      <td>${escapeHtml(f.description)}</td>
      <td>${escapeHtml(f.domain)}</td>
    `;
    tbody.appendChild(tr);
  });

  // Reveal export controls
  reportEl.hidden = false; // so print CSS can pick it up
  exportSection.hidden = false;

  // Stash object for downloads
  window.__DATA_DICT__ = dict;
});

document.getElementById('downloadJson').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(window.__DATA_DICT__ || {}, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (window.__DATA_DICT__?.dataset_name || 'data_dictionary') + '.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('printPdf').addEventListener('click', () => {
  // Uses the browser’s built-in print-to-PDF with print CSS above
  window.print();
});

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, m =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])
  );
}
