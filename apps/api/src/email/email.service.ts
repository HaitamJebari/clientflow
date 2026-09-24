import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

interface SendWorkspaceInvitationInput {
  invitationId: string;
  to: string;
  organizationName: string;
  inviterName: string;
  role: string;
  token: string;
  expiresAt: Date;
}

interface ResendSendResponse {
  id?: string;
}

function escapeHtml(
  value: string,
) {
  return value
    .replace(
      /&/g,
      '&amp;',
    )
    .replace(
      /</g,
      '&lt;',
    )
    .replace(
      />/g,
      '&gt;',
    )
    .replace(
      /"/g,
      '&quot;',
    )
    .replace(
      /'/g,
      '&#039;',
    );
}

@Injectable()
export class EmailService {
  private readonly logger =
    new Logger(
      EmailService.name,
    );

  constructor(
    private readonly configService:
      ConfigService,
  ) {}

  async sendWorkspaceInvitation(
    input:
      SendWorkspaceInvitationInput,
  ) {
    const apiKey =
      this.configService.getOrThrow<string>(
        'RESEND_API_KEY',
      );

    const from =
      this.configService.getOrThrow<string>(
        'EMAIL_FROM',
      );

    const appUrl =
      this.configService
        .getOrThrow<string>(
          'APP_URL',
        )
        .replace(
          /\/+$/,
          '',
        );

    const inviteUrl =
      `${appUrl}/invite/${encodeURIComponent(input.token)}`;

    const safeOrganization =
      escapeHtml(
        input.organizationName,
      );

    const safeInviter =
      escapeHtml(
        input.inviterName,
      );

    const safeRole =
      escapeHtml(
        input.role
          .toLowerCase()
          .replace(
            /^./,
            (
              character,
            ) =>
              character.toUpperCase(),
          ),
      );

    const safeInviteUrl =
      escapeHtml(
        inviteUrl,
      );

    const expires =
      new Intl.DateTimeFormat(
        'en',
        {
          dateStyle:
            'medium',

          timeStyle:
            'short',

          timeZone:
            'UTC',
        },
      ).format(
        input.expiresAt,
      );

    const subject =
      `You're invited to join ${input.organizationName} on ClientFlow`;

    const html =
      `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f7fb;font-family:Inter,Arial,sans-serif;color:#15171a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7fb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e8eaf0;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:30px 30px 10px;">
                <div style="font-size:18px;font-weight:700;letter-spacing:-0.3px;">ClientFlow</div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 30px 30px;">
                <h1 style="margin:0 0 14px;font-size:26px;line-height:1.25;letter-spacing:-0.7px;">
                  Join ${safeOrganization}
                </h1>
                <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#5c6370;">
                  ${safeInviter} invited you to join <strong>${safeOrganization}</strong> as ${safeRole}.
                </p>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#5c6370;">
                  Accept the invitation to collaborate in the ClientFlow workspace.
                </p>
                <a href="${safeInviteUrl}" style="display:inline-block;background:#635bff;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:13px 18px;border-radius:10px;">
                  Accept invitation
                </a>
                <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#8b93a1;">
                  This secure invitation expires ${escapeHtml(expires)} UTC.
                </p>
                <p style="margin:10px 0 0;font-size:12px;line-height:1.6;color:#8b93a1;word-break:break-all;">
                  If the button does not work, copy this link:<br />
                  ${safeInviteUrl}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

    let response:
      Response;

    try {
      response =
        await fetch(
          'https://api.resend.com/emails',
          {
            method:
              'POST',

            headers: {
              Authorization:
                `Bearer ${apiKey}`,

              'Content-Type':
                'application/json',

              'Idempotency-Key':
                `workspace-invitation/${input.invitationId}`,
            },

            body:
              JSON.stringify({
                from,

                to: [
                  input.to,
                ],

                subject,
                html,

                tags: [
                  {
                    name:
                      'category',

                    value:
                      'workspace_invitation',
                  },

                  {
                    name:
                      'invitation_id',

                    value:
                      input.invitationId,
                  },
                ],
              }),

            signal:
              AbortSignal.timeout(
                15_000,
              ),
          },
        );
    } catch (
      error
    ) {
      this.logger.error(
        'Resend request failed before a successful response was received.',
        error instanceof
          Error
          ? error.stack
          : undefined,
      );

      throw new ServiceUnavailableException(
        'The invitation email could not be sent. Please try again.',
      );
    }

    const rawBody =
      await response.text();

    let body:
      ResendSendResponse & {
        message?: string;
      } = {};

    if (
      rawBody
    ) {
      try {
        body =
          JSON.parse(
            rawBody,
          );
      } catch {
        body = {};
      }
    }

    if (
      !response.ok ||
      !body.id
    ) {
      this.logger.error(
        `Resend rejected an invitation email request with HTTP ${response.status}.`,
      );

      throw new ServiceUnavailableException(
        body.message ||
          'The invitation email could not be sent. Please check the email configuration and try again.',
      );
    }

    return {
      id:
        body.id,
    };
  }
}
