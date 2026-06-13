import PDFDocument from 'pdfkit';
import cloudinary from '../config/cloudinary.js';

export const generateAndUploadInvoice = async (user, subscription) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });

      // Create a secure Cloudinary upload stream
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'egcn_invoices',
          resource_type: 'raw',
          public_id: `invoice_${subscription.razorpayOrderId}`,
          format: 'pdf',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary Invoice Upload Error:', error);
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      );

      // Pipe the PDF document directly to the Cloudinary stream
      doc.pipe(uploadStream);

      // --- Draw Invoice Content ---

      // Logo & Brand Header
      doc.fillColor('#d74339')
         .fontSize(24)
         .text('EGCN ADVISORY', 50, 45)
         .fontSize(9)
         .fillColor('#8c8c8c')
         .text('Marketing, Finance & CashFlow Advisory', 50, 75);

      // Invoice metadata
      doc.fillColor('#F5F0E8')
         .fontSize(16)
         .text('INVOICE', 400, 45, { align: 'right' })
         .fontSize(9)
         .fillColor('#8c8c8c')
         .text(`Invoice No: INV-${subscription.razorpayOrderId.substring(6)}`, 400, 65, { align: 'right' })
         .text(`Date: ${new Date().toLocaleDateString()}`, 400, 77, { align: 'right' })
         .text(`Plan: ${subscription.plan.toUpperCase()}`, 400, 89, { align: 'right' });

      // Subtle Divider
      doc.moveTo(50, 115).lineTo(550, 115).strokeColor('#1F1F1F').lineWidth(1).stroke();

      // Client & Billing Info
      doc.fillColor('#F5F0E8')
         .fontSize(10)
         .text('Billed To:', 50, 135, { underline: true })
         .text(user.businessName, 50, 150)
         .fillColor('#8c8c8c')
         .text(`Username: ${user.username}`, 50, 162)
         .text(`Email: ${user.email}`, 50, 174)
         .text(`Phone: ${user.phone}`, 50, 186)
         .text(`${user.address}, ${user.city}, ${user.state}`, 50, 198);

      // EGCN Corporate Details
      doc.fillColor('#F5F0E8')
         .text('Billed By:', 400, 135, { underline: true })
         .text('EGCN Consulting Private Ltd.', 400, 150)
         .fillColor('#8c8c8c')
         .text('contact@egcn.in', 400, 162)
         .text('+91 22 4567 8901', 400, 174)
         .text('BKC Financial Centre, Mumbai', 400, 186);

      // Table Header
      const tableTop = 250;
      doc.fillColor('#F5F0E8')
         .text('Description', 50, tableTop, { bold: true })
         .text('Qty', 300, tableTop, { align: 'right' })
         .text('Rate', 380, tableTop, { align: 'right' })
         .text('Total', 480, tableTop, { align: 'right' });

      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).strokeColor('#1F1F1F').stroke();

      // Table Row
      const rowTop = tableTop + 25;
      const originalAmountINR = (subscription.amount / 100);
      const beforeTax = (originalAmountINR / 1.18).toFixed(2);
      const gstAmount = (originalAmountINR - beforeTax).toFixed(2);

      doc.fillColor('#F5F0E8')
         .text(`EGCN B2B SaaS Advisory Subscription - ${subscription.plan.toUpperCase()} Plan`, 50, rowTop)
         .text('1', 300, rowTop, { align: 'right' })
         .text(`INR ${beforeTax}`, 380, rowTop, { align: 'right' })
         .text(`INR ${beforeTax}`, 480, rowTop, { align: 'right' });

      doc.moveTo(50, rowTop + 20).lineTo(550, rowTop + 20).strokeColor('#1F1F1F').stroke();

      // Calculation summary
      const summaryTop = rowTop + 40;
      doc.fillColor('#8c8c8c')
         .text('Subtotal (Before Tax):', 350, summaryTop, { align: 'right' })
         .text(`INR ${beforeTax}`, 480, summaryTop, { align: 'right' })
         
         .text('GST (18% included):', 350, summaryTop + 15, { align: 'right' })
         .text(`INR ${gstAmount}`, 480, summaryTop + 15, { align: 'right' });

      doc.moveTo(350, summaryTop + 32).lineTo(550, summaryTop + 32).strokeColor('#1F1F1F').stroke();

      doc.fillColor('#d74339')
         .fontSize(12)
         .text('Total Paid:', 350, summaryTop + 42, { align: 'right', bold: true })
         .text(`INR ${originalAmountINR.toFixed(2)}`, 480, summaryTop + 42, { align: 'right', bold: true });

      // Footer
      doc.fillColor('#8c8c8c')
         .fontSize(8)
         .text('Thank you for choosing EGCN Consulting. This is a computer-generated invoice and requires no signature.', 50, 500, { align: 'center' });

      // Finalize the PDF document
      doc.end();

    } catch (error) {
      console.error('Error generating PDF invoice:', error);
      reject(error);
    }
  });
};
