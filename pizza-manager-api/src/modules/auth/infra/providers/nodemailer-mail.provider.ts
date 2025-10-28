import { mailer } from "@/lib/mail";
import { IMailProvider } from "@/modules/auth/application/providers/mail.provider";

export class NodemailerMailProvider implements IMailProvider {
  async sendMail(to: string, subject: string, body: string): Promise<void> {
    await mailer.sendMail({
      from: {
        name: "Pizza Manager",
        address: "hi@pizza-manager.com",
      },
      to,
      subject,
      text: body,
    });
  }
}