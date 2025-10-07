// excel_converter.js

import * as fs from 'fs';
import * as XLSX from 'xlsx';

// --- CONFIGURACIÓN ---
const MARKDOWN_INPUT_FILE = 'review_raw_output.md'; // Archivo donde pegas la tabla de Copilot
const EXCEL_OUTPUT_FILE = `review_audit_${new Date().toISOString().substring(0, 10)}.xlsx`;

// --- FUNCIÓN DE CONVERSIÓN ---
function convertMarkdownTableToExcel() {
    if (!fs.existsSync(MARKDOWN_INPUT_FILE)) {
        console.error(`\n[❌ ERROR] Archivo de entrada no encontrado: ${MARKDOWN_INPUT_FILE}`);
        console.log('PASO 1: Copia la tabla generada por Copilot y pégala dentro del archivo "review_raw_output.md"');
        console.log('PASO 2: Vuelve a ejecutar este comando.');
        return;
    }

    try {
        const markdownTableContent = fs.readFileSync(MARKDOWN_INPUT_FILE, 'utf-8');

        // Regex para encontrar la tabla Markdown. Busca líneas que empiecen con '|'.
        const markdownTableLines = markdownTableContent.split('\n').filter(line => 
            line.trim().startsWith('|') && !line.includes('---')
        );

        if (markdownTableLines.length < 2) {
            console.error('[❌ ERROR] No se detectó una tabla válida. Asegúrate de que solo contenga la tabla.');
            return;
        }

        // Convertir las líneas de la tabla en un Array of Arrays (AoA) para XLSX
        const excelDataRows = markdownTableLines.map(line => 
            line.split('|').map(cell => cell.trim()).filter(cell => cell !== '')
        );

        // Creación del archivo Excel
        const excelWorkbook = XLSX.utils.book_new();
        const excelWorksheet = XLSX.utils.aoa_to_sheet(excelDataRows);
        
        XLSX.utils.book_append_sheet(excelWorkbook, excelWorksheet, 'Revisión Código');
        XLSX.writeFile(excelWorkbook, EXCEL_OUTPUT_FILE);

        console.log('\n========================================');
        console.log(`[✅] Éxito! Tabla convertida y guardada en: ${EXCEL_OUTPUT_FILE}`);
        console.log('========================================');
        
        // Limpiar el archivo de entrada para la próxima ejecución
        fs.writeFileSync(MARKDOWN_INPUT_FILE, '', 'utf-8'); 
        console.log(`\n[🧹] Archivo temporal ${MARKDOWN_INPUT_FILE} sobrescrito y vaciado con éxito.`);

    } catch (error) {
        console.error('[❌ ERROR] Falló la conversión a Excel:', error.message);
    }
}

convertMarkdownTableToExcel();