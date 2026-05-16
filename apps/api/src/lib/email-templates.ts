/**
 * Hand-curated email templates.
 *
 * Sprint 1 keeps templates inline as small HTML + plain-text blocks. If the
 * project grows beyond a handful, this module is the migration point to
 * `react-email` or MJML — the public surface (`renderEmail`) won't change.
 */

import { z } from 'zod';

const WelcomeVarsSchema = z.object({
  userName: z.string().min(1),
  workspaceName: z.string().min(1),
});

const PasswordResetVarsSchema = z.object({
  userName: z.string().min(1),
  resetUrl: z.string().url(),
});

const InvitationVarsSchema = z.object({
  inviterName: z.string().min(1),
  workspaceName: z.string().min(1),
  role: z.string().min(1),
  acceptUrl: z.string().url(),
});

type TemplateKey = 'welcome' | 'password-reset' | 'invitation';

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const layout = (title: string, body: string): string =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background:#f7f7f8; padding: 32px; color:#0a0a0a;">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
${body}
<hr style="margin:32px 0;border:0;border-top:1px solid #e5e7eb;">
<p style="font-size:12px;color:#6b7280;margin:0;">Taskly — deep-work tracker. Sent because of activity on your account.</p>
</div></body></html>`;

const button = (label: string, href: string): string =>
  `<a href="${href}" style="display:inline-block;padding:10px 18px;background:#0a0a0a;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">${label}</a>`;

export const renderEmail = (template: TemplateKey, variables: unknown): RenderedEmail => {
  switch (template) {
    case 'welcome': {
      const { userName, workspaceName } = WelcomeVarsSchema.parse(variables);
      return {
        subject: `Welcome to Taskly, ${userName}!`,
        html: layout(
          'Welcome to Taskly',
          `<h1 style="margin:0 0 16px;font-size:22px;">Welcome, ${userName}!</h1>
<p>You just created the <strong>${workspaceName}</strong> workspace on Taskly. You can now invite teammates, plan your day, and start your first focus session.</p>`,
        ),
        text: `Welcome, ${userName}!\n\nYou just created the ${workspaceName} workspace on Taskly.\n`,
      };
    }
    case 'password-reset': {
      const { userName, resetUrl } = PasswordResetVarsSchema.parse(variables);
      return {
        subject: 'Reset your Taskly password',
        html: layout(
          'Reset your password',
          `<h1 style="margin:0 0 16px;font-size:22px;">Hi ${userName},</h1>
<p>Use the button below to choose a new password. The link expires in 60 minutes.</p>
<p>${button('Reset password', resetUrl)}</p>
<p style="font-size:13px;color:#6b7280;">If the button does not work, copy this URL into your browser:<br/><span style="word-break:break-all;">${resetUrl}</span></p>`,
        ),
        text: `Hi ${userName},\n\nReset your password: ${resetUrl}\n(The link expires in 60 minutes.)\n`,
      };
    }
    case 'invitation': {
      const { inviterName, workspaceName, role, acceptUrl } = InvitationVarsSchema.parse(variables);
      return {
        subject: `${inviterName} invited you to ${workspaceName} on Taskly`,
        html: layout(
          'You are invited to Taskly',
          `<h1 style="margin:0 0 16px;font-size:22px;">Join ${workspaceName}</h1>
<p><strong>${inviterName}</strong> invited you to join <strong>${workspaceName}</strong> as <strong>${role}</strong>.</p>
<p>${button('Accept invite', acceptUrl)}</p>
<p style="font-size:13px;color:#6b7280;">Invitation link (expires in 7 days):<br/><span style="word-break:break-all;">${acceptUrl}</span></p>`,
        ),
        text: `${inviterName} invited you to ${workspaceName} (role: ${role}).\n\nAccept here: ${acceptUrl}\n(Link expires in 7 days.)\n`,
      };
    }
  }
};
