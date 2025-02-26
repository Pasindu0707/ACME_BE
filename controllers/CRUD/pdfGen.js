// controllers/CRUD/pdfGen.js
import {Inventory} from '../../models/Inventory.js'; // Change from named import to default import
import PDFDocument from 'pdfkit';

// Helper function to generate PDF content
const generatePDFContent = async (type) => {
  const inventory = await Inventory.findOne({ type });
  if (!inventory) {
    throw new Error(`No ${type} inventory found`);
  }

  const doc = new PDFDocument();
  doc.fontSize(20).text(`${type.charAt(0).toUpperCase() + type.slice(1)} Inventory Report`, {
    align: 'center'
  });
  doc.moveDown();

  let totalAmount = 0;

  inventory.categories.forEach(category => {
    doc.fontSize(16).text(`Category: ${category.name}`);
    doc.moveDown(0.5);

    let categoryTotal = 0;
    category.subcategories.forEach(subcategory => {
      doc.fontSize(14).text(`  - Subcategory: ${subcategory.name}`);
      doc.fontSize(12).text(`    - Details: ${subcategory.details.join(', ')}`);
      doc.text(`    - Price: ${subcategory.price}`);
      doc.moveDown(0.5);

      categoryTotal += subcategory.price;
    });

    doc.fontSize(12).text(`  Category Total: ${categoryTotal}`);
    doc.moveDown();

    totalAmount += categoryTotal;
  });

  doc.moveDown();
  doc.fontSize(16).text(`Total Amount: ${totalAmount}`, {
    align: 'right'
  });

  return doc;
};

// Get PDF report of incoming items
export const getIncomingPDFReport = async (req, res) => {
  try {
    const doc = await generatePDFContent('incoming');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=incoming_report.pdf');
    doc.pipe(res);
    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get PDF report of outgoing items
export const getOutgoingPDFReport = async (req, res) => {
  try {
    const doc = await generatePDFContent('outgoing');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=outgoing_report.pdf');
    doc.pipe(res);
    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
