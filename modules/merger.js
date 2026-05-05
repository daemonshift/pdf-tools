// ============================================
// MERGER.JS — Fusion de plusieurs PDF
// ============================================

let mergerFiles = []

const dropzoneMerger = document.getElementById('dropzone-merger')
const inputMerger = document.getElementById('input-merger')
const listMerger = document.getElementById('list-merger')
const btnMerge = document.getElementById('btn-merge')

// --- Drag & Drop ---
dropzoneMerger.addEventListener('dragover', (e) => {
  e.preventDefault()
  dropzoneMerger.classList.add('dragover')
})

dropzoneMerger.addEventListener('dragleave', () => {
  dropzoneMerger.classList.remove('dragover')
})

dropzoneMerger.addEventListener('drop', (e) => {
  e.preventDefault()
  dropzoneMerger.classList.remove('dragover')
  const files = Array.from(e.dataTransfer.files).filter(f =>
    f.type === 'application/pdf'
  )
  addPdfs(files)
})

// --- Sélecteur de fichiers ---
inputMerger.addEventListener('change', () => {
  const files = Array.from(inputMerger.files)
  addPdfs(files)
  inputMerger.value = ''
})

// --- Ajouter des PDFs ---
function addPdfs(files) {
  files.forEach(file => {
    if (!mergerFiles.find(f => f.name === file.name)) {
      mergerFiles.push(file)
    }
  })
  renderMergerList()
}

// --- Afficher la liste ---
function renderMergerList() {
  listMerger.innerHTML = ''
  mergerFiles.forEach((file, index) => {
    const item = document.createElement('div')
    item.className = 'file-item'
    item.innerHTML = `
      <span class="file-item-name">📄 ${file.name}</span>
      <span class="file-item-size">${formatSize(file.size)}</span>
      <button class="file-item-remove" data-index="${index}">✕</button>
    `
    listMerger.appendChild(item)
  })

  listMerger.querySelectorAll('.file-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      mergerFiles.splice(parseInt(btn.dataset.index), 1)
      renderMergerList()
    })
  })
}

// --- Fusion ---
btnMerge.addEventListener('click', async () => {
  if (mergerFiles.length < 2) {
    showStatus('status-merger', '⚠️ Ajoutez au moins 2 fichiers PDF.', 'error')
    return
  }

  showStatus('status-merger', '⏳ Fusion en cours...', 'loading')
  btnMerge.disabled = true

  try {
    const mergedPdf = await PDFLib.PDFDocument.create()

    for (const file of mergerFiles) {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFLib.PDFDocument.load(arrayBuffer)
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
      pages.forEach(page => mergedPdf.addPage(page))
    }

    const pdfBytes = await mergedPdf.save()
    downloadPdf(pdfBytes, 'fusion.pdf')

    showStatus('status-merger', `✅ ${mergerFiles.length} PDFs fusionnés avec succès.`, 'success')
    mergerFiles = []
    renderMergerList()

  } catch (err) {
    showStatus('status-merger', `❌ Erreur : ${err.message}`, 'error')
  } finally {
    btnMerge.disabled = false
  }
})