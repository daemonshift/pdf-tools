// ============================================
// SPLITTER.JS — Division d'un PDF
// ============================================

let splitterFile = null

const dropzoneSplitter = document.getElementById('dropzone-splitter')
const inputSplitter = document.getElementById('input-splitter')
const splitOptions = document.getElementById('split-options')
const inputPages = document.getElementById('input-pages')
const btnSplit = document.getElementById('btn-split')

// --- Drag & Drop ---
dropzoneSplitter.addEventListener('dragover', (e) => {
  e.preventDefault()
  dropzoneSplitter.classList.add('dragover')
})

dropzoneSplitter.addEventListener('dragleave', () => {
  dropzoneSplitter.classList.remove('dragover')
})

dropzoneSplitter.addEventListener('drop', (e) => {
  e.preventDefault()
  dropzoneSplitter.classList.remove('dragover')
  const files = Array.from(e.dataTransfer.files).filter(f =>
    f.type === 'application/pdf'
  )
  if (files.length > 0) loadSplitterFile(files[0])
})

// --- Sélecteur de fichiers ---
inputSplitter.addEventListener('change', () => {
  if (inputSplitter.files[0]) {
    loadSplitterFile(inputSplitter.files[0])
    inputSplitter.value = ''
  }
})

// --- Charger le fichier ---
function loadSplitterFile(file) {
  splitterFile = file
  splitOptions.style.display = 'block'
  showStatus('status-splitter', `📄 Fichier chargé : ${file.name} (${formatSize(file.size)})`, 'loading')
}

// --- Parser les pages (ex: "1,3,5-8") ---
function parsePages(input, totalPages) {
  const pages = new Set()
  const parts = input.split(',')

  for (const part of parts) {
    const trimmed = part.trim()
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(Number)
      if (isNaN(start) || isNaN(end)) throw new Error(`Plage invalide : ${trimmed}`)
      for (let i = start; i <= end; i++) {
        if (i < 1 || i > totalPages) throw new Error(`Page ${i} hors limites (1-${totalPages})`)
        pages.add(i - 1)
      }
    } else {
      const num = Number(trimmed)
      if (isNaN(num)) throw new Error(`Numéro invalide : ${trimmed}`)
      if (num < 1 || num > totalPages) throw new Error(`Page ${num} hors limites (1-${totalPages})`)
      pages.add(num - 1)
    }
  }

  return Array.from(pages).sort((a, b) => a - b)
}

// --- Extraction ---
btnSplit.addEventListener('click', async () => {
  if (!splitterFile) {
    showStatus('status-splitter', '⚠️ Ajoutez un fichier PDF.', 'error')
    return
  }

  const pagesInput = inputPages.value.trim()
  if (!pagesInput) {
    showStatus('status-splitter', '⚠️ Indiquez les pages à extraire.', 'error')
    return
  }

  showStatus('status-splitter', '⏳ Extraction en cours...', 'loading')
  btnSplit.disabled = true

  try {
    const arrayBuffer = await splitterFile.arrayBuffer()
    const srcPdf = await PDFLib.PDFDocument.load(arrayBuffer)
    const totalPages = srcPdf.getPageCount()
    const pageIndices = parsePages(pagesInput, totalPages)
    const baseName = splitterFile.name.replace('.pdf', '')

    if (pageIndices.length === 1) {
      // Une seule page → un seul PDF
      const newPdf = await PDFLib.PDFDocument.create()
      const [copiedPage] = await newPdf.copyPages(srcPdf, pageIndices)
      newPdf.addPage(copiedPage)
      const pdfBytes = await newPdf.save()
      downloadPdf(pdfBytes, `${baseName}-page-${pageIndices[0] + 1}.pdf`)
      showStatus('status-splitter', `✅ Page ${pageIndices[0] + 1} extraite.`, 'success')

    } else {
      // Plusieurs pages → un ZIP avec un PDF par page
      const zip = new JSZip()

      for (const pageIndex of pageIndices) {
        const newPdf = await PDFLib.PDFDocument.create()
        const [copiedPage] = await newPdf.copyPages(srcPdf, [pageIndex])
        newPdf.addPage(copiedPage)
        const pdfBytes = await newPdf.save()
        zip.file(`${baseName}-page-${pageIndex + 1}.pdf`, pdfBytes)
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${baseName}-pages.zip`
      a.click()
      URL.revokeObjectURL(url)

      showStatus('status-splitter', `✅ ${pageIndices.length} pages extraites dans un ZIP.`, 'success')
    }

  } catch (err) {
    showStatus('status-splitter', `❌ Erreur : ${err.message}`, 'error')
  } finally {
    btnSplit.disabled = false
  }
})