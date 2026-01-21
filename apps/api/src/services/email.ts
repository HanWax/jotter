/**
 * Email service using Resend API for Cloudflare Workers.
 * Requires RESEND_API_KEY secret to be set.
 * If not configured, emails are logged but not sent.
 */

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

type ResendResponse = {
  id?: string;
  error?: string;
};

export async function sendEmail(
  apiKey: string | undefined,
  options: EmailOptions
): Promise<{ success: boolean; error?: string }> {
  // If no API key, log and skip (graceful degradation)
  if (!apiKey) {
    console.log("[Email] No RESEND_API_KEY configured, skipping email:", {
      to: options.to,
      subject: options.subject,
    });
    return { success: true }; // Consider it successful for now
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Jotter <notifications@jotter.app>",
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    const result = (await response.json()) as ResendResponse;

    if (!response.ok) {
      console.error("[Email] Failed to send:", result);
      return { success: false, error: result.error || "Failed to send email" };
    }

    console.log("[Email] Sent successfully:", result.id);
    return { success: true };
  } catch (error) {
    console.error("[Email] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export function buildShareNotificationEmail(params: {
  recipientEmail: string;
  documentTitle: string;
  shareUrl: string;
  expiresAt?: Date | null;
}): EmailOptions {
  const { recipientEmail, documentTitle, shareUrl, expiresAt } = params;

  const expirationNote = expiresAt
    ? `<p style="color: #666; font-size: 14px;">This link will expire on ${new Date(expiresAt).toLocaleDateString()}.</p>`
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f8f9fa; border-radius: 8px; padding: 24px; margin-bottom: 20px;">
    <h1 style="margin: 0 0 16px 0; font-size: 24px; color: #1a1a1a;">A document has been shared with you</h1>
    <p style="margin: 0 0 16px 0; font-size: 16px;">You've been invited to view: <strong>${escapeHtml(documentTitle)}</strong></p>
    <a href="${shareUrl}" style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500;">View Document</a>
  </div>
  ${expirationNote}
  <p style="color: #999; font-size: 12px; margin-top: 20px;">
    This email was sent to ${escapeHtml(recipientEmail)} because someone shared a Jotter document with you.
    If you didn't expect this email, you can safely ignore it.
  </p>
</body>
</html>
  `.trim();

  const text = `
A document has been shared with you

You've been invited to view: ${documentTitle}

View the document here: ${shareUrl}

${expiresAt ? `This link will expire on ${new Date(expiresAt).toLocaleDateString()}.` : ""}

This email was sent to ${recipientEmail} because someone shared a Jotter document with you.
  `.trim();

  return {
    to: recipientEmail,
    subject: `Document shared with you: ${documentTitle}`,
    html,
    text,
  };
}

export function buildCommentNotificationEmail(params: {
  ownerEmail: string;
  documentTitle: string;
  documentUrl: string;
  commenterName: string;
  commentContent: string;
  selectionText?: string;
}): EmailOptions {
  const { ownerEmail, documentTitle, documentUrl, commenterName, commentContent, selectionText } = params;

  const selectionQuote = selectionText
    ? `<div style="background: #fef9c3; border-left: 3px solid #facc15; padding: 12px; margin: 16px 0; font-style: italic; color: #666;">"${escapeHtml(selectionText)}"</div>`
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f8f9fa; border-radius: 8px; padding: 24px; margin-bottom: 20px;">
    <h1 style="margin: 0 0 16px 0; font-size: 24px; color: #1a1a1a;">New comment on your document</h1>
    <p style="margin: 0 0 8px 0; font-size: 16px;"><strong>${escapeHtml(commenterName)}</strong> commented on: <strong>${escapeHtml(documentTitle)}</strong></p>
    ${selectionQuote}
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0; color: #374151;">${escapeHtml(commentContent)}</p>
    </div>
    <a href="${documentUrl}" style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500;">View Document</a>
  </div>
  <p style="color: #999; font-size: 12px; margin-top: 20px;">
    This email was sent to ${escapeHtml(ownerEmail)} because someone commented on your Jotter document.
  </p>
</body>
</html>
  `.trim();

  const text = `
New comment on your document

${commenterName} commented on: ${documentTitle}

${selectionText ? `On the text: "${selectionText}"\n\n` : ""}Comment: ${commentContent}

View your document here: ${documentUrl}

This email was sent to ${ownerEmail} because someone commented on your Jotter document.
  `.trim();

  return {
    to: ownerEmail,
    subject: `New comment on "${documentTitle}" from ${commenterName}`,
    html,
    text,
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
