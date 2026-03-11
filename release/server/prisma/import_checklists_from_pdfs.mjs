import fs from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PDF_DIR = 'c:/Projetos/siapp/siapp/documentos';

const CHECKLIST_FILES = [
  { match: 'CARNE', tipo_industria: 'CARNE', titulo: 'Checklist Pré-registro CARNE - Técnicos' },
  { match: 'LEITE', tipo_industria: 'LEITE', titulo: 'Checklist Pré-registro LEITE - Técnicos' },
  { match: 'OVOS', tipo_industria: 'OVOS', titulo: 'Checklist Pré-registro OVOS - Técnicos' },
  { match: 'PESCADO', tipo_industria: 'PESCADO', titulo: 'Checklist Pré-registro PESCADO - Técnicos' },
  { match: 'PRODUTOS DE ABELHAS', tipo_industria: 'MEL', titulo: 'Checklist Pré-registro PRODUTOS DE ABELHAS - Técnicos' }
];

function fixMojibake(str) {
  if (!str) return '';
  const text = String(str);

  const badMarkerCount = (text.match(/Ã.|Â./g) || []).length;
  const ptAccentCount = (text.match(/[áéíóúâêôãõçÁÉÍÓÚÂÊÔÃÕÇ]/g) || []).length;

  if (badMarkerCount > Math.max(8, ptAccentCount * 2)) {
    return Buffer.from(text, 'latin1').toString('utf8');
  }
  return text;
}

function isNonItemNumericLine(rest) {
  return /^(dias?|mes(?:es)?|anos?|horas?|m[eê]s)/i.test(rest);
}

function parseChecklistItems(rawText) {
  const lines = fixMojibake(rawText)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const items = [];
  let currentSection = 'PARTE_GERAL';
  let currentItem = null;

  const flushCurrent = () => {
    if (!currentItem) return;
    const texto = currentItem.textoLines
      .map((l) => l.trim())
      .filter(Boolean)
      .join('\n')
      .trim();

    if (texto.length >= 5) {
      items.push({ grupo: currentItem.grupo, texto_pergunta: texto });
    }
    currentItem = null;
  };

  for (const line of lines) {
    if (/^0?1\.\s*PARTE\s+GERAL/i.test(line)) {
      flushCurrent();
      currentSection = 'PARTE_GERAL';
      continue;
    }
    if (/^0?2\.\s*PARTE\s+ESPEC/i.test(line)) {
      flushCurrent();
      currentSection = 'PARTE_ESPECIFICA';
      continue;
    }

    if (/^\d+\s+de\s+\d+/i.test(line)) continue;
    if (/^--\s*\d+\s+of\s+\d+\s*--/i.test(line)) continue;
    if (/^Item\s+Requisito/i.test(line)) continue;
    if (/^CHECK LIST/i.test(line)) continue;
    if (/^Legenda:/i.test(line)) continue;

    const mOnlyNumber = line.match(/^(\d{2})$/);
    if (mOnlyNumber) {
      flushCurrent();
      currentItem = { grupo: currentSection, textoLines: [] };
      continue;
    }

    const m = line.match(/^(\d{2})\s+(.+)$/);
    if (m) {
      const rest = m[2].trim();
      if (!isNonItemNumericLine(rest)) {
        flushCurrent();
        currentItem = { grupo: currentSection, textoLines: [rest] };
        continue;
      }
    }

    if (currentItem) {
      if (/^(C|CR|NC|NA)$/i.test(line)) continue;
      if (/^Item\s+Requisito/i.test(line)) continue;
      if (/^\d+\s+de\s+\d+/i.test(line)) continue;
      currentItem.textoLines.push(line);
    }
  }

  flushCurrent();

  const dedup = [];
  const seen = new Set();
  for (const it of items) {
    const key = `${it.grupo}::${it.texto_pergunta}`;
    if (!seen.has(key)) {
      dedup.push(it);
      seen.add(key);
    }
  }
  return dedup;
}

async function readPdfText(filePath) {
  const parser = new PDFParse({ data: fs.readFileSync(filePath) });
  const text = (await parser.getText())?.text || '';
  await parser.destroy();
  return text;
}

function resolveFileName(match) {
  const upper = String(match).toUpperCase();
  const found = fs
    .readdirSync(PDF_DIR)
    .find((name) => name.toUpperCase().includes('CHECK LIST') && name.toUpperCase().includes(upper));

  if (!found) throw new Error(`Arquivo não encontrado para ${match} em ${PDF_DIR}`);
  return found;
}

async function importOneChecklist(cfg) {
  const fileName = resolveFileName(cfg.match);
  const fullPath = path.join(PDF_DIR, fileName);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Arquivo não encontrado: ${fullPath}`);
  }

  const text = await readPdfText(fullPath);
  const parsed = parseChecklistItems(text);
  if (parsed.length < 40) {
    throw new Error(`Extração muito curta para ${fileName}. Itens extraídos: ${parsed.length}`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.checklistModelo.updateMany({
      where: { tipo_industria: cfg.tipo_industria, ativo: true },
      data: { ativo: false }
    });

    await tx.checklistModelo.create({
      data: {
        titulo: cfg.titulo,
        tipo_industria: cfg.tipo_industria,
        versao: 'PDF-2026.02',
        ativo: true,
        itens: {
          create: parsed.map((it, idx) => ({
            grupo: it.grupo,
            texto_pergunta: it.texto_pergunta,
            ordem: idx + 1,
            peso_risco: null
          }))
        }
      }
    });
  });

  return parsed.length;
}

async function main() {
  const summary = [];
  for (const cfg of CHECKLIST_FILES) {
    const count = await importOneChecklist(cfg);
    summary.push({ tipo: cfg.tipo_industria, titulo: cfg.titulo, itens: count });
  }
  console.log('IMPORT_OK');
  console.table(summary);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
