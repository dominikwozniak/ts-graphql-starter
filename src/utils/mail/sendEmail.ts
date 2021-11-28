import * as nodemailer from 'nodemailer';
import log from '../../logger';

export async function sendEmail(
  email: string,
  url: string,
  subject = 'Test mail',
) {
  log.info(`Send email to ${email} and url ${url}`);

  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const info = await transporter.sendMail({
    from: '"Test email" <foo@example.com>',
    to: email,
    subject: subject,
    text: url,
  });

  log.info(`Message sent: ${info.messageId}`);
  log.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
}
