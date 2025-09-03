const nodemailer = require('nodemailer');
const { formatDate } = require('../utils/helpers');

const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendBudgetApprovalRequest = async (project) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'manager@company.com',
      subject: `專案預算審核請求 - ${project.name}`,
      html: `
        <h2>專案預算審核請求</h2>
        <p><strong>專案名稱:</strong> ${project.name}</p>
        <p><strong>專案編號:</strong> ${project.projectId}</p>
        <p><strong>預算金額:</strong> NT$ ${project.budget.total.toLocaleString()}</p>
        <p><strong>提交日期:</strong> ${formatDate(new Date())}</p>
        <p>請登入系統進行審核。</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('預算審核通知已發送');
  } catch (error) {
    console.error('發送預算審核通知失敗:', error);
  }
};

const sendContractToAccounting = async (project) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'accounting@company.com',
      subject: `新合約已生成 - ${project.name}`,
      html: `
        <h2>新合約通知</h2>
        <p><strong>專案名稱:</strong> ${project.name}</p>
        <p><strong>專案編號:</strong> ${project.projectId}</p>
        <p><strong>合約編號:</strong> ${project.contractNumber}</p>
        <p><strong>合約金額:</strong> NT$ ${project.budget.total.toLocaleString()}</p>
        <p><strong>生成日期:</strong> ${formatDate(new Date())}</p>
        <p>請至系統下載PDF合約文件。</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('合約通知已發送至會計部');
  } catch (error) {
    console.error('發送合約通知失敗:', error);
  }
};

const sendQuotationRequest = async (vendorEmail, quotation, materialAnalysis) => {
  try {
    const materialsList = materialAnalysis.materials.map(item => 
      `<tr>
        <td>${item.material.name}</td>
        <td>${item.quantity}</td>
        <td>${item.material.unit}</td>
        <td>請報價</td>
      </tr>`
    ).join('');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: vendorEmail,
      subject: `詢價邀請 - ${quotation.quotationId}`,
      html: `
        <h2>詢價邀請</h2>
        <p><strong>詢價單號:</strong> ${quotation.quotationId}</p>
        <p><strong>專案:</strong> ${materialAnalysis.project.name}</p>
        <p><strong>報價截止日:</strong> ${formatDate(quotation.validUntil)}</p>
        
        <h3>材料清單:</h3>
        <table border="1" style="border-collapse: collapse; width: 100%;">
          <tr>
            <th>材料名稱</th>
            <th>數量</th>
            <th>單位</th>
            <th>單價</th>
          </tr>
          ${materialsList}
        </table>
        
        <p>請於期限內提交報價。</p>
        <p>回覆請至: <a href="${process.env.FRONTEND_URL}/quotations/${quotation._id}">系統填寫報價</a></p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('詢價邀請已發送');
  } catch (error) {
    console.error('發送詢價邀請失敗:', error);
  }
};

const sendPurchaseOrderToVendor = async (vendorEmail, purchaseOrder) => {
  try {
    const itemsList = purchaseOrder.items.map(item => 
      `<tr>
        <td>${item.material.name}</td>
        <td>${item.quantity}</td>
        <td>${item.material.unit}</td>
        <td>NT$ ${item.unitPrice.toLocaleString()}</td>
        <td>NT$ ${item.totalPrice.toLocaleString()}</td>
        <td>${formatDate(item.deliveryDate)}</td>
      </tr>`
    ).join('');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: vendorEmail,
      subject: `採購訂單確認 - ${purchaseOrder.poNumber}`,
      html: `
        <h2>採購訂單確認</h2>
        <p><strong>採購單號:</strong> ${purchaseOrder.poNumber}</p>
        <p><strong>訂單日期:</strong> ${formatDate(new Date())}</p>
        <p><strong>交貨地址:</strong> ${purchaseOrder.deliveryAddress}</p>
        <p><strong>付款條件:</strong> ${purchaseOrder.paymentTerms}</p>
        
        <h3>訂單明細:</h3>
        <table border="1" style="border-collapse: collapse; width: 100%;">
          <tr>
            <th>材料名稱</th>
            <th>數量</th>
            <th>單位</th>
            <th>單價</th>
            <th>總價</th>
            <th>交期</th>
          </tr>
          ${itemsList}
        </table>
        
        <p><strong>總金額: NT$ ${purchaseOrder.totalAmount.toLocaleString()}</strong></p>
        <p>請確認訂單並按時交貨。</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('採購訂單已發送至廠商');
  } catch (error) {
    console.error('發送採購訂單失敗:', error);
  }
};

const sendProgressUpdateToManagement = async (schedule) => {
  try {
    const completedTasks = schedule.tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = schedule.tasks.filter(t => t.status === 'in_progress').length;
    const delayedTasks = schedule.tasks.filter(t => t.status === 'delayed').length;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'management@company.com',
      subject: `進度更新報告 - ${schedule.project.name}`,
      html: `
        <h2>專案進度更新</h2>
        <p><strong>專案:</strong> ${schedule.project.name}</p>
        <p><strong>整體進度:</strong> ${schedule.overallProgress}%</p>
        <p><strong>已完成任務:</strong> ${completedTasks}/${schedule.tasks.length}</p>
        <p><strong>進行中任務:</strong> ${inProgressTasks}</p>
        <p><strong>延誤任務:</strong> ${delayedTasks}</p>
        <p><strong>更新時間:</strong> ${formatDate(schedule.lastUpdated)}</p>
        
        ${delayedTasks > 0 ? '<p style="color: red;"><strong>注意: 有任務延誤，請關注進度。</strong></p>' : ''}
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('進度更新報告已發送');
  } catch (error) {
    console.error('發送進度更新報告失敗:', error);
  }
};

const sendTaskCompletionNotification = async (task, user) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'management@company.com',
      subject: `任務完成通知 - ${task.name}`,
      html: `
        <h2>任務完成通知</h2>
        <p><strong>任務名稱:</strong> ${task.name}</p>
        <p><strong>完成人:</strong> ${user.username}</p>
        <p><strong>完成時間:</strong> ${formatDate(new Date())}</p>
        <p><strong>備註:</strong> ${task.notes || '無'}</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('任務完成通知已發送');
  } catch (error) {
    console.error('發送任務完成通知失敗:', error);
  }
};

const sendCompletionReportToAccounting = async (project, pdfBuffer) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'accounting@company.com',
      subject: `專案完工報告 - ${project.name}`,
      html: `
        <h2>專案完工報告</h2>
        <p><strong>專案名稱:</strong> ${project.name}</p>
        <p><strong>專案編號:</strong> ${project.projectId}</p>
        <p><strong>完工日期:</strong> ${formatDate(new Date())}</p>
        <p>請查收附件中的完工報告，包含所有傳票和總帳資訊。</p>
      `,
      attachments: [{
        filename: `completion-report-${project.projectId}.pdf`,
        content: pdfBuffer
      }]
    };

    await transporter.sendMail(mailOptions);
    console.log('完工報告已發送至會計部');
  } catch (error) {
    console.error('發送完工報告失敗:', error);
  }
};

module.exports = {
  sendBudgetApprovalRequest,
  sendContractToAccounting,
  sendQuotationRequest,
  sendPurchaseOrderToVendor,
  sendProgressUpdateToManagement,
  sendTaskCompletionNotification,
  sendCompletionReportToAccounting
};