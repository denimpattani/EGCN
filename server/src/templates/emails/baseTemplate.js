export const getBaseTemplate = (title, contentHTML) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    /* Reset & Base Styles */
    body, p, h1, h2, h3, h4, h5, h6 { margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
      background-color: #f4f5f7; 
      color: #1a1a1a; 
      line-height: 1.6; 
      -webkit-font-smoothing: antialiased; 
    }
    
    /* Layout */
    .wrapper { 
      width: 100%; 
      table-layout: fixed; 
      background-color: #f4f5f7; 
      padding: 40px 0; 
    }
    .main-container { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: #ffffff; 
      border-radius: 16px; 
      box-shadow: 0 10px 40px rgba(0,0,0,0.08); 
      overflow: hidden; 
    }
    
    /* Header */
    .header { 
      background-color: #0a0a0a; 
      padding: 35px 40px; 
      text-align: center; 
      border-bottom: 4px solid #d74339;
    }
    .header img { 
      max-height: 45px; 
      width: auto; 
    }
    
    /* Content */
    .content-body { 
      padding: 45px 40px; 
      background-color: #ffffff; 
    }
    .content-body h2 { 
      font-size: 24px; 
      font-weight: 700; 
      color: #0a0a0a; 
      margin-bottom: 20px; 
      letter-spacing: -0.5px; 
    }
    .content-body p { 
      font-size: 16px; 
      color: #4a4a4a; 
      margin-bottom: 20px; 
    }
    
    /* Highlight & Accent */
    .highlight { 
      color: #d74339; 
      font-weight: 600; 
    }
    
    /* Information Box */
    .box-info { 
      background-color: #fafafa; 
      border-left: 4px solid #d74339; 
      padding: 20px 25px; 
      margin: 30px 0; 
      border-radius: 0 8px 8px 0; 
    }
    .box-info p { 
      margin: 0; 
      color: #333; 
      font-size: 15px; 
    }
    
    /* OTP Box */
    .otp-box { 
      background-color: #fff9f9; 
      border: 1px dashed #d74339; 
      padding: 25px; 
      text-align: center; 
      border-radius: 12px; 
      margin: 30px 0; 
    }
    .otp-box h1 { 
      margin: 0; 
      letter-spacing: 12px; 
      color: #d74339; 
      font-size: 42px; 
      font-weight: 700; 
    }
    
    /* Button */
    .button-container { 
      text-align: center; 
      margin: 40px 0 20px 0; 
    }
    .button { 
      display: inline-block; 
      background-color: #d74339; 
      color: #ffffff !important; 
      padding: 16px 36px; 
      text-decoration: none; 
      border-radius: 8px; 
      font-weight: 600; 
      font-size: 16px; 
      letter-spacing: 0.5px; 
    }
    
    /* Footer */
    .footer { 
      background-color: #fafafa; 
      padding: 30px 40px; 
      text-align: center; 
      border-top: 1px solid #eeeeee; 
    }
    .footer p { 
      color: #888888; 
      font-size: 13px; 
      margin-bottom: 8px; 
    }
    .footer-links {
      margin-top: 15px;
    }
    .footer-links a {
      color: #d74339;
      text-decoration: none;
      font-size: 13px;
      margin: 0 10px; 
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main-container">
      
      <!-- Header -->
      <div class="header">
        <img src="${process.env.FRONTEND_URL || 'https://egcnetwork.in'}/egcn-logo.png" alt="EGC Network Logo" />
      </div>
      
      <!-- Main Content -->
      <div class="content-body">
        ${contentHTML}
      </div>
      
      <!-- Footer -->
      <div class="footer">
        <p>You received this email because you are registered with EGC Network.</p>
        <div class="footer-links">
          <a href="${process.env.FRONTEND_URL || 'https://egcnetwork.in'}/dashboard">Dashboard</a> | 
          <a href="mailto:support@egcn.in">Contact Support</a> | 
          <a href="${process.env.FRONTEND_URL || 'https://egcnetwork.in'}">Website</a>
        </div>
        <p style="margin-top: 20px;">© ${new Date().getFullYear()} EGC Network. All rights reserved.</p>
      </div>
      
    </div>
  </div>
</body>
</html>
`;
