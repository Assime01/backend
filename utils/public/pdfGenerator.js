const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoicePDF = (payment, order, user) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const fileName = `facture-${order._id}.pdf`;
    const filePath = path.join(__dirname, '..', 'invoices', fileName);

    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(20).text('Facture de paiement', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Client : ${user.name} (${user.email})`);
    doc.text(`Date de paiement : ${payment.paymentDate}`);
    doc.text(`Méthode de paiement : ${payment.paymentMethod}`);
    doc.text(`Montant payé : ${payment.amount} FCFA`);
    doc.text(`Statut : ${payment.status}`);
    doc.text(`Commande N° : ${order._id}`);

    doc.end();

    doc.on('finish', () => resolve(filePath));
    doc.on('error', reject);
  });
};

module.exports = generateInvoicePDF;
