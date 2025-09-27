// Elements
const dz = document.getElementById('dropzone');
const input = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const fileList = document.getElementById('fileList');

const preview = document.getElementById('preview');
const previewImg = document.getElementById('previewImg');
const pdfFallback = document.getElementById('pdfFallback');
const progressWrap = document.getElementById('progressWrap');
const progressBar = document.getElementById('progressBar');
const extractBtn = document.getElementById('extractBtn');

const extraction = document.getElementById('extraction');
const extractThumbImg = document.getElementById('extractThumbImg');
const extractThumbPdf = document.getElementById('extractThumbPdf');
const saveExcelBtn = document.getElementById('saveExcelBtn');

let lastPickedFile = null;

/* ----------------- Helpers ----------------- */
const qs = (s, r = document) => r.querySelector(s);

function showFilesList(files) {
    if (!files?.length) return;
    const items = [...files].map((f) => `<li title="${f.name}">${f.name}</li>`).join('');
    fileList.innerHTML = `<ul>${items}</ul>`;
}

function showPreviewFor(file) {
    preview.hidden = false;
    extractBtn.hidden = true;
    progressWrap.removeAttribute('aria-hidden');
    progressBar.style.width = '0%';

    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';

    if (isImage) {
        pdfFallback.hidden = true;
        previewImg.hidden = false;
        const reader = new FileReader();
        reader.onload = (e) => (previewImg.src = e.target.result);
        reader.readAsDataURL(file);
    } else if (isPdf) {
        previewImg.hidden = true;
        previewImg.src = '';
        pdfFallback.hidden = false;
        pdfFallback.textContent = 'PDF';
    } else {
        previewImg.hidden = true;
        previewImg.src = '';
        pdfFallback.hidden = false;
        pdfFallback.textContent = file.type || 'FILE';
    }
}

function populatePlaceholders() {
    qs('#soNumber').value = '12345';
    qs('#soDate').value = '06/16/2025';
    qs('#vendor').value = 'Samira Hadid';
    qs('#address').value = '123 Anywhere St., Any City, ST 12345';
    qs('#item1').value = 'Eggshell Camisole Top';
    qs('#item1Qty').value = '1';
    qs('#item1Price').value = '123';
    qs('#item2').value = 'Eggshell Camisole Top';
    qs('#item2Qty').value = '2';
    qs('#item2Price').value = '123';
}

/* Demo progress (replace with real upload) */
function simulateUpload(file) {
    return new Promise((resolve) => {
        let p = 0;
        const timer = setInterval(() => {
            p = Math.min(100, p + Math.random() * 18 + 6);
            progressBar.style.width = p.toFixed(0) + '%';
            if (p >= 100) {
                clearInterval(timer);
                resolve();
            }
        }, 140);
    });
}

/* Real upload with progress (example)
function uploadWithProgress(file){
  return new Promise((resolve, reject)=>{
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append('file', file);
    xhr.open('POST','/api/upload');
    xhr.upload.onprogress = e=>{
      if(e.lengthComputable){
        const pct = (e.loaded/e.total)*100;
        progressBar.style.width = pct.toFixed(0)+'%';
      }
    };
    xhr.onload  = ()=> (xhr.status>=200 && xhr.status<300) ? resolve(xhr.response) : reject(xhr.statusText);
    xhr.onerror = ()=> reject('Network error');
    xhr.send(form);
  });
}
*/

/* ----------------- Flow ----------------- */
async function handleFiles(files) {
    if (!files?.length) return;
    const file = files[0];
    lastPickedFile = file;

    showFilesList(files);
    showPreviewFor(file);

    // await uploadWithProgress(file); // real
    await simulateUpload(file); // demo

    extractBtn.hidden = false;
    progressWrap.setAttribute('aria-hidden', 'true');
}

function carryOverThumbnail() {
    if (!lastPickedFile) return;
    if (lastPickedFile.type.startsWith('image/')) {
        extractThumbPdf.hidden = true;
        extractThumbImg.hidden = false;
        const r = new FileReader();
        r.onload = (e) => (extractThumbImg.src = e.target.result);
        r.readAsDataURL(lastPickedFile);
    } else if (lastPickedFile.type === 'application/pdf') {
        extractThumbImg.hidden = true;
        extractThumbImg.src = '';
        extractThumbPdf.hidden = false;
        extractThumbPdf.textContent = 'PDF';
    } else {
        extractThumbImg.hidden = true;
        extractThumbImg.src = '';
        extractThumbPdf.hidden = false;
        extractThumbPdf.textContent = lastPickedFile.type || 'FILE';
    }
}

/* ----------------- Events ----------------- */
browseBtn.addEventListener('click', () => input.click());
dz.addEventListener('click', (e) => {
    if (!(e.target instanceof HTMLButtonElement)) input.click();
});

input.addEventListener('change', () => handleFiles(input.files));

['dragenter', 'dragover'].forEach((evt) => {
    dz.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dz.classList.add('is-dragover');
    });
});
['dragleave', 'drop'].forEach((evt) => {
    dz.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dz.classList.remove('is-dragover');
    });
});
dz.addEventListener('drop', (e) => {
    const files = e.dataTransfer?.files;
    if (files?.length) handleFiles(files);
});

extractBtn.addEventListener('click', async () => {
    extractBtn.disabled = true;
    extractBtn.textContent = 'Extracting…';
    try {
        // const res = await fetch('/api/extract',{method:'POST',body:JSON.stringify({fileId})});
        // const data = await res.json();
    } finally {
        extractBtn.disabled = false;
        extractBtn.textContent = 'Extract Information';
    }

    // Hide preview, show extraction panel
    preview.hidden = true;
    extractBtn.hidden = true;
    extraction.hidden = false;
    populatePlaceholders();
    carryOverThumbnail();
});

saveExcelBtn.addEventListener('click', () => {
    // const form = document.getElementById('extractForm');
    // const fd = new FormData(form);
    // const res = await fetch('/api/save-excel',{method:'POST',body:fd});
    // const {url} = await res.json(); window.location.href = url;
    alert('Pretend we saved to Excel ✅');
});
