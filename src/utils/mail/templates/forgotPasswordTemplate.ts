const forgotPasswordTemplate = ({ link }: { link: string }) => {
	return {
		subject: 'Password Reset Request',

		text: `Forgot your password?

To reset your password, click the link below. The link will self-destruct after 15 minutes.

Reset your password:
${link}

If you do not want to change your password or didn't request a reset, you can ignore and delete this email.`,

		html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Reset Your Password</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f3f3f3; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 40px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background: #ffffff; border-radius: 8px; padding: 40px;">
            <tr>
              <td align="center">
                <!-- Heading -->
                <h2 style="margin: 0; font-size: 24px; font-weight: bold; color: #000000;">Forgot your password?</h2>

                <!-- Subtext -->
                <p style="margin: 20px 0; font-size: 15px; color: #555;">
                  To reset your password, click the button below. The link will self-destruct after 15 minutes.
                </p>

                <!-- Reset Button -->
                <a href="${link}"
                   style="display: inline-block; padding: 14px 24px; font-size: 16px; background-color: #0061ff; color: #ffffff; border-radius: 8px; text-decoration: none; font-weight: bold;">
                  Reset your password
                </a>

                <!-- Footer Note -->
                <p style="margin-top: 30px; font-size: 13px; color: #aaa;">
                  If you do not want to change your password or didn't request a reset, you can ignore and delete this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
	}
}

export default forgotPasswordTemplate
