// ============================================
// UTILS.JS — Fonctions pures testables
// ============================================

/**
 * Formate une taille en octets en string lisible
 */
export function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

/**
 * Vérifie si un fichier est une image acceptée
 */
export function isValidImage(file) {
  return file.type === 'image/png' || file.type === 'image/jpeg'
}

/**
 * Vérifie si un fichier est un PDF
 */
export function isValidPdf(file) {
  return file.type === 'application/pdf'
}

/**
 * Parse une chaîne de pages (ex: "1,3,5-8")
 * Retourne un tableau d'index (base 0)
 */
export function parsePages(input, totalPages) {
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

/**
 * Génère un nom de fichier PDF à partir d'un nom de base et d'un index de page
 */
export function getPdfPageName(baseName, pageIndex) {
  return `${baseName}-page-${pageIndex + 1}.pdf`
}

/**
 * Filtre les doublons dans une liste de fichiers par nom
 */
export function filterDuplicates(existingFiles, newFiles) {
  return newFiles.filter(f => !existingFiles.find(e => e.name === f.name))
}