// ============================================
// IMAGETOPDF.JS — Conversion images vers PDF
// ============================================

let imagesFiles = []

const dropzoneImages = document.getElementById('dropzone-images')
const inputImages = document.getElementById('input-images')
const listImages = document.getElementById('list-images')
const btnConvert = document.getElementById('btn-convert')

// --- Drag & Drop ---
dropzoneImages.addEventListener('dragover', (e) => {
  e.preventDefault()
  dropzoneImages.classList.add('dragover')
})

dropzoneImages.addEventListener('dragleave', () => {
  dropzoneImages.classList.remove('dragover')
})

dropzoneImages.addEventListener('drop', (e) => {
  e.preventDefault()
  dropzoneImages.classList.remove('dragover')
  const files = Array.from(e.dataTransfer.files).filter(f =>
    f.type === 'image/png' || f.type === 'image/jpeg'
  )
  addImages(files)
})

// --- Sélecteur de fichiers ---
inputImages.addEventListener('change', () => {
  const files = Array.from(inputImages.files)
  addImages(files)
  inputImages.value = ''
})

// --- Ajouter des images à la liste ---
function addImages(files) {
  files.forEach(file => {
    if (!imagesFiles.find(f => f.name === file.name)) {
      imagesFiles.push(file)
    }
  })
  renderImageList()
}

// --- Afficher la liste ---
function renderImageList() {
  listImages.innerHTML = ''
  imagesFiles.forEach((file, index) => {
    const item = document.createElement('div')
    item.className = 'file-item'
    item.innerHTML = `
      <span class="file-item-name">🖼️ ${file.name}</span>
      <span class="file-item-size">${formatSize(file.size)}</span>
      <button class="file-item-remove" data-index="${index}">✕</button>
    `
    listImages.appendChild(item)
  })

  // Boutons de suppression
  listImages.querySelectorAll('.file-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      imagesFiles.splice(parseInt(btn.dataset.index), 1)
      renderImageList()
    })
  })
}

// --- Conversion ---
btnConvert.addEventListener('click', async () => {
  if (imagesFiles.length === 0) {
    showStatus('status-images', '⚠️ Ajoutez au moins une image.', 'error')
    return
  }

  showStatus('status-images', '⏳ Conversion en cours...', 'loading')
  btnConvert.disabled = true

  try {
    if (imagesFiles.length === 1) {
      // Un seul fichier → un seul PDF
      const pdfDoc = await PDFLib.PDFDocument.create()
      const file = imagesFiles[0]
      const arrayBuffer = await file.arrayBuffer()
      const image = file.type === 'image/png'
        ? await pdfDoc.embedPng(arrayBuffer)
        : await pdfDoc.embedJpg(arrayBuffer)

      const page = pdfDoc.addPage([image.width, image.height])
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height })

      const pdfBytes = await pdfDoc.save()
      downloadPdf(pdfBytes, 'image-convertie.pdf')
      showStatus('status-images', '✅ PDF généré avec succès.', 'success')

    } else {
      // Plusieurs fichiers → ZIP contenant un PDF par image
      const zip = new JSZip()

      for (const file of imagesFiles) {
        const pdfDoc = await PDFLib.PDFDocument.create()
        const arrayBuffer = await file.arrayBuffer()
        const image = file.type === 'image/png'
          ? await pdfDoc.embedPng(arrayBuffer)
          : await pdfDoc.embedJpg(arrayBuffer)

        const page = pdfDoc.addPage([image.width, image.height])
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height })

        const pdfBytes = await pdfDoc.save()
        const pdfName = file.name.replace(/\.(png|jpg|jpeg)$/i, '.pdf')
        zip.file(pdfName, pdfBytes)
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'images-converties.zip'
      a.click()
      URL.revokeObjectURL(url)

      showStatus('status-images', `✅ ZIP généré avec ${imagesFiles.length} PDFs.`, 'success')
    }

    imagesFiles = []
    renderImageList()

  } catch (err) {
    showStatus('status-images', `❌ Erreur : ${err.message}`, 'error')
  } finally {
    btnConvert.disabled = false
  }
})