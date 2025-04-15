// controllers/CRUD/pdfGen.js
import {Inventory} from '../../models/Inventory.js'; // Change from named import to default import
import PDFDocument from 'pdfkit';

// Helper function to generate PDF content
const generatePDFContent = async (type) => {
  const inventory = await Inventory.findOne({ type });
  if (!inventory) {
    throw new Error(`No ${type} inventory found`);
  }

  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: {
      Title: `${type.charAt(0).toUpperCase() + type.slice(1)} Inventory Report`,
      Author: 'ACME Inventory System',
    }
  });

  // Add header with logo or company name
  doc.fontSize(24)
     .fillColor('#333333')
     .text('ACME Inventory', { align: 'left' });
  
  doc.fontSize(20)
     .fillColor('#0066cc')
     .text(`${type.charAt(0).toUpperCase() + type.slice(1)} Inventory Report`, {
       align: 'center'
     });
  
  // Add date
  doc.fontSize(12)
     .fillColor('#666666')
     .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });
  
  doc.moveDown(2);

  let totalAmount = 0;

  inventory.categories.forEach(category => {
    // Category header with background
    doc.rect(50, doc.y, 495, 30)
       .fill('#f0f0f0');
    
    doc.fontSize(16)
       .fillColor('#333333')
       .text(`Category: ${category.name}`, 55, doc.y + 5);
    
    doc.moveDown(1.5);

    let categoryTotal = 0;
    category.subcategories.forEach(subcategory => {
      // Subcategory with modern styling
      doc.fontSize(14)
         .fillColor('#0066cc')
         .text(`  - Subcategory: ${subcategory.name}`);
      
      // Price with cents
      doc.fontSize(12)
         .fillColor('#333333')
         .text(`    - Price: $${subcategory.price.toFixed(2)}`);
      
      doc.moveDown(0.5);

      categoryTotal += subcategory.price;
    });

    // Category total with styling
    doc.fontSize(12)
       .fillColor('#333333')
       .text(`  Category Total: $${categoryTotal.toFixed(2)}`, { continued: true })
       .fillColor('#0066cc')
       .text(`  (${category.subcategories.length} items)`);
    
    doc.moveDown(1.5);

    totalAmount += categoryTotal;
  });

  // Add a separator line
  doc.moveDown();
  doc.lineWidth(1)
     .strokeColor('#cccccc')
     .moveTo(50, doc.y)
     .lineTo(545, doc.y)
     .stroke();
  
  doc.moveDown();

  // Total amount with enhanced styling
  doc.fontSize(16)
     .fillColor('#333333')
     .text(`Total Amount: $${totalAmount.toFixed(2)}`, {
       align: 'right'
     });

  // Add footer
  doc.fontSize(10)
     .fillColor('#999999')
     .text('ACME Inventory System - Confidential', 50, 750, { align: 'center' });

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
