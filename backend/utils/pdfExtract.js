const pdfParse = require('pdf-parse');

/**
 * Extract text from a PDF buffer
 * @param {Buffer} buffer - PDF file buffer
 * @returns {Promise<string>} - Extracted text
 */
const extractTextFromPDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    const text = data.text.trim();
    if (!text || text.length < 50) {
      throw new Error('Could not extract text from this PDF. Please use a text-based PDF (not a scanned image).');
    }
    return text.slice(0, 6000); // limit to 6000 chars for API
  } catch (err) {
    if (err.message.includes('Could not extract')) throw err;
    throw new Error('Failed to parse PDF. Please make sure the file is a valid PDF.');
  }
};

module.exports = { extractTextFromPDF };
