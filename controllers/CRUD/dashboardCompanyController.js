import DashboardCompany from '../../models/dashBoardCompany.js'; // Ensure to add .js extension for ESM
import PDFDocument from 'pdfkit';

// Add a new company
export const addCompany = async (req, res) => {
  try {
    const { name } = req.body;
    const existing = await DashboardCompany.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Company already exists' });

    const newCompany = new DashboardCompany({ name, records: [] });
    await newCompany.save();

    res.status(201).json({ message: 'Company added successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add a record to a company
export const addRecord = async (req, res) => {
  try {
    const { companyName, date, amount, description } = req.body;
    const company = await DashboardCompany.findOne({ name: companyName });
    if (!company) return res.status(404).json({ message: 'Company not found' });

    company.records.push({ date, amount, description });
    await company.save();

    res.status(201).json({ message: 'Record added successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteRecordById = async (req, res) => {
  try {
    const { companyName, recordId } = req.body;
    const company = await DashboardCompany.findOne({ name: companyName });

    if (!company) return res.status(404).json({ message: 'Company not found' });

    const initialLength = company.records.length;

    company.records = company.records.filter(record => record._id.toString() !== recordId);

    if (company.records.length === initialLength) {
      return res.status(404).json({ message: 'Record not found' });
    }

    await company.save();
    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Edit a record
export const editRecord = async (req, res) => {
  try {
    const { companyName, recordId, date, amount, description } = req.body;
    const company = await DashboardCompany.findOne({ name: companyName });
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const record = company.records.id(recordId); // ✅ FIXED
    if (!record) return res.status(404).json({ message: 'Record not found' });

    record.date = date || record.date;
    record.amount = amount !== undefined ? amount : record.amount;
    record.description = description || record.description;

    await company.save();
    res.status(200).json({ message: 'Record updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all companies
export const getAllCompanies = async (req, res) => {
  try {
    const companies = await DashboardCompany.find();
    res.status(200).json(companies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a company by name
export const getCompanyByName = async (req, res) => {
  try {
    const { name } = req.query;
    const company = await DashboardCompany.findOne({ name });
    if (!company) return res.status(404).json({ message: 'Company not found' });

    res.status(200).json(company);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Delete a company by name
export const deleteCompany = async (req, res) => {
  try {
    const { name } = req.body;
    const company = await DashboardCompany.findOneAndDelete({ name });
    if (!company) return res.status(404).json({ message: 'Company not found' });

    res.status(200).json({ message: 'Company deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const generateCompanyDetailReport = async (req, res) => {
  try {
    const { companyId } = req.params;
    const company = await DashboardCompany.findById(companyId);

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

    // === HEADER ===
    doc.rect(0, 0, doc.page.width, 100).fill('#2c3e50');
    doc.fontSize(24).fillColor('white').text('Company Details Report', {
      align: 'center',
      y: 35
    });
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, {
      align: 'center',
      y: 75
    });

    doc.moveDown(3);

    // === COMPANY INFO ===
    doc.fontSize(16).fillColor('#2c3e50').text('Company Information', { underline: true });
    doc.moveDown(0.5);

    const totalAmount = company.records.reduce(
      (sum, record) => sum + (parseFloat(record.amount) || 0), 0
    );

    doc.fontSize(12).fillColor('#000');
    doc.text(`Company Name: ${company.name}`);
    doc.text(`Total Records: ${company.records.length}`);
    doc.text(`Total Amount: Rs. ${totalAmount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

    doc.moveDown(2);

    // === RECORDS SECTION ===
    doc.fontSize(16).fillColor('#2c3e50').text('Records', { underline: true });
    doc.moveDown(0.5);

    const headers = ['Date', 'Amount (Rs.)', 'Description'];
    const colWidths = [100, 100, 300]; // adjust to fit A4 page width (approx 500–550px)
    const rowHeight = 20;
    let x = 50;
    let y = doc.y;
    const pageHeightLimit = doc.page.height - 100;

    // Draw table headers
    doc.fontSize(12).fillColor('#000');
    headers.forEach((header, i) => {
      doc.text(header, x, y, { width: colWidths[i], align: 'left' });
      x += colWidths[i];
    });

    doc.moveTo(50, y + rowHeight - 12).lineTo(550, y + rowHeight - 12).stroke();
    y += rowHeight;

    // Draw table rows
    company.records.forEach((record, index) => {
      if (y + rowHeight > pageHeightLimit) {
        doc.addPage();
        y = doc.y;
      }

      // Alternate row background
      if (index % 2 === 0) {
        doc.rect(50, y - 2, 500, rowHeight).fill('#f0f0f0');
      }

      x = 50;
      const values = [
        new Date(record.date).toLocaleDateString(),
        (parseFloat(record.amount) || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        record.description
      ];

      doc.fontSize(10).fillColor('#2c3e50');
      values.forEach((val, i) => {
        doc.text(val, x, y, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });

      y += rowHeight;
    });

    // === Grand Total Row ===
    if (y + rowHeight > pageHeightLimit) {
      doc.addPage();
      y = doc.y;
    }

    doc.rect(50, y - 2, 500, rowHeight).fill('#e8f0fe');
    doc.fontSize(12).fillColor('#2c3e50');
    doc.text('Grand Total:', 50, y, { width: 200, align: 'left' });
    doc.text(`Rs. ${totalAmount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 150, y, { width: 200, align: 'left' });

    y += rowHeight;

    // === FOOTER ON ALL PAGES ===
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(10)
        .fillColor('#7f8c8d')
        .text(`Page ${i + 1} of ${pageCount}`, 0, doc.page.height - 50, { align: 'center' });
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const generateFullCompanyReport = async (req, res) => {
  try {
    const companies = await DashboardCompany.find();

    if (companies.length === 0) {
      return res.status(404).json({ message: 'No companies found' });
    }

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true
    });

    res.setHeader('Content-Disposition', `attachment; filename=all_companies_report.pdf`);
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    // === MAIN HEADER ===
    doc.rect(0, 0, doc.page.width, 100).fill('#2c3e50');
    doc.fontSize(24).fillColor('white').text('All Companies Report', {
      align: 'center',
      y: 35
    });
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, {
      align: 'center',
      y: 75
    });

    doc.moveDown(3);

    // === FOR EACH COMPANY (no forced new page) ===
    const headers = ['Date', 'Amount (Rs.)', 'Description'];
    const colWidths = [100, 100, 300];
    const rowHeight = 20;
    const pageHeightLimit = doc.page.height - 100;
    let y = doc.y;

    for (const company of companies) {
      const totalAmount = company.records.reduce(
        (sum, record) => sum + (parseFloat(record.amount) || 0), 0
      );

      // Check if we need a new page before printing this company header
      if (y + 100 > pageHeightLimit) {
        doc.addPage();
        y = doc.y;
      }
      doc.fontSize(16).fillColor('#2c3e50').text(`Company: ${company.name}`, 50, y, {
        align: 'left',
        underline: true
      });
      doc.moveDown(0.5);

      doc.fontSize(12).fillColor('#000');
      doc.text(`Total Records: ${company.records.length}`);
      doc.text(`Total Amount: Rs. ${totalAmount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

      doc.moveDown(1);
      y = doc.y;

      if (company.records.length === 0) {
        doc.text('No records available.', { italic: true });
        doc.moveDown(1);
        y = doc.y;
        continue;
      }

      // === RECORDS TABLE HEADERS ===
      let x = 50;
      doc.fontSize(12).fillColor('#000');
      headers.forEach((header, i) => {
        doc.text(header, x, y, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });

      doc.moveTo(50, y + rowHeight - 12).lineTo(550, y + rowHeight - 12).stroke();
      y += rowHeight;

      company.records.forEach((record, index) => {
        if (y + rowHeight > pageHeightLimit) {
          doc.addPage();
          y = doc.y;
        }

        if (index % 2 === 0) {
          doc.rect(50, y - 2, 500, rowHeight).fill('#f0f0f0');
        }

        x = 50;
        const values = [
          new Date(record.date).toLocaleDateString(),
          (parseFloat(record.amount) || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          record.description
        ];

        doc.fontSize(10).fillColor('#2c3e50');
        values.forEach((val, i) => {
          doc.text(val, x, y, { width: colWidths[i], align: 'left' });
          x += colWidths[i];
        });

        y += rowHeight;
      });

      // Add space before next company
      doc.moveDown(2);
      y = doc.y;
    }

    // === FOOTER ON ALL PAGES ===
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(10)
        .fillColor('#7f8c8d')
        .text(`Page ${i + 1} of ${pageCount}`, 0, doc.page.height - 50, { align: 'center' });
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

