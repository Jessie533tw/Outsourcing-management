const Voucher = require('../models/Voucher');
const { generateVoucherNumber } = require('../utils/helpers');

const createPurchaseVoucher = async (purchaseOrder, userId) => {
  try {
    const voucherNumber = generateVoucherNumber();
    
    const voucher = new Voucher({
      voucherNumber,
      project: purchaseOrder.project,
      type: 'material_purchase',
      description: `採購單 ${purchaseOrder.poNumber} - 材料採購`,
      amount: purchaseOrder.totalAmount,
      vendor: purchaseOrder.vendor,
      purchaseOrder: purchaseOrder._id,
      accountingEntry: {
        debit: [{
          account: '材料成本',
          amount: purchaseOrder.totalAmount
        }],
        credit: [{
          account: '應付帳款',
          amount: purchaseOrder.totalAmount
        }]
      },
      status: 'approved',
      createdBy: userId,
      approvedBy: userId
    });

    await voucher.save();
    console.log(`傳票 ${voucherNumber} 已自動生成`);
    return voucher;
  } catch (error) {
    console.error('生成採購傳票失敗:', error);
    throw error;
  }
};

const createServicePaymentVoucher = async (amount, description, vendor, project, userId) => {
  try {
    const voucherNumber = generateVoucherNumber();
    
    const voucher = new Voucher({
      voucherNumber,
      project,
      type: 'service_payment',
      description,
      amount,
      vendor,
      accountingEntry: {
        debit: [{
          account: '服務費用',
          amount
        }],
        credit: [{
          account: '銀行存款',
          amount
        }]
      },
      status: 'draft',
      createdBy: userId
    });

    await voucher.save();
    console.log(`服務付款傳票 ${voucherNumber} 已生成`);
    return voucher;
  } catch (error) {
    console.error('生成服務付款傳票失敗:', error);
    throw error;
  }
};

const createExpenseVoucher = async (amount, description, project, userId) => {
  try {
    const voucherNumber = generateVoucherNumber();
    
    const voucher = new Voucher({
      voucherNumber,
      project,
      type: 'expense',
      description,
      amount,
      accountingEntry: {
        debit: [{
          account: '專案費用',
          amount
        }],
        credit: [{
          account: '現金',
          amount
        }]
      },
      status: 'draft',
      createdBy: userId
    });

    await voucher.save();
    console.log(`費用傳票 ${voucherNumber} 已生成`);
    return voucher;
  } catch (error) {
    console.error('生成費用傳票失敗:', error);
    throw error;
  }
};

const approveVoucher = async (voucherId, approverId) => {
  try {
    const voucher = await Voucher.findByIdAndUpdate(
      voucherId,
      {
        status: 'approved',
        approvedBy: approverId
      },
      { new: true }
    );

    if (!voucher) {
      throw new Error('傳票不存在');
    }

    console.log(`傳票 ${voucher.voucherNumber} 已核准`);
    return voucher;
  } catch (error) {
    console.error('核准傳票失敗:', error);
    throw error;
  }
};

const processVoucher = async (voucherId) => {
  try {
    const voucher = await Voucher.findByIdAndUpdate(
      voucherId,
      { status: 'processed' },
      { new: true }
    );

    if (!voucher) {
      throw new Error('傳票不存在');
    }

    console.log(`傳票 ${voucher.voucherNumber} 已處理`);
    return voucher;
  } catch (error) {
    console.error('處理傳票失敗:', error);
    throw error;
  }
};

const getProjectVouchers = async (projectId) => {
  try {
    const vouchers = await Voucher.find({ project: projectId })
      .populate('vendor', 'name')
      .populate('createdBy', 'username')
      .populate('approvedBy', 'username')
      .sort({ createdAt: -1 });

    return vouchers;
  } catch (error) {
    console.error('獲取專案傳票失敗:', error);
    throw error;
  }
};

const generateLedgerReport = async (projectId) => {
  try {
    const vouchers = await Voucher.find({ 
      project: projectId,
      status: { $in: ['approved', 'processed'] }
    }).sort({ createdAt: 1 });

    const ledgerEntries = [];
    let totalDebit = 0;
    let totalCredit = 0;

    vouchers.forEach(voucher => {
      voucher.accountingEntry.debit.forEach(entry => {
        ledgerEntries.push({
          date: voucher.createdAt,
          voucherNumber: voucher.voucherNumber,
          account: entry.account,
          debit: entry.amount,
          credit: 0,
          description: voucher.description
        });
        totalDebit += entry.amount;
      });

      voucher.accountingEntry.credit.forEach(entry => {
        ledgerEntries.push({
          date: voucher.createdAt,
          voucherNumber: voucher.voucherNumber,
          account: entry.account,
          debit: 0,
          credit: entry.amount,
          description: voucher.description
        });
        totalCredit += entry.amount;
      });
    });

    return {
      entries: ledgerEntries,
      summary: {
        totalDebit,
        totalCredit,
        isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
        totalVouchers: vouchers.length
      }
    };
  } catch (error) {
    console.error('生成總帳報告失敗:', error);
    throw error;
  }
};

module.exports = {
  createPurchaseVoucher,
  createServicePaymentVoucher,
  createExpenseVoucher,
  approveVoucher,
  processVoucher,
  getProjectVouchers,
  generateLedgerReport
};