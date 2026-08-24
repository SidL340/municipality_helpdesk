import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a token PDF and print silently to laser printer.
 * Safe and resilient: Never throws unhandled errors if printer is missing or offline.
 */
export async function printToken({ tokenNumber, deskName, serviceName, serviceNameNp, wardName, municipalityName, date }) {
  const tempDir = path.join(__dirname, '..', 'temp');
  if (!fs.existsSync(tempDir)) {
    try {
      fs.mkdirSync(tempDir, { recursive: true });
    } catch (e) {}
  }

  const filePath = path.join(tempDir, `token_${tokenNumber}_${Date.now()}.pdf`);

  return new Promise((resolve) => {
    try {
      // 80mm standard receipt width (~227 points)
      const doc = new PDFDocument({
        size: [227, 420],
        margins: { top: 15, bottom: 15, left: 15, right: 15 },
      });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Header
      if (municipalityName) {
        doc.fontSize(8).text(municipalityName, { align: 'center' });
      }
      doc.fontSize(10).text(wardName || 'वडा कार्यालय', { align: 'center' }).moveDown(0.2);
      doc.fontSize(8).text('नागरिक सहायता कक्ष (Citizen Help Desk)', { align: 'center' }).moveDown(0.4);

      // Line
      doc.moveTo(15, doc.y).lineTo(212, doc.y).stroke();
      doc.moveDown(0.5);

      // Label
      doc.fontSize(10).text('टोकन नम्बर / Token No.', { align: 'center' }).moveDown(0.2);

      // Big Token Number
      doc.fontSize(44).text(String(tokenNumber), { align: 'center' }).moveDown(0.3);

      // Line
      doc.moveTo(15, doc.y).lineTo(212, doc.y).stroke();
      doc.moveDown(0.5);

      // Service
      doc.fontSize(8).text('सेवा (Service):', { align: 'center' });
      doc.fontSize(10).text(serviceNameNp || serviceName || '', { align: 'center' }).moveDown(0.4);

      // Desk
      doc.fontSize(8).text('सम्पर्क काउन्टर (Visit Counter):', { align: 'center' });
      doc.fontSize(12).text(deskName || 'काउन्टर १', { align: 'center' }).moveDown(0.5);

      // Line
      doc.moveTo(15, doc.y).lineTo(212, doc.y).stroke();
      doc.moveDown(0.4);

      // Timestamp
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      doc.fontSize(8).text(`Date: ${date || now.toISOString().split('T')[0]} | Time: ${timeStr}`, { align: 'center' }).moveDown(0.3);

      doc.fontSize(7)
        .text('कृपया आफ्नो पालो कुर्नुहोस्।', { align: 'center' })
        .text('Please wait for your token to be called.', { align: 'center' })
        .moveDown(0.3);

      doc.fontSize(6)
        .fillColor('#444444')
        .text('System by: Nirmala Tech Innovations Pvt. Ltd.', { align: 'center' });

      doc.end();

      writeStream.on('finish', async () => {
        try {
          const printerModule = await import('pdf-to-printer').catch(() => null);
          const print = printerModule?.print || printerModule?.default?.print || printerModule?.default;

          if (typeof print === 'function') {
            const printerName = process.env.PRINTER_NAME || 'default';
            const printOptions = {};
            if (printerName !== 'default') {
              printOptions.printer = printerName;
            }
            await print(filePath, printOptions);
            console.log(`✅ Token ${tokenNumber} sent to printer.`);
          } else {
            console.log(`ℹ️ PDF Token generated: ${filePath}`);
          }
        } catch (printErr) {
          console.warn('⚠️ Direct printing skipped (Printer offline or not configured):', printErr.message);
        }
        resolve(filePath);
      });

      writeStream.on('error', (err) => {
        console.warn('PDF stream write warning:', err.message);
        resolve(null);
      });
    } catch (err) {
      console.warn('PDF Document creation warning:', err.message);
      resolve(null);
    }
  });
}

/**
 * Print an uploaded blank form PDF directly.
 */
export async function printForm(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error('Form file not found on server');
  }

  try {
    const printerModule = await import('pdf-to-printer').catch(() => null);
    const print = printerModule?.print || printerModule?.default?.print || printerModule?.default;

    if (typeof print === 'function') {
      const printerName = process.env.PRINTER_NAME || 'default';
      const printOptions = {};
      if (printerName !== 'default') {
        printOptions.printer = printerName;
      }
      await print(filePath, printOptions);
      return true;
    }
    return true;
  } catch (err) {
    console.warn('Print form warning:', err.message);
    return true;
  }
}
