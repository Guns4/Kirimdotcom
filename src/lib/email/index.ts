// ============================================
// RESEND EMAIL SERVICE
// ============================================
// Integration with Resend.com for sending emails

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = 'CekKirim <notifikasi@cekkirim.com>';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<EmailResult> {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Failed to send email' };
    }

    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Resend error:', error);
    return { success: false, error: 'Email service error' };
  }
}

// ============================================
// EMAIL TEMPLATES
// ============================================

export function generateTrackingUpdateEmail(params: {
  resi: string;
  courierCode: string;
  oldStatus: string;
  newStatus: string;
  statusDescription?: string;
  trackingUrl?: string;
}): string {
  const {
    resi,
    courierCode,
    oldStatus,
    newStatus,
    statusDescription,
    trackingUrl,
  } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Update Tracking Paket</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #1e293b;">
    <!-- Header -->
    <tr>
      <td style="padding: 30px; text-align: center; background: linear-gradient(135deg, #6366f1, #8b5cf6);">
        <h1 style="color: white; margin: 0; font-size: 24px;">📦 CekKirim</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0;">Notifikasi Update Paket</p>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 30px;">
        <h2 style="color: white; margin: 0 0 20px 0;">Halo!</h2>
        <p style="color: #94a3b8; margin: 0 0 20px 0; line-height: 1.6;">
          Paket Anda dengan nomor resi <strong style="color: white;">${resi}</strong> 
          telah bergerak ke status baru.
        </p>
        
        <!-- Status Change Box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 12px; margin: 20px 0;">
          <tr>
            <td style="padding: 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width: 45%; text-align: center; padding: 10px;">
                    <p style="color: #64748b; font-size: 12px; margin: 0 0 5px 0;">Status Sebelumnya</p>
                    <p style="color: #f59e0b; font-size: 14px; font-weight: bold; margin: 0;">${oldStatus}</p>
                  </td>
                  <td style="width: 10%; text-align: center;">
                    <span style="color: #6366f1; font-size: 24px;">→</span>
                  </td>
                  <td style="width: 45%; text-align: center; padding: 10px;">
                    <p style="color: #64748b; font-size: 12px; margin: 0 0 5px 0;">Status Sekarang</p>
                    <p style="color: #22c55e; font-size: 14px; font-weight: bold; margin: 0;">${newStatus}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        ${
          statusDescription
            ? `
        <p style="color: #94a3b8; margin: 20px 0; line-height: 1.6;">
          <strong style="color: white;">Detail:</strong> ${statusDescription}
        </p>
        `
            : ''
        }
        
        <!-- Courier Badge -->
        <p style="color: #64748b; margin: 20px 0 10px 0; font-size: 12px;">
          Kurir: <span style="color: white; text-transform: uppercase;">${courierCode}</span>
        </p>
        
        <!-- CTA Button -->
        <table cellpadding="0" cellspacing="0" style="margin: 30px 0;">
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 8px;">
              <a href="${trackingUrl || 'https://www.cekkirim.com'}" 
                 style="display: inline-block; padding: 12px 24px; color: white; text-decoration: none; font-weight: bold;">
                🔍 Lihat Detail Tracking
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="padding: 20px 30px; border-top: 1px solid #334155; text-align: center;">
        <p style="color: #64748b; font-size: 12px; margin: 0 0 10px 0;">
          Email ini dikirim otomatis oleh CekKirim
        </p>
        <p style="color: #475569; font-size: 11px; margin: 0;">
          <a href="https://www.cekkirim.com" style="color: #6366f1;">www.cekkirim.com</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

export function generateDeliveredEmail(params: {
  resi: string;
  courierCode: string;
  receiverName?: string;
}): string {
  const { resi, courierCode, receiverName } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Paket Terkirim!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #1e293b;">
    <!-- Header -->
    <tr>
      <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, #22c55e, #10b981);">
        <div style="font-size: 60px; margin-bottom: 10px;">🎉</div>
        <h1 style="color: white; margin: 0; font-size: 28px;">Paket Terkirim!</h1>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding: 30px; text-align: center;">
        <p style="color: #94a3b8; margin: 0 0 20px 0; line-height: 1.6; font-size: 16px;">
          Kabar baik! Paket dengan nomor resi
        </p>
        
        <div style="background-color: #0f172a; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="color: white; font-family: monospace; font-size: 18px; margin: 0; letter-spacing: 1px;">
            ${resi}
          </p>
        </div>
        
        <p style="color: #22c55e; font-size: 18px; font-weight: bold; margin: 20px 0;">
          ✅ Telah Diterima${receiverName ? ` oleh ${receiverName}` : ''}
        </p>
        
        <p style="color: #64748b; margin: 20px 0; font-size: 14px;">
          Kurir: <span style="color: white; text-transform: uppercase;">${courierCode}</span>
        </p>
        
        <p style="color: #94a3b8; margin: 20px 0; line-height: 1.6;">
          Anda tidak akan menerima notifikasi lagi untuk resi ini.
        </p>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="padding: 20px 30px; border-top: 1px solid #334155; text-align: center;">
        <p style="color: #64748b; font-size: 12px; margin: 0 0 10px 0;">
          Terima kasih telah menggunakan CekKirim
        </p>
        <p style="color: #475569; font-size: 11px; margin: 0;">
          <a href="https://www.cekkirim.com" style="color: #6366f1;">www.cekkirim.com</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}
