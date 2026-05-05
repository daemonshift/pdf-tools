// ============================================
// APP.JS — Point d'entrée principal
// ============================================

// --- Navigation entre les onglets ---
const navBtns = document.querySelectorAll('.nav-btn')
const tabs = document.querySelectorAll('.tab')

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab

    // Désactiver tous les onglets
    navBtns.forEach(b => b.classList.remove('active'))
    tabs.forEach(t => t.classList.remove('active'))

    // Activer l'onglet cible
    btn.classList.add('active')
    document.getElementById(`tab-${target}`).classList.add('active')
  })
})

// --- Utilitaire : afficher un status ---
function showStatus(elementId, message, type) {
  const el = document.getElementById(elementId)
  el.textContent = message
  el.className = `status ${type}`
}

// --- Utilitaire : formater la taille ---
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

// --- Utilitaire : télécharger un PDF ---
function downloadPdf(bytes, filename) {
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}