/**
 * EGCN Email Templates — Premium Design System v2
 * Inspired by: Stravia, Cognitive.inc, NotiFy, WimWan, Peter Parker,
 *              Dripcloud, Flowly, Investour, KelpBox, Hostverb reference templates
 * Rules: table-based layout, inline styles, email-client-safe HTML
 */

const DASHBOARD_URL = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`;
const WEBSITE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const SUPPORT_EMAIL = 'support@egcn.in';
const YEAR = new Date().getFullYear();
const LOGO_URL = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/EGC-Logo.png`;

/* ─────────────────────────────────────────────────────────
   SHARED: Logo mark (table-safe, no external image dependency)
───────────────────────────────────────────────────────── */
const LOGO = () => `
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="background:#0a0a0a;padding:24px 40px;text-align:center;border-bottom:3px solid #d74339;">
      <table cellpadding="0" cellspacing="0" border="0" align="center">
        <tr>
          <td>
            <img src="${LOGO_URL}" alt="EGC Network Logo" width="80" height="40" style="display:block;margin:0 auto;width:80px;height:40px;border:none;outline:none;text-decoration:none;" />
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

/* ─────────────────────────────────────────────────────────
   SHARED: Footer
───────────────────────────────────────────────────────── */
const FOOTER = () => `
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="background:#111111;padding:40px;text-align:center;border-top:1px solid #1e1e1e;">
      <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:20px;">
        <tr>
          <td>
            <img src="${LOGO_URL}" alt="EGC Network Logo" width="60" height="30" style="display:block;margin:0 auto;width:60px;height:30px;border:none;outline:none;text-decoration:none;" />
          </td>
        </tr>
      </table>
      <p style="margin:0 0 16px 0;font-size:13px;font-family:Inter,-apple-system,'Helvetica Neue',Arial,sans-serif;">
        <a href="${DASHBOARD_URL}" style="color:#d74339;text-decoration:none;font-weight:600;margin:0 10px;">Dashboard</a>
        <a href="mailto:${SUPPORT_EMAIL}" style="color:#d74339;text-decoration:none;font-weight:600;margin:0 10px;">Support</a>
        <a href="${WEBSITE_URL}" style="color:#d74339;text-decoration:none;font-weight:600;margin:0 10px;">Website</a>
      </p>
      <p style="margin:0 0 10px 0;font-size:12px;color:#333333;line-height:1.6;font-family:Inter,-apple-system,'Helvetica Neue',Arial,sans-serif;">You're receiving this because you're registered with EGC Network.</p>
      <p style="margin:0 0 16px 0;font-size:12px;font-family:Inter,-apple-system,'Helvetica Neue',Arial,sans-serif;">
        <a href="#" style="color:#555555;text-decoration:underline;">Unsubscribe</a>
        <span style="color:#222222;margin:0 6px;">•</span>
        <a href="#" style="color:#555555;text-decoration:underline;">Privacy Policy</a>
      </p>
      <p style="margin:0;font-size:11px;color:#2a2a2a;font-family:Inter,-apple-system,'Helvetica Neue',Arial,sans-serif;">© ${YEAR} EGC Network. All rights reserved. Mumbai, India.</p>
    </td>
  </tr>
</table>`;

/* ─────────────────────────────────────────────────────────
   WRAPPER SHELL
───────────────────────────────────────────────────────── */
const wrap = (title, body) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${title}</title>
  <!--[if mso]><style>* { font-family: Arial, sans-serif !important; }</style><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#1a1a1a;font-family:Inter,-apple-system,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1a1a1a;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,0.8);">
          ${LOGO()}
          ${body}
          ${FOOTER()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;


/* ══════════════════════════════════════════════════════════════
   1.  OTP / EMAIL VERIFICATION
   Visual: Stravia-inspired — split two-column hero, monospace OTP box
══════════════════════════════════════════════════════════════ */
export const getVerificationEmailTemplate = (otp) => wrap('Verify Your Identity — EGC Network', `
  <!-- HERO: Premium elegant centered -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:#ffffff;padding:56px 40px 0 40px;text-align:center;">
        <div style="width:72px;height:72px;background:#fef5f4;border-radius:50%;margin:0 auto 20px auto;text-align:center;line-height:72px;font-size:32px;color:#d74339;border:1px solid #ffe8e6;">🛡️</div>
        <h1 style="margin:0 0 12px 0;font-size:32px;font-weight:900;color:#0a0a0a;line-height:1.15;letter-spacing:-1px;font-family:Inter,-apple-system,Arial,sans-serif;">Secure Verification</h1>
        <p style="margin:0 0 32px 0;font-size:15px;line-height:1.7;color:#555555;font-family:Inter,-apple-system,Arial,sans-serif;">Please use the following one-time password to verify your identity.</p>
      </td>
    </tr>
  </table>

  <!-- BODY: OTP Box -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:#ffffff;padding:0 40px 48px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 32px 0;">
          <tr>
            <td style="background:#fef5f4;border-radius:12px;padding:36px 24px;text-align:center;border:1px solid #ffe8e6;">
              <p style="margin:0 0 8px 0;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#d74339;font-family:Inter,-apple-system,Arial,sans-serif;">YOUR SECURITY CODE</p>
              <p style="margin:0;font-size:48px;font-weight:900;color:#d74339;letter-spacing:12px;font-family:'Courier New',Courier,monospace;line-height:1;">${otp}</p>
            </td>
          </tr>
        </table>
        <p style="margin:0 0 14px 0;font-size:14px;line-height:1.8;color:#777777;text-align:center;font-family:Inter,-apple-system,Arial,sans-serif;">This code is valid for the next <strong style="color:#0a0a0a;">10 minutes</strong>.</p>
        <p style="margin:0;font-size:14px;line-height:1.8;color:#777777;text-align:center;font-family:Inter,-apple-system,Arial,sans-serif;">If you didn't request this, please contact our <a href="mailto:${SUPPORT_EMAIL}" style="color:#d74339;font-weight:600;text-decoration:none;">support team</a> immediately.</p>
      </td>
    </tr>
  </table>
`);


/* ══════════════════════════════════════════════════════════════
   2.  PASSWORD RESET
   Visual: Cognitive.inc-inspired — dark concentric-circle hero,
           icon bleeding from hero, full-width outlined button
══════════════════════════════════════════════════════════════ */
export const getPasswordResetEmailTemplate = (resetUrl) => wrap('Reset Your Password — EGC Network', `
  <!-- HERO: Clean white, key icon -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:#ffffff;padding:56px 40px 24px 40px;text-align:center;">
        <div style="width:72px;height:72px;background:#fef5f4;border-radius:50%;margin:0 auto 20px auto;text-align:center;line-height:72px;font-size:32px;border:1px solid #ffe8e6;">🔑</div>
        <h1 style="margin:0 0 12px 0;font-size:32px;font-weight:900;color:#0a0a0a;letter-spacing:-1px;line-height:1.15;font-family:Inter,-apple-system,Arial,sans-serif;">Reset Password</h1>
        <p style="margin:0;font-size:15px;line-height:1.8;color:#555555;font-family:Inter,-apple-system,Arial,sans-serif;">We received a request to reset the password for your EGC Network account.</p>
      </td>
    </tr>
  </table>

  <!-- BODY & CTA -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:#ffffff;padding:0 40px 56px 40px;text-align:center;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 32px 0;">
          <tr>
            <td style="text-align:center;">
              <a href="${resetUrl}" style="display:inline-block;background:#d74339;color:#ffffff;text-align:center;padding:16px 36px;font-size:14px;font-weight:800;letter-spacing:1px;text-transform:uppercase;text-decoration:none;border-radius:8px;font-family:Inter,-apple-system,Arial,sans-serif;">Reset My Password</a>
            </td>
          </tr>
        </table>
        <p style="margin:0 0 8px 0;font-size:14px;line-height:1.7;color:#666666;font-family:Inter,-apple-system,Arial,sans-serif;">This link will expire in <strong style="color:#0a0a0a;">1 hour</strong>.</p>
        <p style="margin:0;font-size:14px;line-height:1.7;color:#666666;font-family:Inter,-apple-system,Arial,sans-serif;">If you didn't request a password reset, you can safely ignore this email.</p>
      </td>
    </tr>
  </table>
`);


/* ══════════════════════════════════════════════════════════════
   3.  DAILY ENTRY REMINDER  (6 PM cron)
   Visual: NotiFy-inspired — full dark, checklist, split app card
══════════════════════════════════════════════════════════════ */
export const getDailyReminderEmailTemplate = (name, url) => wrap('Daily Entry Reminder — EGC Network', `

  <!-- HERO: Full dark with radial glow -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:#0a0a0a;padding:52px 40px 44px 40px;">
        <p style="margin:0 0 14px 0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#d74339;font-family:Inter,-apple-system,Arial,sans-serif;">DAILY REMINDER</p>
        <h1 style="margin:0 0 14px 0;font-size:36px;font-weight:900;color:#ffffff;letter-spacing:-1.5px;line-height:1.1;font-family:Inter,-apple-system,Arial,sans-serif;">Don't break<br/>your streak.</h1>
        <p style="margin:0 0 28px 0;font-size:14px;color:rgba(255,255,255,0.5);line-height:1.6;font-family:Inter,-apple-system,Arial,sans-serif;">Hi ${name}, keep building your financial momentum — your daily entry is waiting.</p>
        <a href="${url}" style="display:inline-block;border:1.5px solid rgba(255,255,255,0.2);border-radius:100px;padding:12px 28px;font-size:13px;font-weight:600;color:#ffffff;text-decoration:none;font-family:Inter,-apple-system,Arial,sans-serif;">Log Today's Entry →</a>
      </td>
    </tr>
  </table>

  <!-- Dark content with checklist — NotiFy "you're not taking advantage" section -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:#0f0f0f;padding:32px 40px;">
        <h2 style="margin:0 0 20px 0;font-size:18px;font-weight:800;color:#ffffff;line-height:1.4;font-family:Inter,-apple-system,Arial,sans-serif;">You're leaving value on the table:</h2>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding:14px 0;border-bottom:1px solid #1e1e1e;">
              <table cellpadding="0" cellspacing="0" border="0"><tr>
                <td style="width:24px;height:24px;background:#d74339;border-radius:50%;text-align:center;vertical-align:middle;font-size:12px;color:#ffffff;line-height:24px;font-family:Arial,sans-serif;">✓</td>
                <td style="padding-left:14px;font-size:14px;color:#aaaaaa;line-height:1.6;font-family:Inter,-apple-system,Arial,sans-serif;">Without daily entries, your analytics stay inaccurate and advisors can't help you effectively.</td>
              </tr></table>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 0;border-bottom:1px solid #1e1e1e;">
              <table cellpadding="0" cellspacing="0" border="0"><tr>
                <td style="width:24px;height:24px;background:#d74339;border-radius:50%;text-align:center;vertical-align:middle;font-size:12px;color:#ffffff;line-height:24px;font-family:Arial,sans-serif;">✓</td>
                <td style="padding-left:14px;font-size:14px;color:#aaaaaa;line-height:1.6;font-family:Inter,-apple-system,Arial,sans-serif;">Missing entries break your streak and disrupt your month-end performance report.</td>
              </tr></table>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 0;">
              <table cellpadding="0" cellspacing="0" border="0"><tr>
                <td style="width:24px;height:24px;background:#d74339;border-radius:50%;text-align:center;vertical-align:middle;font-size:12px;color:#ffffff;line-height:24px;font-family:Arial,sans-serif;">✓</td>
                <td style="padding-left:14px;font-size:14px;color:#aaaaaa;line-height:1.6;font-family:Inter,-apple-system,Arial,sans-serif;">Users who log daily see <strong style="color:#ffffff;">3× better target accuracy</strong> and more actionable expert advice.</td>
              </tr></table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- Split app card + CTA -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td width="42%" style="background:#111111;padding:28px 16px 28px 40px;vertical-align:middle;">
        <!-- Fake app card UI -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1a1a1a;border-radius:12px;border:1px solid #2a2a2a;">
          <tr><td style="padding:16px;">
            <p style="margin:0 0 4px 0;font-size:10px;color:#666666;text-transform:uppercase;letter-spacing:1px;font-family:Inter,-apple-system,Arial,sans-serif;">Today's Entry</p>
            <p style="margin:0 0 10px 0;font-size:20px;font-weight:800;color:#d74339;font-family:Inter,-apple-system,Arial,sans-serif;">₹ — —</p>
            <div style="background:#222222;border-radius:6px;height:6px;margin-bottom:8px;overflow:hidden;">
              <div style="background:#d74339;width:0%;height:100%;border-radius:6px;"></div>
            </div>
            <p style="margin:0;font-size:10px;color:#444444;font-family:Inter,-apple-system,Arial,sans-serif;">Not logged yet today</p>
          </td></tr>
        </table>
      </td>
      <td width="58%" style="background:#111111;padding:28px 40px 28px 20px;vertical-align:middle;">
        <h3 style="margin:0 0 8px 0;font-size:18px;font-weight:800;color:#ffffff;line-height:1.3;font-family:Inter,-apple-system,Arial,sans-serif;">Log in under <span style="color:#d74339;">60 seconds.</span></h3>
        <p style="margin:0 0 16px 0;font-size:13px;color:#666666;line-height:1.6;font-family:Inter,-apple-system,Arial,sans-serif;">Just your daily bills and sales. That's it.</p>
        <a href="${url}" style="display:inline-block;background:#d74339;color:#ffffff;font-size:13px;font-weight:700;padding:12px 22px;border-radius:8px;text-decoration:none;font-family:Inter,-apple-system,Arial,sans-serif;">Log Now →</a>
      </td>
    </tr>
  </table>

  <!-- Closing motivational dark section -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:#0a0a0a;padding:36px 40px;">
        <h2 style="margin:0 0 14px 0;font-size:22px;font-weight:900;color:#ffffff;line-height:1.3;font-family:Inter,-apple-system,Arial,sans-serif;">Do something today your<br/>future self will thank you for.</h2>
        <p style="margin:0;font-size:13px;color:#333333;font-family:Inter,-apple-system,Arial,sans-serif;">EGC Network · ${SUPPORT_EMAIL}</p>
      </td>
    </tr>
  </table>
`);


/* ══════════════════════════════════════════════════════════════
   4.  TARGET ACHIEVEMENT
   Visual: WimWan stripe bands + Investour 2×2 colored stat grid
══════════════════════════════════════════════════════════════ */
export const getTargetAchievementEmailTemplate = (name, percentage) => wrap('Amazing Progress! — EGC Network', `

  <!-- HERO: Black with diagonal stripe bands -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:#0a0a0a;padding:48px 40px 0 40px;text-align:center;">
        <div style="background:repeating-linear-gradient(45deg,#d74339,#d74339 3px,transparent 3px,transparent 18px);height:8px;border-radius:4px;margin-bottom:28px;"></div>
        <p style="margin:0 0 6px 0;font-size:11px;font-weight:700;letter-spacing:3px;color:#d74339;text-transform:uppercase;font-family:Inter,-apple-system,Arial,sans-serif;">Milestone Reached 🎉</p>
        <h1 style="margin:0 0 14px 0;font-size:40px;font-weight:900;color:#ffffff;letter-spacing:-2px;line-height:1.05;font-family:Inter,-apple-system,Arial,sans-serif;">You've hit<br/><span style="color:#d74339;">${percentage}%</span> of your<br/>monthly target!</h1>
        <div style="background:repeating-linear-gradient(45deg,#d74339,#d74339 3px,transparent 3px,transparent 18px);height:8px;border-radius:4px;margin-bottom:0;"></div>
      </td>
    </tr>
  </table>

  <!-- Stats strip — WimWan 3-column split -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td width="33%" style="background:#d74339;padding:24px 16px;text-align:center;">
        <p style="margin:0;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-1px;font-family:Inter,-apple-system,Arial,sans-serif;">${percentage}%</p>
        <p style="margin:4px 0 0 0;font-size:11px;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:1px;font-family:Inter,-apple-system,Arial,sans-serif;">Completed</p>
      </td>
      <td width="33%" style="background:#111111;padding:24px 16px;text-align:center;border-left:1px solid #1e1e1e;border-right:1px solid #1e1e1e;">
        <p style="margin:0;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-1px;font-family:Inter,-apple-system,Arial,sans-serif;">23</p>
        <p style="margin:4px 0 0 0;font-size:11px;color:#555555;text-transform:uppercase;letter-spacing:1px;font-family:Inter,-apple-system,Arial,sans-serif;">Days Left</p>
      </td>
      <td width="34%" style="background:#111111;padding:24px 16px;text-align:center;">
        <p style="margin:0;font-size:28px;font-weight:900;color:#d74339;letter-spacing:-1px;font-family:Inter,-apple-system,Arial,sans-serif;">↑18%</p>
        <p style="margin:4px 0 0 0;font-size:11px;color:#555555;text-transform:uppercase;letter-spacing:1px;font-family:Inter,-apple-system,Arial,sans-serif;">vs Last Month</p>
      </td>
    </tr>
  </table>

  <!-- White body with progress bar + 2×2 stats grid -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:#ffffff;padding:44px 40px;">
        <p style="margin:0 0 6px 0;font-size:16px;font-weight:700;color:#0a0a0a;font-family:Inter,-apple-system,Arial,sans-serif;">Congratulations ${name}! 🚀</p>
        <p style="margin:0 0 24px 0;font-size:15px;line-height:1.8;color:#555555;font-family:Inter,-apple-system,Arial,sans-serif;">You've crossed <strong style="color:#d74339;">${percentage}%</strong> of your monthly target. That's exceptional performance. Your Expert Advisor has been notified and is preparing personalized insights for you.</p>

        <!-- Progress bar -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px 0;">
          <tr>
            <td style="font-size:13px;font-weight:600;color:#0a0a0a;font-family:Inter,-apple-system,Arial,sans-serif;">Monthly Progress</td>
            <td style="font-size:13px;font-weight:800;color:#d74339;text-align:right;font-family:Inter,-apple-system,Arial,sans-serif;">${percentage} / 100%</td>
          </tr>
        </table>
        <div style="background:#f0f0f0;border-radius:100px;height:12px;overflow:hidden;margin-bottom:28px;">
          <div style="background:linear-gradient(90deg,#d74339,#ff6b5b);width:${percentage}%;height:100%;border-radius:100px;"></div>
        </div>

        <!-- Investour-style 2×2 colored stat grid -->
        <p style="margin:0 0 14px 0;font-size:12px;font-weight:700;color:#0a0a0a;text-transform:uppercase;letter-spacing:1px;font-family:Inter,-apple-system,Arial,sans-serif;">Your Numbers</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="48%" style="background:#fff5f5;border-radius:10px;padding:20px;vertical-align:top;">
              <p style="margin:0 0 4px 0;font-size:26px;font-weight:900;color:#d74339;letter-spacing:-1px;font-family:Inter,-apple-system,Arial,sans-serif;">₹1.87L</p>
              <p style="margin:0;font-size:12px;color:#888888;font-family:Inter,-apple-system,Arial,sans-serif;">Revenue This Month</p>
            </td>
            <td width="4%"></td>
            <td width="48%" style="background:#f5f9ff;border-radius:10px;padding:20px;vertical-align:top;">
              <p style="margin:0 0 4px 0;font-size:26px;font-weight:900;color:#3d7de8;letter-spacing:-1px;font-family:Inter,-apple-system,Arial,sans-serif;">142</p>
              <p style="margin:0;font-size:12px;color:#888888;font-family:Inter,-apple-system,Arial,sans-serif;">Transactions</p>
            </td>
          </tr>
          <tr><td colspan="3" style="padding-top:10px;"></td></tr>
          <tr>
            <td width="48%" style="background:#f5fff8;border-radius:10px;padding:20px;vertical-align:top;">
              <p style="margin:0 0 4px 0;font-size:26px;font-weight:900;color:#22c55e;letter-spacing:-1px;font-family:Inter,-apple-system,Arial,sans-serif;">↑18%</p>
              <p style="margin:0;font-size:12px;color:#888888;font-family:Inter,-apple-system,Arial,sans-serif;">vs Last Month</p>
            </td>
            <td width="4%"></td>
            <td width="48%" style="background:#fffaf5;border-radius:10px;padding:20px;vertical-align:top;">
              <p style="margin:0 0 4px 0;font-size:26px;font-weight:900;color:#f59e0b;letter-spacing:-1px;font-family:Inter,-apple-system,Arial,sans-serif;">7</p>
              <p style="margin:0;font-size:12px;color:#888888;font-family:Inter,-apple-system,Arial,sans-serif;">Days of Streak</p>
            </td>
          </tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
          <tr>
            <td style="text-align:center;">
              <a href="${DASHBOARD_URL}" style="display:inline-block;background:#d74339;color:#ffffff;padding:16px 44px;border-radius:100px;font-size:14px;font-weight:700;text-decoration:none;font-family:Inter,-apple-system,Arial,sans-serif;">See New Insights →</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- WimWan-style closing editorial band -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:#0a0a0a;padding:44px 40px;text-align:center;">
        <p style="margin:0 0 10px 0;font-size:20px;font-weight:900;color:#ffffff;line-height:1.4;font-family:Inter,-apple-system,Arial,sans-serif;">This is where <span style="color:#d74339;">discipline meets</span><br/>results — and every entry deserves a spotlight.</p>
        <p style="margin:14px 0 0 0;font-size:13px;color:#444444;line-height:1.6;font-family:Inter,-apple-system,Arial,sans-serif;">Thanks for growing with EGC Network.</p>
      </td>
    </tr>
  </table>
`);


/* ══════════════════════════════════════════════════════════════
   5.  PLAN EXPIRY REMINDER
   Visual: NotiFy/KelpBox — dark urgency, feature grid, bordered CTA
══════════════════════════════════════════════════════════════ */
export const getPlanExpiryEmailTemplate = (name, daysLeft, url) => wrap(`Action Required: Plan Expiring in ${daysLeft} Days — EGC Network`, `

  <!-- HERO: Full dark urgency -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:#0a0a0a;padding:56px 40px 48px 40px;text-align:center;">
        <h1 style="margin:0 0 12px 0;font-size:34px;font-weight:900;color:#ffffff;letter-spacing:-1.5px;line-height:1.1;font-family:Inter,-apple-system,Arial,sans-serif;">Hi ${name}, your plan<br/>expires in <span style="color:#d74339;">${daysLeft} days.</span></h1>
        <p style="margin:0 0 28px 0;font-size:14px;color:rgba(255,255,255,0.5);line-height:1.6;font-family:Inter,-apple-system,Arial,sans-serif;">Keep your growth momentum without any interruptions.</p>
        <a href="${url}" style="display:inline-block;border:1.5px solid rgba(255,255,255,0.25);border-radius:100px;padding:13px 32px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;font-family:Inter,-apple-system,Arial,sans-serif;">Renew My Subscription →</a>
      </td>
    </tr>
  </table>

  <!-- What you'll lose (NotiFy checklist) -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:#111111;padding:32px 40px;">
        <h2 style="margin:0 0 20px 0;font-size:17px;font-weight:800;color:#ffffff;line-height:1.4;font-family:Inter,-apple-system,Arial,sans-serif;">You're not taking advantage of all these great offerings:</h2>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${[
    ['Advanced Analytics', 'Deep sales trends, forecasts & performance reports'],
    ['Expert Workspace', 'Direct messaging & guidance from your advisor'],
    ['Smart Calendar', 'Scheduled sessions, reminders & milestone tracking'],
  ].map(([t, d]) => `
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #1e1e1e;">
              <table cellpadding="0" cellspacing="0" border="0"><tr>
                <td style="width:22px;height:22px;background:#d74339;border-radius:50%;text-align:center;line-height:22px;font-size:11px;color:#ffffff;vertical-align:middle;font-weight:700;font-family:Arial,sans-serif;">✓</td>
                <td style="padding-left:14px;vertical-align:middle;">
                  <strong style="color:#dddddd;font-size:14px;font-family:Inter,-apple-system,Arial,sans-serif;">${t}</strong><br/>
                  <span style="color:#555555;font-size:13px;font-family:Inter,-apple-system,Arial,sans-serif;">${d}</span>
                </td>
              </tr></table>
            </td>
          </tr>`).join('')}
        </table>
      </td>
    </tr>
  </table>

  <!-- Feature grid (dark cards) -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:#0f0f0f;padding:32px 40px;">
        <p style="margin:0 0 18px 0;font-size:12px;font-weight:700;letter-spacing:1.5px;color:#d74339;text-transform:uppercase;font-family:Inter,-apple-system,Arial,sans-serif;">Keep Your Edge. Don't Miss Out.</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="48%" style="background:#1a1a1a;border-radius:10px;padding:20px;border:1px solid #222222;vertical-align:top;">
              <p style="margin:0 0 8px 0;font-size:20px;font-family:Arial,sans-serif;">📈</p>
              <p style="margin:0 0 4px 0;font-size:14px;font-weight:700;color:#ffffff;font-family:Inter,-apple-system,Arial,sans-serif;">Unlimited Access</p>
              <p style="margin:0;font-size:12px;color:#555555;line-height:1.5;font-family:Inter,-apple-system,Arial,sans-serif;">Analytics, reports and expert sessions anytime.</p>
            </td>
            <td width="4%"></td>
            <td width="48%" style="background:#1a1a1a;border-radius:10px;padding:20px;border:1px solid #222222;vertical-align:top;">
              <p style="margin:0 0 8px 0;font-size:20px;font-family:Arial,sans-serif;">⚡</p>
              <p style="margin:0 0 4px 0;font-size:14px;font-weight:700;color:#ffffff;font-family:Inter,-apple-system,Arial,sans-serif;">Faster Workflows</p>
              <p style="margin:0;font-size:12px;color:#555555;line-height:1.5;font-family:Inter,-apple-system,Arial,sans-serif;">Finish targets quicker with smart goal tracking.</p>
            </td>
          </tr>
          <tr><td colspan="3" style="padding-top:10px;"></td></tr>
          <tr>
            <td width="48%" style="background:#1a1a1a;border-radius:10px;padding:20px;border:1px solid #222222;vertical-align:top;">
              <p style="margin:0 0 8px 0;font-size:20px;font-family:Arial,sans-serif;">🛡</p>
              <p style="margin:0 0 4px 0;font-size:14px;font-weight:700;color:#ffffff;font-family:Inter,-apple-system,Arial,sans-serif;">Priority Support</p>
              <p style="margin:0;font-size:12px;color:#555555;line-height:1.5;font-family:Inter,-apple-system,Arial,sans-serif;">Faster response from our dedicated advisory team.</p>
            </td>
            <td width="4%"></td>
            <td width="48%" style="background:#1a1a1a;border-radius:10px;padding:20px;border:1px solid #222222;vertical-align:top;">
              <p style="margin:0 0 8px 0;font-size:20px;font-family:Arial,sans-serif;">📊</p>
              <p style="margin:0 0 4px 0;font-size:14px;font-weight:700;color:#ffffff;font-family:Inter,-apple-system,Arial,sans-serif;">Data Continuity</p>
              <p style="margin:0;font-size:12px;color:#555555;line-height:1.5;font-family:Inter,-apple-system,Arial,sans-serif;">Keep your growth data consistent and uninterrupted.</p>
            </td>
          </tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
          <tr>
            <td style="text-align:center;">
              <a href="${url}" style="display:inline-block;border:1.5px solid #d74339;border-radius:100px;padding:14px 36px;font-size:14px;font-weight:700;color:#d74339;text-decoration:none;font-family:Inter,-apple-system,Arial,sans-serif;">Renew My Subscription →</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`);


/* ══════════════════════════════════════════════════════════════
   6.  MEETING REMINDER (1 hour before)
   Visual: Dripcloud/Invoice — split hero, clean key-value rows
══════════════════════════════════════════════════════════════ */
export const getMeetingReminderEmailTemplate = (name, meetingTitle, timeString, joinLink) => wrap('Your Meeting Starts in 1 Hour — EGC Network', `

  <!-- HERO: Split warm left + illustration right -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td width="58%" style="background:#ffffff;padding:48px 20px 40px 40px;vertical-align:middle;">
        <p style="margin:0 0 10px 0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#d74339;font-family:Inter,-apple-system,Arial,sans-serif;">MEETING STARTS IN 1 HOUR</p>
        <h1 style="margin:0;font-size:30px;font-weight:900;color:#0a0a0a;letter-spacing:-1px;line-height:1.15;font-family:Inter,-apple-system,Arial,sans-serif;">You have a<br/>session today.</h1>
      </td>
      <td width="42%" style="background:#fff5f5;padding:48px 40px 40px 20px;text-align:center;vertical-align:middle;">
        <div style="font-size:64px;font-family:Arial,sans-serif;">📅</div>
      </td>
    </tr>
  </table>

  <!-- Invoice-style detail card -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:#ffffff;padding:0 40px 44px 40px;">
        <p style="margin:0 0 6px 0;font-size:15px;font-weight:700;color:#0a0a0a;font-family:Inter,-apple-system,Arial,sans-serif;">Hi ${name} 👋,</p>
        <p style="margin:0 0 28px 0;font-size:14px;line-height:1.8;color:#666666;font-family:Inter,-apple-system,Arial,sans-serif;">This is your 1-hour reminder. Your advisor is ready and your session is about to begin. Come prepared!</p>

        <!-- Invoice-style table (Dripcloud) -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1.5px solid #efefef;border-radius:12px;overflow:hidden;margin:0 0 28px 0;">
          <tr>
            <td style="background:#f9f9f9;padding:16px 24px;border-bottom:1px solid #efefef;">
              <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#888888;font-family:Inter,-apple-system,Arial,sans-serif;">Session Details</p>
            </td>
          </tr>
          ${[
    ['Topic', meetingTitle],
    ['Date & Time', timeString],
    ['Platform', 'EGC Workspace'],
  ].map(([l, v]) => `
          <tr>
            <td style="padding:14px 24px;border-bottom:1px solid #f5f5f5;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                <td style="font-size:13px;color:#aaaaaa;width:40%;font-family:Inter,-apple-system,Arial,sans-serif;">${l}</td>
                <td style="font-size:14px;font-weight:700;color:#0a0a0a;text-align:right;font-family:Inter,-apple-system,Arial,sans-serif;">${v}</td>
              </tr></table>
            </td>
          </tr>`).join('')}
        </table>

        <!-- Full-width pill CTA -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="text-align:center;">
              <a href="${joinLink}" style="display:block;background:#d74339;color:#ffffff;text-align:center;padding:18px;font-size:14px;font-weight:800;text-decoration:none;border-radius:100px;font-family:Inter,-apple-system,Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;">Join Workspace Now</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- Dark CTA strip -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:#0a0a0a;padding:36px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="vertical-align:middle;">
            <h2 style="margin:0 0 6px 0;font-size:19px;font-weight:900;color:#ffffff;line-height:1.3;font-family:Inter,-apple-system,Arial,sans-serif;">Ready to check<br/>your workspace?</h2>
            <p style="margin:0;font-size:13px;color:#444444;line-height:1.6;font-family:Inter,-apple-system,Arial,sans-serif;">See full details, notes, and past sessions inside.</p>
          </td>
          <td style="vertical-align:middle;text-align:right;width:130px;">
            <a href="${joinLink}" style="display:inline-block;background:#d74339;color:#ffffff;padding:12px 20px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none;white-space:nowrap;font-family:Inter,-apple-system,Arial,sans-serif;">Go to Workspace</a>
          </td>
        </tr></table>
      </td>
    </tr>
  </table>
`);


/* ══════════════════════════════════════════════════════════════
   7.  EXPERT ASSIGNED
   Visual: Peter Parker portfolio — circular avatar, trusted-by strip,
           strengths cards, achievement 2×2 grid
══════════════════════════════════════════════════════════════ */
export const getExpertAssignedEmailTemplate = (clientName, expertName, expertBio, url) => wrap(`Meet Your Expert Advisor — EGC Network`, `

  <!-- HERO: Warm-tinted, centered, circular avatar + bio -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:linear-gradient(160deg,#fef5f4,#ffe8e6);padding:48px 40px 24px 40px;text-align:center;">
        <div style="width:90px;height:90px;background:linear-gradient(135deg,#d74339,#8b1d1a);border-radius:50%;margin:0 auto 14px auto;border:4px solid #ffffff;font-size:36px;line-height:82px;text-align:center;">👤</div>
        <p style="margin:0 0 2px 0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#d74339;font-family:Inter,-apple-system,Arial,sans-serif;">YES, I AM YOUR NEW ADVISOR</p>
        <h1 style="margin:0 0 4px 0;font-size:30px;font-weight:900;color:#0a0a0a;letter-spacing:-0.5px;font-family:Inter,-apple-system,Arial,sans-serif;">${expertName.toUpperCase()}</h1>
        <p style="margin:0 0 8px 0;font-size:13px;font-weight:600;color:#888888;text-transform:uppercase;letter-spacing:1px;font-family:Inter,-apple-system,Arial,sans-serif;">Business & Finance Expert</p>
        <p style="margin:0 0 20px 0;font-size:13px;color:#777777;line-height:1.6;font-family:Inter,-apple-system,Arial,sans-serif;">${expertBio || 'Dedicated to empowering entrepreneurs to reach their financial goals and build lasting growth systems.'}</p>
        <a href="${url}" style="display:inline-block;background:#d74339;color:#ffffff;padding:12px 28px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none;font-family:Inter,-apple-system,Arial,sans-serif;">VIEW PROFILE</a>
      </td>
    </tr>
  </table>

  <!-- Expertise strip (Peter Parker "Trusted by" logos) -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:#f9f9f9;padding:20px 40px;border-top:1px solid #efefef;border-bottom:1px solid #efefef;text-align:center;">
        <p style="margin:0 0 10px 0;font-size:11px;font-weight:700;color:#cccccc;letter-spacing:2px;text-transform:uppercase;font-family:Inter,-apple-system,Arial,sans-serif;">Expertise across industries</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          ${['🏦 Finance', '📊 Analytics', '🏪 Retail', '💼 Strategy', '📈 Growth'].map(s => `<td style="text-align:center;"><span style="font-size:12px;font-weight:600;color:#888888;font-family:Inter,-apple-system,Arial,sans-serif;">${s}</span></td>`).join('')}
        </tr></table>
      </td>
    </tr>
  </table>

  <!-- Strengths (Peter Parker "My Strengths") -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:#0a0a0a;padding:32px 40px;">
        <p style="margin:0 0 18px 0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#d74339;text-align:center;font-family:Inter,-apple-system,Arial,sans-serif;">YOUR ADVISOR'S STRENGTHS</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td width="32%" style="background:#1a1a1a;border-radius:10px;padding:20px 12px;text-align:center;vertical-align:top;">
            <p style="margin:0 0 6px 0;font-size:24px;font-family:Arial,sans-serif;">🎯</p>
            <p style="margin:0;font-size:12px;font-weight:700;color:#aaaaaa;text-transform:uppercase;letter-spacing:1px;font-family:Inter,-apple-system,Arial,sans-serif;">Goal Setting</p>
          </td>
          <td width="2%"></td>
          <td width="32%" style="background:#1a1a1a;border-radius:10px;padding:20px 12px;text-align:center;vertical-align:top;">
            <p style="margin:0 0 6px 0;font-size:24px;font-family:Arial,sans-serif;">📋</p>
            <p style="margin:0;font-size:12px;font-weight:700;color:#aaaaaa;text-transform:uppercase;letter-spacing:1px;font-family:Inter,-apple-system,Arial,sans-serif;">Planning</p>
          </td>
          <td width="2%"></td>
          <td width="32%" style="background:#1a1a1a;border-radius:10px;padding:20px 12px;text-align:center;vertical-align:top;">
            <p style="margin:0 0 6px 0;font-size:24px;font-family:Arial,sans-serif;">💡</p>
            <p style="margin:0;font-size:12px;font-weight:700;color:#aaaaaa;text-transform:uppercase;letter-spacing:1px;font-family:Inter,-apple-system,Arial,sans-serif;">Strategic</p>
          </td>
        </tr></table>
      </td>
    </tr>
  </table>

  <!-- Impact numbers (Peter Parker "2024 Impact Report") -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:#ffffff;padding:40px 40px 20px 40px;text-align:center;">
        <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#888888;font-family:Inter,-apple-system,Arial,sans-serif;">ADVISOR ACHIEVEMENTS</p>
        <h2 style="margin:0 0 8px 0;font-size:34px;font-weight:900;color:#0a0a0a;letter-spacing:-1.5px;font-family:Inter,-apple-system,Arial,sans-serif;">ADVISOR IMPACT 2024</h2>
        <p style="margin:0 0 28px 0;font-size:13px;color:#999999;line-height:1.6;font-family:Inter,-apple-system,Arial,sans-serif;">Setting ambitious goals and delivering real business growth.</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="48%" style="background:#fef5f4;border-radius:10px;padding:20px;text-align:center;">
              <p style="margin:0 0 4px 0;font-size:26px;font-weight:900;color:#d74339;letter-spacing:-1px;font-family:Inter,-apple-system,Arial,sans-serif;">150+</p>
              <p style="margin:0;font-size:12px;color:#999999;line-height:1.5;font-family:Inter,-apple-system,Arial,sans-serif;">Clients helped to reach their yearly financial targets</p>
            </td>
            <td width="4%"></td>
            <td width="48%" style="background:#f5f9ff;border-radius:10px;padding:20px;text-align:center;">
              <p style="margin:0 0 4px 0;font-size:26px;font-weight:900;color:#3d7de8;letter-spacing:-1px;font-family:Inter,-apple-system,Arial,sans-serif;">₹2Cr+</p>
              <p style="margin:0;font-size:12px;color:#999999;line-height:1.5;font-family:Inter,-apple-system,Arial,sans-serif;">Total client revenue growth guided in 2024</p>
            </td>
          </tr>
          <tr><td colspan="3" style="padding-top:10px;"></td></tr>
          <tr>
            <td width="48%" style="background:#f5fff8;border-radius:10px;padding:20px;text-align:center;">
              <p style="margin:0 0 4px 0;font-size:26px;font-weight:900;color:#22c55e;letter-spacing:-1px;font-family:Inter,-apple-system,Arial,sans-serif;">98%</p>
              <p style="margin:0;font-size:12px;color:#999999;line-height:1.5;font-family:Inter,-apple-system,Arial,sans-serif;">Client satisfaction rate across all engagements</p>
            </td>
            <td width="4%"></td>
            <td width="48%" style="background:#fffaf5;border-radius:10px;padding:20px;text-align:center;">
              <p style="margin:0 0 4px 0;font-size:26px;font-weight:900;color:#f59e0b;letter-spacing:-1px;font-family:Inter,-apple-system,Arial,sans-serif;">12 Yrs</p>
              <p style="margin:0;font-size:12px;color:#999999;line-height:1.5;font-family:Inter,-apple-system,Arial,sans-serif;">Of hands-on business coaching experience</p>
            </td>
          </tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
          <tr>
            <td style="text-align:center;">
              <a href="${url}" style="display:inline-block;background:#0a0a0a;color:#ffffff;padding:14px 36px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none;font-family:Inter,-apple-system,Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;">GO TO MY WORKSPACE</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`);


/* ══════════════════════════════════════════════════════════════
   8.  PLAN UPGRADE CONFIRMATION
   Visual: WimWan — black + diagonal stripes, magazine feature grid, stats bar
══════════════════════════════════════════════════════════════ */
export const getPlanUpgradeEmailTemplate = (name, planName, url) => wrap(`Welcome to ${planName}! — EGC Network`, `

  <!-- HERO: WimWan-style black with stripe bands -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:#0a0a0a;padding:48px 40px 0 40px;text-align:center;">
        <div style="background:repeating-linear-gradient(45deg,#d74339,#d74339 3px,transparent 3px,transparent 16px);height:6px;border-radius:3px;margin-bottom:28px;"></div>
        <p style="margin:0 0 6px 0;font-size:11px;font-weight:700;letter-spacing:3px;color:#d74339;text-transform:uppercase;font-family:Inter,-apple-system,Arial,sans-serif;">PLAN ACTIVATED</p>
        <h1 style="margin:0 0 12px 0;font-size:34px;font-weight:900;color:#ffffff;letter-spacing:-1.5px;line-height:1.05;font-family:Inter,-apple-system,Arial,sans-serif;">Thanks for subscribing,<br/>${name}!</h1>
        <p style="margin:0 0 24px 0;font-size:14px;color:rgba(255,255,255,0.5);line-height:1.6;font-family:Inter,-apple-system,Arial,sans-serif;">You've unlocked exclusive access to ${planName} — premium advisory, analytics, and priority support.</p>
        <a href="${url}" style="display:inline-block;background:#d74339;color:#ffffff;padding:13px 32px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none;font-family:Inter,-apple-system,Arial,sans-serif;margin-bottom:32px;">Go to Dashboard →</a>
        <div style="background:repeating-linear-gradient(45deg,#d74339,#d74339 3px,transparent 3px,transparent 16px);height:6px;border-radius:3px;"></div>
      </td>
    </tr>
  </table>

  <!-- Feature grid (WimWan 2×2) -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:#ffffff;padding:36px 40px 12px 40px;">
        <p style="margin:0 0 16px 0;font-size:13px;color:#888888;line-height:1.6;text-align:center;font-family:Inter,-apple-system,Arial,sans-serif;">Discover insights, analytics, and resources from your Expert Advisor — curated just for you.</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="48%" style="background:#fafafa;border-radius:10px;padding:20px;border:1px solid #f0f0f0;text-align:center;vertical-align:top;">
              <div style="width:44px;height:44px;background:#fff5f5;border-radius:10px;margin:0 auto 12px auto;text-align:center;line-height:44px;font-size:20px;font-family:Arial,sans-serif;">📈</div>
              <p style="margin:0 0 4px 0;font-size:14px;font-weight:700;color:#0a0a0a;font-family:Inter,-apple-system,Arial,sans-serif;">Advanced Analytics</p>
              <p style="margin:0;font-size:12px;color:#aaaaaa;line-height:1.5;font-family:Inter,-apple-system,Arial,sans-serif;">Real-time sales tracking and intelligent forecasting.</p>
            </td>
            <td width="4%"></td>
            <td width="48%" style="background:#fafafa;border-radius:10px;padding:20px;border:1px solid #f0f0f0;text-align:center;vertical-align:top;">
              <div style="width:44px;height:44px;background:#fff5f5;border-radius:10px;margin:0 auto 12px auto;text-align:center;line-height:44px;font-size:20px;font-family:Arial,sans-serif;">💬</div>
              <p style="margin:0 0 4px 0;font-size:14px;font-weight:700;color:#0a0a0a;font-family:Inter,-apple-system,Arial,sans-serif;">Expert Workspace</p>
              <p style="margin:0;font-size:12px;color:#aaaaaa;line-height:1.5;font-family:Inter,-apple-system,Arial,sans-serif;">Direct access to your dedicated advisor for guidance.</p>
            </td>
          </tr>
          <tr><td colspan="3" style="padding-top:10px;"></td></tr>
          <tr>
            <td width="48%" style="background:#fafafa;border-radius:10px;padding:20px;border:1px solid #f0f0f0;text-align:center;vertical-align:top;">
              <div style="width:44px;height:44px;background:#fff5f5;border-radius:10px;margin:0 auto 12px auto;text-align:center;line-height:44px;font-size:20px;font-family:Arial,sans-serif;">📅</div>
              <p style="margin:0 0 4px 0;font-size:14px;font-weight:700;color:#0a0a0a;font-family:Inter,-apple-system,Arial,sans-serif;">Smart Calendar</p>
              <p style="margin:0;font-size:12px;color:#aaaaaa;line-height:1.5;font-family:Inter,-apple-system,Arial,sans-serif;">Goal-setting, milestone planning, and scheduling.</p>
            </td>
            <td width="4%"></td>
            <td width="48%" style="background:#fafafa;border-radius:10px;padding:20px;border:1px solid #f0f0f0;text-align:center;vertical-align:top;">
              <div style="width:44px;height:44px;background:#fff5f5;border-radius:10px;margin:0 auto 12px auto;text-align:center;line-height:44px;font-size:20px;font-family:Arial,sans-serif;">⭐</div>
              <p style="margin:0 0 4px 0;font-size:14px;font-weight:700;color:#0a0a0a;font-family:Inter,-apple-system,Arial,sans-serif;">Priority Support</p>
              <p style="margin:0;font-size:12px;color:#aaaaaa;line-height:1.5;font-family:Inter,-apple-system,Arial,sans-serif;">Faster responses and dedicated advisor access.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- Stats bar (WimWan "2.5K+ / 1.3K+ / 10M+") -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td width="33%" style="background:#ffffff;padding:28px 20px;text-align:center;border-top:1px solid #f0f0f0;">
        <p style="margin:0;font-size:24px;font-weight:900;color:#0a0a0a;letter-spacing:-1px;font-family:Inter,-apple-system,Arial,sans-serif;">800+</p>
        <p style="margin:4px 0 0 0;font-size:11px;color:#aaaaaa;text-transform:uppercase;letter-spacing:1px;font-family:Inter,-apple-system,Arial,sans-serif;">Members</p>
      </td>
      <td width="33%" style="background:#ffffff;padding:28px 20px;text-align:center;border-top:1px solid #f0f0f0;border-left:1px solid #f0f0f0;border-right:1px solid #f0f0f0;">
        <p style="margin:0;font-size:24px;font-weight:900;color:#d74339;letter-spacing:-1px;font-family:Inter,-apple-system,Arial,sans-serif;">3.2K+</p>
        <p style="margin:4px 0 0 0;font-size:11px;color:#aaaaaa;text-transform:uppercase;letter-spacing:1px;font-family:Inter,-apple-system,Arial,sans-serif;">Insights Shared</p>
      </td>
      <td width="34%" style="background:#ffffff;padding:28px 20px;text-align:center;border-top:1px solid #f0f0f0;">
        <p style="margin:0;font-size:24px;font-weight:900;color:#0a0a0a;letter-spacing:-1px;font-family:Inter,-apple-system,Arial,sans-serif;">₹50M+</p>
        <p style="margin:4px 0 0 0;font-size:11px;color:#aaaaaa;text-transform:uppercase;letter-spacing:1px;font-family:Inter,-apple-system,Arial,sans-serif;">Revenue Tracked</p>
      </td>
    </tr>
  </table>

  <!-- WimWan closing editorial band with red border top -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:#0a0a0a;padding:40px;text-align:center;border-top:4px solid #d74339;">
        <p style="margin:0 0 10px 0;font-size:18px;font-weight:900;color:#ffffff;line-height:1.4;font-family:Inter,-apple-system,Arial,sans-serif;">This is where <span style="color:#d74339;">growth meets</span><br/>action — where every target brings<br/>you closer to your vision.</p>
        <p style="margin:14px 0 0 0;font-size:13px;color:#444444;font-family:Inter,-apple-system,Arial,sans-serif;">Need help? Just reply to this email — we're here for you.</p>
      </td>
    </tr>
  </table>
`);


/* ══════════════════════════════════════════════════════════════
   9.  MEETING SCHEDULED BY EXPERT
   Visual: Dripcloud — light top illustration, invoice table rows, dark CTA card
══════════════════════════════════════════════════════════════ */
export const getMeetingScheduledEmailTemplate = (clientName, expertName, meetingTitle, timeString, url) => wrap('New Meeting Scheduled — EGC Network', `

  <!-- HERO: Light warm with calendar icon -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:linear-gradient(160deg,#fff5f5,#ffe8e6);padding:48px 40px 32px 40px;">
        <div style="font-size:56px;text-align:center;font-family:Arial,sans-serif;margin-bottom:20px;">🗓️</div>
        <h1 style="margin:0 0 8px 0;font-size:28px;font-weight:900;color:#0a0a0a;letter-spacing:-0.5px;line-height:1.15;font-family:Inter,-apple-system,Arial,sans-serif;">A new meeting<br/>has been scheduled<br/>for you.</h1>
        <p style="margin:0;font-size:13px;color:#888888;font-family:Inter,-apple-system,Arial,sans-serif;">Hi ${clientName}, please take a moment to review your session details below.</p>
      </td>
    </tr>
  </table>

  <!-- Invoice-style body -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:#ffffff;padding:40px 40px 12px 40px;">
        <h2 style="margin:0 0 4px 0;font-size:18px;font-weight:800;color:#0a0a0a;font-family:Inter,-apple-system,Arial,sans-serif;">Session Summary</h2>
        <p style="margin:0 0 20px 0;font-size:13px;color:#aaaaaa;font-family:Inter,-apple-system,Arial,sans-serif;">Scheduled by your Expert Advisor</p>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #f0f0f0;">
          ${[
    ['Topic', meetingTitle],
    ['Expert Advisor', expertName],
    ['Date & Time', timeString],
    ['Duration', '60 minutes'],
    ['Meeting Type', 'Advisory Review'],
  ].map(([l, v]) => `
          <tr>
            <td style="padding:14px 0;border-bottom:1px solid #f5f5f5;font-size:13px;color:#aaaaaa;vertical-align:middle;font-family:Inter,-apple-system,Arial,sans-serif;">${l}</td>
            <td style="padding:14px 0;border-bottom:1px solid #f5f5f5;font-size:14px;font-weight:700;color:#0a0a0a;text-align:right;vertical-align:middle;font-family:Inter,-apple-system,Arial,sans-serif;">${v}</td>
          </tr>`).join('')}
        </table>

        <!-- Full-width pill CTA -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
          <tr>
            <td>
              <a href="${url}" style="display:block;background:#d74339;color:#ffffff;text-align:center;padding:18px;font-size:14px;font-weight:800;text-decoration:none;border-radius:100px;font-family:Inter,-apple-system,Arial,sans-serif;letter-spacing:0.5px;">View in Workspace →</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- Dark CTA card (Dripcloud dark box) -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:#0a0a0a;padding:32px 40px;">
        <h2 style="margin:0 0 8px 0;font-size:20px;font-weight:900;color:#ffffff;line-height:1.3;font-family:Inter,-apple-system,Arial,sans-serif;">Ready to prepare<br/>for your session?</h2>
        <p style="margin:0 0 20px 0;font-size:13px;color:#555555;line-height:1.6;font-family:Inter,-apple-system,Arial,sans-serif;">Review past notes, goals, and data before the meeting to get the most from your advisory session.</p>
        <a href="${url}" style="display:inline-block;background:#d74339;color:#ffffff;padding:12px 24px;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none;font-family:Inter,-apple-system,Arial,sans-serif;">Go to Workspace</a>
      </td>
    </tr>
  </table>
`);


/* ══════════════════════════════════════════════════════════════
   10. EXPERT ADVISOR CHANGED
   Visual: Flowly — dark theme, advisor comparison card, "what's next" grid
══════════════════════════════════════════════════════════════ */
export const getExpertChangedEmailTemplate = (clientName, previousExpertName, newExpertName, url) => wrap('Your Expert Advisor Has Been Updated — EGC Network', `

  <!-- HERO: Full dark Flowly-style -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:#0a0a0a;padding:48px 40px 40px 40px;text-align:center;">
        <p style="margin:0 0 10px 0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#d74339;font-family:Inter,-apple-system,Arial,sans-serif;">ACCOUNT UPDATE</p>
        <h1 style="margin:0 0 14px 0;font-size:34px;font-weight:900;color:#ffffff;letter-spacing:-1.5px;line-height:1.05;font-family:Inter,-apple-system,Arial,sans-serif;">Meet your new<br/>Expert Advisor.</h1>
        <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.5);line-height:1.6;font-family:Inter,-apple-system,Arial,sans-serif;">Hi ${clientName}, your workspace has been updated with a fresh perspective and specialized expertise.</p>
      </td>
    </tr>
  </table>

  <!-- Advisor comparison UI (Flowly screenshot cards) -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:#0f0f0f;padding:32px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <!-- Previous (faded) -->
          <td width="45%" style="background:#1a1a1a;border-radius:12px;padding:20px;text-align:center;border:1px solid #222222;vertical-align:top;opacity:0.5;">
            <p style="margin:0 0 4px 0;font-size:10px;color:#555555;text-transform:uppercase;letter-spacing:1px;font-family:Inter,-apple-system,Arial,sans-serif;">Previous</p>
            <div style="width:52px;height:52px;background:#2a2a2a;border-radius:50%;margin:8px auto;font-size:22px;line-height:52px;text-align:center;">👤</div>
            <p style="margin:0 0 2px 0;font-size:14px;font-weight:700;color:#555555;font-family:Inter,-apple-system,Arial,sans-serif;">${previousExpertName || 'Previous Advisor'}</p>
            <p style="margin:0;font-size:11px;color:#333333;font-family:Inter,-apple-system,Arial,sans-serif;">Former Advisor</p>
          </td>
          <!-- Arrow -->
          <td width="10%" style="text-align:center;vertical-align:middle;font-size:20px;color:#d74339;font-family:Arial,sans-serif;">→</td>
          <!-- New (vibrant) -->
          <td width="45%" style="background:linear-gradient(160deg,#200e0d,#1a0808);border-radius:12px;padding:20px;text-align:center;border:2px solid #d74339;vertical-align:top;">
            <p style="margin:0 0 4px 0;font-size:10px;color:#d74339;text-transform:uppercase;letter-spacing:1px;font-weight:700;font-family:Inter,-apple-system,Arial,sans-serif;">New ✦</p>
            <div style="width:52px;height:52px;background:linear-gradient(135deg,#d74339,#8b1d1a);border-radius:50%;margin:8px auto;border:2px solid rgba(215,67,57,0.3);font-size:22px;line-height:48px;text-align:center;">👤</div>
            <p style="margin:0 0 2px 0;font-size:14px;font-weight:700;color:#ffffff;font-family:Inter,-apple-system,Arial,sans-serif;">${newExpertName}</p>
            <p style="margin:0;font-size:11px;color:#d74339;font-family:Inter,-apple-system,Arial,sans-serif;">Your New Advisor</p>
          </td>
        </tr></table>
      </td>
    </tr>
  </table>

  <!-- Getting started (Flowly) -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:#ffffff;padding:40px 40px 28px 40px;text-align:center;">
        <h2 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:#0a0a0a;font-family:Inter,-apple-system,Arial,sans-serif;">Getting Started</h2>
        <p style="margin:0 0 24px 0;font-size:14px;color:#888888;line-height:1.6;font-family:Inter,-apple-system,Arial,sans-serif;">You're now connected with ${newExpertName}. Let's help you get the most out of this new partnership.</p>
        <a href="${url}" style="display:inline-block;background:#d74339;color:#ffffff;padding:14px 36px;border-radius:100px;font-size:14px;font-weight:700;text-decoration:none;font-family:Inter,-apple-system,Arial,sans-serif;">Go to Workspace →</a>
      </td>
    </tr>
  </table>

  <!-- "What's Next" 2×2 feature grid -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:#ffffff;padding:0 40px 40px 40px;">
        <p style="margin:0 0 16px 0;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#cccccc;text-align:center;font-family:Inter,-apple-system,Arial,sans-serif;">WHAT'S NEXT</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="48%" style="background:#f9f9f9;border-radius:10px;padding:18px;border:1px solid #f0f0f0;vertical-align:top;">
              <div style="font-size:20px;margin-bottom:8px;font-family:Arial,sans-serif;">🗓️</div>
              <p style="margin:0 0 3px 0;font-size:13px;font-weight:700;color:#0a0a0a;font-family:Inter,-apple-system,Arial,sans-serif;">Schedule a session</p>
              <p style="margin:0;font-size:12px;color:#aaaaaa;line-height:1.5;font-family:Inter,-apple-system,Arial,sans-serif;">Book your first meeting with ${newExpertName} to set goals together.</p>
            </td>
            <td width="4%"></td>
            <td width="48%" style="background:#f9f9f9;border-radius:10px;padding:18px;border:1px solid #f0f0f0;vertical-align:top;">
              <div style="font-size:20px;margin-bottom:8px;font-family:Arial,sans-serif;">💬</div>
              <p style="margin:0 0 3px 0;font-size:13px;font-weight:700;color:#0a0a0a;font-family:Inter,-apple-system,Arial,sans-serif;">Say hello</p>
              <p style="margin:0;font-size:12px;color:#aaaaaa;line-height:1.5;font-family:Inter,-apple-system,Arial,sans-serif;">Introduce yourself and share your goals in the workspace chat.</p>
            </td>
          </tr>
          <tr><td colspan="3" style="padding-top:10px;"></td></tr>
          <tr>
            <td width="48%" style="background:#f9f9f9;border-radius:10px;padding:18px;border:1px solid #f0f0f0;vertical-align:top;">
              <div style="font-size:20px;margin-bottom:8px;font-family:Arial,sans-serif;">📊</div>
              <p style="margin:0 0 3px 0;font-size:13px;font-weight:700;color:#0a0a0a;font-family:Inter,-apple-system,Arial,sans-serif;">Review your data</p>
              <p style="margin:0;font-size:12px;color:#aaaaaa;line-height:1.5;font-family:Inter,-apple-system,Arial,sans-serif;">Your history and analytics are already shared with ${newExpertName}.</p>
            </td>
            <td width="4%"></td>
            <td width="48%" style="background:#f9f9f9;border-radius:10px;padding:18px;border:1px solid #f0f0f0;vertical-align:top;">
              <div style="font-size:20px;margin-bottom:8px;font-family:Arial,sans-serif;">🎯</div>
              <p style="margin:0 0 3px 0;font-size:13px;font-weight:700;color:#0a0a0a;font-family:Inter,-apple-system,Arial,sans-serif;">Set new targets</p>
              <p style="margin:0;font-size:12px;color:#aaaaaa;line-height:1.5;font-family:Inter,-apple-system,Arial,sans-serif;">Align on updated monthly targets and milestones together.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- Flowly dark brand footer -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background:#0a0a0a;padding:32px 40px;text-align:center;">
        <p style="margin:0 0 8px 0;font-size:18px;font-weight:900;color:#ffffff;line-height:1.3;font-family:Inter,-apple-system,Arial,sans-serif;">EGC <span style="color:#d74339;">Network</span></p>
        <p style="margin:0;font-size:13px;color:#333333;line-height:1.6;font-family:Inter,-apple-system,Arial,sans-serif;">Tailor your experience, <a href="#" style="color:#d74339;text-decoration:none;">unsubscribe</a> anytime, and explore our <a href="#" style="color:#d74339;text-decoration:none;">privacy policy</a>.</p>
      </td>
    </tr>
  </table>
`);
