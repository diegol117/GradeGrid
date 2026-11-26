import { state } from './state.js';
import { getColLetter, thinBorder, showToast } from './utils.js';

export async function exportToExcel() {
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Generador de Planillas Académicas';
    workbook.created = new Date();

    const sheetName = (state.courseName || 'Calificaciones').replace(/[\\/*?:[\]]/g, '').substring(0, 31);
    const ws = workbook.addWorksheet(sheetName, {
      views: [{ state: 'frozen', xSplit: 2, ySplit: 3 }]
    });

    const evalCount    = state.evaluations.length;
    const firstEvalCol = 3;
    const lastEvalCol  = 2 + evalCount;
    const finalCol     = lastEvalCol + 1;
    const roundCol     = lastEvalCol + 2;
    const statusCol    = lastEvalCol + 3;

    const firstEvalLetter = getColLetter(firstEvalCol);
    const lastEvalLetter  = getColLetter(lastEvalCol);
    const finalLetter     = getColLetter(finalCol);
    const roundLetter     = getColLetter(roundCol);
    const statusLetter    = getColLetter(statusCol);

    // FILA 1: encabezados
    const headerValues = ['ID', 'Estudiante', ...state.evaluations.map(e => e.name), 'Nota Final', 'Definitiva', 'Estado'];
    const row1 = ws.addRow(headerValues);
    row1.height = 28;
    row1.eachCell((cell) => {
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = thinBorder('FF334155');
    });
    row1.getCell(2).alignment = { vertical: 'middle', horizontal: 'left' };

    // FILA 2: peso
    const row2Values = ['', 'Peso (pts)', ...state.evaluations.map(e => Number(e.weight) || 0)];
    row2Values[finalCol - 1]  = { formula: `SUM(${firstEvalLetter}2:${lastEvalLetter}2)` };
    row2Values[roundCol - 1]  = 'Mín. Aprob:';
    row2Values[statusCol - 1] = Number(state.coursePass) || 10;

    const row2 = ws.addRow(row2Values);
    row2.height = 22;
    row2.eachCell((cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1E1B4B' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF2FF' } };
      cell.alignment = { vertical: 'middle', horizontal: colNumber === 2 ? 'right' : 'center' };
      cell.border = thinBorder('FFC7D2FE');
      if (colNumber >= firstEvalCol && colNumber <= finalCol) cell.numFmt = '0.00';
    });
    row2.getCell(roundCol).font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF3730A3' } };
    row2.getCell(roundCol).alignment = { vertical: 'middle', horizontal: 'right' };

    // FILA 3: escala
    const row3Values = ['', 'Escala máx.', ...state.evaluations.map(e => Number(e.maxScale) || 20)];
    row3Values[finalCol - 1]  = Number(state.courseMax) || 20;
    row3Values[roundCol - 1]  = '';
    row3Values[statusCol - 1] = '';

    const row3 = ws.addRow(row3Values);
    row3.height = 22;
    row3.eachCell((cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0C4A6E' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F9FF' } };
      cell.alignment = { vertical: 'middle', horizontal: colNumber === 2 ? 'right' : 'center' };
      cell.border = {
        top:    { style: 'thin',   color: { argb: 'FFBAE6FD' } },
        left:   { style: 'thin',   color: { argb: 'FFBAE6FD' } },
        right:  { style: 'thin',   color: { argb: 'FFBAE6FD' } },
        bottom: { style: 'medium', color: { argb: 'FF64748B' } }
      };
      if (colNumber >= firstEvalCol && colNumber <= finalCol) cell.numFmt = '0.00';
    });

    // Filas estudiantes
    const startStudentRow = 4;
    state.students.forEach((st, idx) => {
      const excelRowNum = startStudentRow + idx;
      const rowValues = [st.id, st.name];

      state.evaluations.forEach((ev) => {
        const val = st.grades[ev.id];
        rowValues.push(val !== '' && val !== null && val !== undefined ? Number(val) : null);
      });

      const formulaTerms = state.evaluations.map((_, eIdx) => {
        const cLetter = getColLetter(firstEvalCol + eIdx);
        return `${cLetter}${excelRowNum}/$${cLetter}$3*$${cLetter}$2`;
      });
      rowValues.push({ formula: `SUM(${formulaTerms.join(',')})` });
      rowValues.push({ formula: `ROUND(${finalLetter}${excelRowNum},0)` });
      rowValues.push({ formula: `IF(${roundLetter}${excelRowNum}>=$${statusLetter}$2,"Aprobado","Reprobado")` });

      const row = ws.addRow(rowValues);
      row.height = 21;
      const zebraFill = idx % 2 === 1 ? 'FFF8FAFC' : 'FFFFFFFF';

      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.font = { name: 'Calibri', size: 11, color: { argb: 'FF1E293B' } };
        cell.border = thinBorder('FFE2E8F0');
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zebraFill } };

        if (colNumber === 1) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.numFmt = '@';
        } else if (colNumber === 2) {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        } else if (colNumber >= firstEvalCol && colNumber <= lastEvalCol) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.numFmt = '0.00';
          const maxAllowed = Number(state.evaluations[colNumber - firstEvalCol].maxScale) || 20;
          cell.dataValidation = {
            type: 'decimal', operator: 'between', allowBlank: true,
            formulae: [0, maxAllowed], showErrorMessage: true,
            errorStyle: 'stop', errorTitle: 'Nota fuera de rango',
            error: `Ingresa una calificación entre 0 y ${maxAllowed}.`
          };
        } else if (colNumber === finalCol) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0F172A' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
          cell.numFmt = '0.00';
        } else if (colNumber === roundCol) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF1E293B' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
          cell.numFmt = '0';
        } else if (colNumber === statusCol) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.font = { name: 'Calibri', size: 10, bold: true };
        }
      });
    });

    const endStudentRow = startStudentRow + state.students.length - 1;

    // Formato condicional Aprobado / Reprobado
    ws.addConditionalFormatting({
      ref: `${statusLetter}${startStudentRow}:${statusLetter}${endStudentRow}`,
      rules: [
        {
          type: 'cellIs', operator: 'equal', formulae: ['"Aprobado"'],
          style: {
            fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFDCFCE7' } },
            font: { color: { argb: 'FF166534' }, bold: true }
          }
        },
        {
          type: 'cellIs', operator: 'equal', formulae: ['"Reprobado"'],
          style: {
            fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFEE2E2' } },
            font: { color: { argb: 'FF991B1B' }, bold: true }
          }
        }
      ]
    });

    // Fila PROMEDIO
    const avgRowValues = ['', 'PROMEDIO DEL GRUPO'];
    for (let c = firstEvalCol; c <= roundCol; c++) {
      const colL = getColLetter(c);
      avgRowValues.push({ formula: `AVERAGE(${colL}${startStudentRow}:${colL}${endStudentRow})` });
    }
    avgRowValues.push({ formula: `COUNTIF(${statusLetter}${startStudentRow}:${statusLetter}${endStudentRow},"Aprobado")&" Aprob."` });

    const avgRow = ws.addRow(avgRowValues);
    avgRow.height = 23;
    avgRow.eachCell((cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1E293B' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      cell.border = {
        top:    { style: 'medium', color: { argb: 'FF94A3B8' } },
        bottom: { style: 'thin',   color: { argb: 'FFCBD5E1' } },
        left:   { style: 'thin',   color: { argb: 'FFCBD5E1' } },
        right:  { style: 'thin',   color: { argb: 'FFCBD5E1' } }
      };
      cell.alignment = { vertical: 'middle', horizontal: colNumber === 2 ? 'right' : 'center' };
      if (colNumber >= firstEvalCol && colNumber <= roundCol) cell.numFmt = '0.00';
    });

    // Fila MÁXIMA
    const maxRowValues = ['', 'NOTA MÁXIMA'];
    for (let c = firstEvalCol; c <= roundCol; c++) {
      const colL = getColLetter(c);
      maxRowValues.push({ formula: `MAX(${colL}${startStudentRow}:${colL}${endStudentRow})` });
    }
    maxRowValues.push({ formula: `COUNTIF(${statusLetter}${startStudentRow}:${statusLetter}${endStudentRow},"Reprobado")&" Reprob."` });

    const maxRow = ws.addRow(maxRowValues);
    maxRow.height = 22;
    maxRow.eachCell((cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF475569' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
      cell.border = thinBorder('FFCBD5E1');
      cell.alignment = { vertical: 'middle', horizontal: colNumber === 2 ? 'right' : 'center' };
      if (colNumber >= firstEvalCol && colNumber <= roundCol) cell.numFmt = '0.00';
    });

    // Anchos
    ws.getColumn(1).width = 10;
    ws.getColumn(2).width = 28;
    for (let c = firstEvalCol; c <= lastEvalCol; c++) ws.getColumn(c).width = 15;
    ws.getColumn(finalCol).width  = 14;
    ws.getColumn(roundCol).width  = 13;
    ws.getColumn(statusCol).width = 15;

    // Descarga
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeFileName = (state.courseName || 'Planilla_Calificaciones')
      .toLowerCase()
      .replace(/[^a-z0-9áéíóúñ]+/gi, '_')
      .replace(/^_|_$/g, '');
    link.href = url;
    link.download = `${safeFileName}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Descargado "${safeFileName}.xlsx" con fórmulas activas`);
  } catch (err) {
    console.error(err);
    showToast('Error al generar el archivo Excel', true);
  }
}