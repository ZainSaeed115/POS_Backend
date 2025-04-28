export const VERIFICATION_EMAIL_TEMPLATE=`
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Email Verification</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellspacing="0" cellpadding="0" style="padding: 40px 0;">
      <tr>
        <td align="center">
          <table width="100%" max-width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); padding: 40px;">
            <tr>
              <td align="center" style="font-size: 24px; font-weight: bold; color: #047857; padding-bottom: 20px;">
                Email Verification
              </td>
            </tr>
            <tr>
              <td style="font-size: 16px; color: #374151;">
                Hi!
              </td>
            </tr>
            <tr>
              <td style="font-size: 16px; color: #374151; padding-top: 10px;">
                Thank you for registering your business on our POS platform. Please verify your email by entering the following code:
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 30px 0;">
                <div style="background-color: #f0fdf4; color: #065f46; padding: 15px 25px; font-size: 20px; font-weight: bold; letter-spacing: 4px; border-radius: 8px; border: 1px solid #bbf7d0; display: inline-block;">
                  {{verificationToken}}
                </div>
              </td>
            </tr>
            <tr>
              <td style="font-size: 14px; color: #6b7280; padding-bottom: 30px;">
                Paste this code in the app to complete your verification.
              </td>
            </tr>
            <!-- Optional Button -->
            <!-- <tr>
              <td align="center">
                <a href="{{verificationLink}}" style="background-color: #047857; color: white; text-decoration: none; padding: 12px 20px; border-radius: 6px; font-weight: bold; font-size: 14px;">
                  Verify Now
                </a>
              </td>
            </tr> -->
            <tr>
              <td style="font-size: 12px; color: #9ca3af; text-align: center; padding-top: 40px;">
                &copy; {{currentYear}} POS System. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>

`

export const WELCOME_EMAIL_TEMPLATE=`
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Welcome to Our POS</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellspacing="0" cellpadding="0" style="padding: 40px 0;">
      <tr>
        <td align="center">
          <table width="100%" max-width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); padding: 40px;">
            <tr>
              <td align="center" style="font-size: 26px; font-weight: bold; color: #047857; padding-bottom: 20px;">
                Welcome to Our POS Family!
              </td>
            </tr>
            <tr>
              <td style="font-size: 16px; color: #374151;">
                Hi <strong>{{businessOwnerName}}</strong>,
              </td>
            </tr>
            <tr>
              <td style="font-size: 16px; color: #374151; padding-top: 10px;">
                We're thrilled to welcome your business, <strong>{{businessName}}</strong>, to our POS platform. 🎉
              </td>
            </tr>
            <tr>
              <td style="font-size: 16px; color: #374151; padding-top: 10px;">
                With our POS system, you now have access to powerful tools for managing your sales, inventory, staff, and customers—all in one place.
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 30px 0;">
                <a href="{{dashboardLink}}" style="background-color: #047857; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 14px;">
                  Go to Dashboard
                </a>
              </td>
            </tr>
            <tr>
              <td style="font-size: 14px; color: #6b7280; padding-bottom: 20px;">
                If you have any questions, feel free to contact our support team. We're always here to help!
              </td>
            </tr>
            <tr>
              <td style="font-size: 16px; color: #374151;">
                Cheers,<br />
                The POS Team
              </td>
            </tr>
            <tr>
              <td style="font-size: 12px; color: #9ca3af; text-align: center; padding-top: 40px;">
                &copy; {{currentYear}} POS System. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>

`