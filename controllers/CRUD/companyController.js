import Company from '../../models/Companies.js'; // Ensure to add .js extension for ESM
import PDFDocument from 'pdfkit';
import fs from 'fs';

// Add a new company
export const addCompany = async (req, res) => {
  try {
    const newCompany = new Company(req.body);
    const savedCompany = await newCompany.save();
    res.status(201).json(savedCompany);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add a new record to an existing company
export const addRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    company.records.push(req.body);
    const updatedCompany = await company.save();
    res.status(201).json(updatedCompany);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a company by ID
export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCompany = await Company.findByIdAndDelete(id);
    if (!deletedCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.status(200).json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a company by ID
export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCompany = await Company.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.status(200).json(updatedCompany);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all company names
export const getAllCompanyNames = async (req, res) => {
  try {
    const companies = await Company.find({}, 'name');
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get company details by ID
export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a record within a company
export const updateRecord = async (req, res) => {
  try {
    const { companyId, recordId } = req.params;
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const record = company.records.id(recordId);
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    Object.assign(record, req.body); // Update record fields
    await company.save(); // Save updated company document

    res.status(200).json(company);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// Delete a record from a specific company
export const deleteRecord = async (req, res) => {
  try {
    const { companyId, recordId } = req.params;

    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      { $pull: { records: { _id: recordId } } },
      { new: true } // return updated document
    );

    if (!updatedCompany) {
      return res.status(404).json({ message: 'Company not found or record not found' });
    }

    res.status(200).json({ message: 'Record deleted successfully', company: updatedCompany });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Summary PDF: All Companies with total advance
export const generateSummaryReport = async (req, res) => {
  try {
    const companies = await Company.find();

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true,
    });

    res.setHeader('Content-Disposition', 'attachment; filename=all_companies_summary.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    // Header
    doc.rect(0, 0, doc.page.width, 100).fill('#2c3e50');
    doc.fontSize(24).fillColor('white').text('Company Payment Summary Report', {
      align: 'center',
      baseline: 'middle',
      y: 35,
    });
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, {
      align: 'center',
      y: 75,
    });

    // Reset content position
    doc.y = 120;

    doc.moveDown().fontSize(16).fillColor('#2c3e50').text('Payment Summary', {
      underline: true,
    });
    doc.moveDown(1.5);

    // Table Header
    doc.fontSize(13).fillColor('#000000').text('Company', 60, doc.y, { width: 300 });
    doc.text('Total Advance', 360, doc.y, { width: 200, align: 'right' });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    // Payment rows
    const rowHeight = 24;
    const pageHeightLimit = doc.page.height - 100;

    let y = doc.y;

    const grandTotal = companies.reduce((total, company) => {
      return total + company.records.reduce((sum, r) => sum + parseFloat(r.advance || 0), 0);
    }, 0);

    companies.forEach((company, index) => {
      const totalAdvance = company.records.reduce((sum, r) => sum + parseFloat(r.advance || 0), 0);

      // Start new page if needed
      if (y + rowHeight > pageHeightLimit) {
        doc.addPage();
        y = doc.y;
      }

      // Alternate row background
      if (index % 2 === 0) {
        doc.rect(50, y - 2, 500, rowHeight).fill('#f8f9fa').fillColor('#2c3e50');
      }

      doc.fontSize(12).fillColor('#2c3e50');
      doc.text(company.name, 60, y, { width: 300 });
      doc.text(`Rs. ${totalAdvance.toFixed(2)}`, 360, y, { width: 200, align: 'right' });

      y += rowHeight;
      doc.y = y;
    });

    // Grand Total
    doc.moveDown(2);
    doc.fontSize(13).fillColor('#000').text('Grand Total:', 60, doc.y, {
      width: 300
    });
    doc.text(`Rs. ${grandTotal.toFixed(2)}`, 360, doc.y, {
      width: 200,
      align: 'right',
    });

    // Footer
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(10)
        .fillColor('#7f8c8d')
        .text(`Page ${i + 1} of ${pageCount}`, 0, doc.page.height - 50, {
          align: 'center',
        });
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Detailed PDF: Individual Company with all records
export const generateCompanyDetailReport = async (req, res) => {
  try {
    const { companyId } = req.params;
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true
    });

    res.setHeader('Content-Disposition', `attachment; filename=company_${companyId}_details.pdf`);
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    // Header
    doc.rect(0, 0, doc.page.width, 100).fill('#2c3e50');
    doc.fontSize(24).fillColor('white').text('Company Details Report', {
      align: 'center',
      y: 35
    });
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, {
      align: 'center',
      y: 75
    });

    doc.y = 120;

    // Company Info
    doc.fontSize(16).fillColor('#2c3e50').text('Company Information', { underline: true });
    doc.moveDown(0.5);

    // Boxed Info Area
    const infoBoxHeight = 60;
    doc.rect(50, doc.y, doc.page.width - 100, infoBoxHeight).fill('#f8f9fa');

    const totalAdvance = company.records.reduce(
      (sum, r) => sum + parseFloat(r.advance || 0), 0
    );

    doc.fillColor('#2c3e50').fontSize(12);
    let infoY = doc.y + 10;
    doc.text(`Company Name: ${company.name}`, 60, infoY);
    doc.text(`Total Records: ${company.records.length}`, 60, infoY + 18);
    doc.text(`Total Advance: Rs. ${totalAdvance.toFixed(2)}`, 60, infoY + 36);

    // Records Section
    doc.y = doc.y + infoBoxHeight + 20;
    doc.fontSize(16).fillColor('#2c3e50').text('Payment Records', { underline: true });
    doc.moveDown(0.5);

    // Table Header
const headers = ['Date', 'Invoice No', 'Container No', 'Product', 'Payments', 'Cheque No'];
    const colWidths = [80, 80, 80, 100, 80, 80]; // total: 500
    const rowHeight = 24;
    const pageHeightLimit = doc.page.height - 100;
    let x = 50;
    let y = doc.y;

    doc.fontSize(12).fillColor('#000000');
    headers.forEach((header, i) => {
      doc.text(header, x, y, { width: colWidths[i], align: 'left' });
      x += colWidths[i];
    });
    doc.moveTo(50, y + rowHeight - 12).lineTo(550, y + rowHeight - 12).stroke();
    y += rowHeight;

    // Table Rows
    company.records.forEach((record, index) => {
      if (y + rowHeight > pageHeightLimit) {
        doc.addPage();
        y = doc.y;
      }

      // Alternate background color
      if (index % 2 === 0) {
        doc.rect(50, y - 2, 500, rowHeight).fill('#f0f0f0');
      }

      x = 50;
      const values = [
        new Date(record.date).toLocaleDateString(),
        record.invoiceNo || '-',
        record.containerNo || '-',
        record.product || '-',
        `Rs. ${record.advance || '0.00'}`,
        record.chequeNumber || 'N/A'
      ];

      doc.fontSize(10).fillColor('#2c3e50');
      values.forEach((val, i) => {
        doc.text(val, x, y, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });

      y += rowHeight;
    });

    // === Grand Total Row at the Bottom ===
    if (y + rowHeight > pageHeightLimit) {
      doc.addPage();
      y = doc.y;
    }

    doc.rect(50, y - 2, 500, rowHeight).fill('#e8f0fe');

    doc.fontSize(12).fillColor('#2c3e50');
    doc.text('Grand Total:', 50, y, {
      width: 420,
      align: 'right'
    });
    doc.text(`Rs. ${totalAdvance.toFixed(2)}`, 470, y, {
      width: 80,
      align: 'left'
    });

    y += rowHeight;

    // === Footer on All Pages ===
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(10)
        .fillColor('#7f8c8d')
        .text(`Page ${i + 1} of ${pageCount}`, 0, doc.page.height - 50, {
          align: 'center'
        });
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
