const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { formatDate } = require('../utils/helpers');

const generateProjectDetailReport = async (reportData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.fontSize(20).text('專案詳細報告', 50, 50);
      doc.moveDown();

      doc.fontSize(14);
      doc.text(`專案名稱: ${reportData.project.name}`);
      doc.text(`專案編號: ${reportData.project.projectId}`);
      doc.text(`專案狀態: ${reportData.project.status}`);
      doc.text(`專案經理: ${reportData.project.manager.username}`);
      doc.text(`報告日期: ${formatDate(reportData.generatedAt)}`);
      doc.moveDown();

      doc.fontSize(16).text('財務概況', { underline: true });
      doc.fontSize(12);
      doc.text(`預估成本: NT$ ${reportData.project.estimatedCost?.toLocaleString() || 0}`);
      doc.text(`實際成本: NT$ ${reportData.project.actualCost?.toLocaleString() || 0}`);
      doc.text(`預算總額: NT$ ${reportData.project.budget?.total?.toLocaleString() || 0}`);
      doc.text(`已分配: NT$ ${reportData.project.budget?.allocated?.toLocaleString() || 0}`);
      doc.text(`剩餘預算: NT$ ${reportData.project.budget?.remaining?.toLocaleString() || 0}`);
      doc.moveDown();

      if (reportData.purchaseOrders.length > 0) {
        doc.fontSize(16).text('採購訂單', { underline: true });
        doc.fontSize(10);
        
        reportData.purchaseOrders.forEach((po, index) => {
          doc.text(`${index + 1}. 採購單號: ${po.poNumber}`);
          doc.text(`   廠商: ${po.vendor.name}`);
          doc.text(`   金額: NT$ ${po.totalAmount.toLocaleString()}`);
          doc.text(`   狀態: ${po.status}`);
          doc.text(`   日期: ${formatDate(po.createdAt)}`);
          doc.moveDown(0.5);
        });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

const generateCompletionReport = async (reportData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.fontSize(20).text('專案完工報告', 50, 50);
      doc.moveDown();

      doc.fontSize(14);
      doc.text(`專案名稱: ${reportData.project.name}`);
      doc.text(`專案編號: ${reportData.project.projectId}`);
      doc.text(`完工日期: ${formatDate(reportData.project.completedAt)}`);
      doc.text(`專案工期: ${reportData.project.duration} 天`);
      doc.moveDown();

      doc.fontSize(16).text('財務總結', { underline: true });
      doc.fontSize(12);
      doc.text(`最終成本: NT$ ${reportData.financial.finalCost.toLocaleString()}`);
      doc.text(`預算差異: NT$ ${reportData.financial.budgetVariance.toLocaleString()}`);
      doc.text(`預算使用率: ${reportData.financial.budgetUtilization.toFixed(2)}%`);
      doc.moveDown();

      doc.fontSize(16).text('採購概況', { underline: true });
      doc.fontSize(12);
      doc.text(`採購訂單總數: ${reportData.procurement.totalPurchaseOrders}`);
      doc.text(`採購總金額: NT$ ${reportData.procurement.totalProcurementValue.toLocaleString()}`);
      doc.moveDown();

      if (reportData.accounting.ledgerEntries.length > 0) {
        doc.fontSize(16).text('會計總帳', { underline: true });
        doc.fontSize(8);
        
        doc.text('日期         傳票號碼      科目          借方          貸方          說明');
        doc.text('─'.repeat(100));
        
        reportData.accounting.ledgerEntries.forEach(entry => {
          const date = formatDate(entry.date, 'MM/DD');
          const voucher = entry.voucherNumber.substring(0, 12);
          const account = entry.account.substring(0, 8);
          const debit = entry.debit > 0 ? entry.debit.toLocaleString().padStart(10) : ''.padStart(10);
          const credit = entry.credit > 0 ? entry.credit.toLocaleString().padStart(10) : ''.padStart(10);
          const desc = entry.description.substring(0, 20);
          
          doc.text(`${date}  ${voucher}  ${account}  ${debit}  ${credit}  ${desc}`);
        });
        
        doc.moveDown();
        doc.text(`借方總計: NT$ ${reportData.accounting.totalDebit.toLocaleString()}`);
        doc.text(`貸方總計: NT$ ${reportData.accounting.totalCredit.toLocaleString()}`);
        doc.text(`平衡狀態: ${reportData.accounting.isBalanced ? '平衡' : '不平衡'}`);
      }

      doc.moveDown();
      doc.fontSize(10);
      doc.text(`報告生成時間: ${formatDate(reportData.generatedAt)}`);
      doc.text(`報告生成者: ${reportData.generatedBy}`);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

const generatePurchaseOrder = async (purchaseOrder) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.fontSize(20).text('採購訂單', 50, 50);
      doc.moveDown();

      doc.fontSize(12);
      doc.text(`採購單號: ${purchaseOrder.poNumber}`);
      doc.text(`訂單日期: ${formatDate(purchaseOrder.createdAt)}`);
      doc.text(`廠商: ${purchaseOrder.vendor.name}`);
      doc.text(`專案: ${purchaseOrder.project.name}`);
      doc.moveDown();

      doc.text('採購明細:', { underline: true });
      doc.moveDown();

      purchaseOrder.items.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.material.name}`);
        doc.text(`   數量: ${item.quantity} ${item.material.unit}`);
        doc.text(`   單價: NT$ ${item.unitPrice.toLocaleString()}`);
        doc.text(`   小計: NT$ ${item.totalPrice.toLocaleString()}`);
        doc.text(`   交期: ${formatDate(item.deliveryDate)}`);
        doc.moveDown(0.5);
      });

      doc.fontSize(14);
      doc.text(`總金額: NT$ ${purchaseOrder.totalAmount.toLocaleString()}`, { align: 'right' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

const generateMaterialAnalysis = async (materialAnalysis) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.fontSize(20).text('工料分析表', 50, 50);
      doc.moveDown();

      doc.fontSize(12);
      doc.text(`專案: ${materialAnalysis.project.name}`);
      doc.text(`生成來源: ${materialAnalysis.generatedFrom}`);
      doc.text(`生成日期: ${formatDate(materialAnalysis.createdAt)}`);
      doc.moveDown();

      doc.text('材料清單:', { underline: true });
      doc.moveDown();

      materialAnalysis.materials.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.material.name}`);
        doc.text(`   類別: ${item.material.category}`);
        doc.text(`   數量: ${item.quantity} ${item.material.unit}`);
        doc.text(`   預估單價: NT$ ${(item.estimatedPrice / item.quantity).toLocaleString()}`);
        doc.text(`   預估總價: NT$ ${item.estimatedPrice.toLocaleString()}`);
        if (item.notes) doc.text(`   備註: ${item.notes}`);
        doc.moveDown(0.5);
      });

      doc.fontSize(14);
      doc.text(`預估總成本: NT$ ${materialAnalysis.totalEstimatedCost.toLocaleString()}`, { align: 'right' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateProjectDetailReport,
  generateCompletionReport,
  generatePurchaseOrder,
  generateMaterialAnalysis
};