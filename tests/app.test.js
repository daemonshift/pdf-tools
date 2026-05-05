// ============================================
// APP.TEST.JS — Tests unitaires
// ============================================

import { describe, it, expect } from 'vitest'
import { formatSize, isValidImage, isValidPdf, parsePages, getPdfPageName, filterDuplicates } from '../modules/utils.js'

// --- formatSize ---
describe('formatSize', () => {
  it('affiche les octets pour moins de 1Ko', () => {
    expect(formatSize(512)).toBe('512 o')
  })

  it('affiche les Ko pour moins de 1Mo', () => {
    expect(formatSize(1024)).toBe('1.0 Ko')
  })

  it('affiche les Mo pour 1Mo et plus', () => {
    expect(formatSize(1048576)).toBe('1.0 Mo')
  })
})

// --- isValidImage ---
describe('isValidImage', () => {
  it('accepte les PNG', () => {
    expect(isValidImage({ type: 'image/png' })).toBe(true)
  })

  it('accepte les JPEG', () => {
    expect(isValidImage({ type: 'image/jpeg' })).toBe(true)
  })

  it('refuse les PDF', () => {
    expect(isValidImage({ type: 'application/pdf' })).toBe(false)
  })

  it('refuse les fichiers inconnus', () => {
    expect(isValidImage({ type: 'text/plain' })).toBe(false)
  })
})

// --- isValidPdf ---
describe('isValidPdf', () => {
  it('accepte les PDF', () => {
    expect(isValidPdf({ type: 'application/pdf' })).toBe(true)
  })

  it('refuse les images', () => {
    expect(isValidPdf({ type: 'image/png' })).toBe(false)
  })
})

// --- parsePages ---
describe('parsePages', () => {
  it('parse une page simple', () => {
    expect(parsePages('1', 5)).toEqual([0])
  })

  it('parse plusieurs pages séparées par virgule', () => {
    expect(parsePages('1,3,5', 5)).toEqual([0, 2, 4])
  })

  it('parse une plage de pages', () => {
    expect(parsePages('1-3', 5)).toEqual([0, 1, 2])
  })

  it('parse un mix de pages et plages', () => {
    expect(parsePages('1,3-5', 5)).toEqual([0, 2, 3, 4])
  })

  it('lève une erreur si la page dépasse le total', () => {
    expect(() => parsePages('10', 5)).toThrow()
  })

  it('lève une erreur si la page est inférieure à 1', () => {
    expect(() => parsePages('0', 5)).toThrow()
  })

  it('lève une erreur si la plage est invalide', () => {
    expect(() => parsePages('abc-def', 5)).toThrow()
  })
})

// --- getPdfPageName ---
describe('getPdfPageName', () => {
  it('génère le bon nom de fichier', () => {
    expect(getPdfPageName('document', 0)).toBe('document-page-1.pdf')
  })

  it('génère le bon nom pour la page 5', () => {
    expect(getPdfPageName('rapport', 4)).toBe('rapport-page-5.pdf')
  })
})

// --- filterDuplicates ---
describe('filterDuplicates', () => {
  it('filtre les fichiers déjà présents', () => {
    const existing = [{ name: 'a.pdf' }, { name: 'b.pdf' }]
    const newFiles = [{ name: 'b.pdf' }, { name: 'c.pdf' }]
    expect(filterDuplicates(existing, newFiles)).toEqual([{ name: 'c.pdf' }])
  })

  it('retourne tous les fichiers si aucun doublon', () => {
    const existing = [{ name: 'a.pdf' }]
    const newFiles = [{ name: 'b.pdf' }, { name: 'c.pdf' }]
    expect(filterDuplicates(existing, newFiles)).toHaveLength(2)
  })

  it('retourne un tableau vide si tous sont en double', () => {
    const existing = [{ name: 'a.pdf' }]
    const newFiles = [{ name: 'a.pdf' }]
    expect(filterDuplicates(existing, newFiles)).toHaveLength(0)
  })
})