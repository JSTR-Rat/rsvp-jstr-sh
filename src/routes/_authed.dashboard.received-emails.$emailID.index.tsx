import { StandardFormPanel } from '@/forms/standard-form';
import { StandardServerError } from '@/forms/standard-form';
import {
  sfFontSans,
  sfFontSerif,
  sfLabel,
} from '@/forms/standard-form/shared-classes';
import {
  adminGetReceivedEmailAttachmentUrlFN,
  adminGetReceivedEmailFN,
} from '@/utils/received-email.functions';
import {
  createFileRoute,
  Link,
  redirect,
} from '@tanstack/react-router';
import { useState } from 'react';

type StoredAttachment = {
  id: string;
  filename: string | null;
  content_type: string;
  size?: number;
};

function formatTs(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

function parseAttachments(value: string | null): StoredAttachment[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is StoredAttachment =>
        typeof item === 'object' &&
        item !== null &&
        'id' in item &&
        typeof (item as StoredAttachment).id === 'string',
    );
  } catch {
    return [];
  }
}

export const Route = createFileRoute(
  '/_authed/dashboard/received-emails/$emailID/',
)({
  staticData: {
    title: 'Received email',
  },
  loader: async ({ params }) => {
    const data = await adminGetReceivedEmailFN({ data: { id: params.emailID } });
    if (data.email === null) {
      throw redirect({ to: '/dashboard' });
    }
    return { email: data.email };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { email } = Route.useLoaderData();
  const [bodyView, setBodyView] = useState<'text' | 'html'>('text');
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const toAddresses = parseJsonArray(email.toAddressesJson);
  const ccAddresses = parseJsonArray(email.ccAddressesJson);
  const bccAddresses = parseJsonArray(email.bccAddressesJson);
  const attachments = parseAttachments(email.attachmentsJson);

  async function handleDownloadAttachment(attachmentId: string) {
    setAttachmentError(null);
    setDownloadingId(attachmentId);
    try {
      const { downloadUrl } = await adminGetReceivedEmailAttachmentUrlFN({
        data: { emailId: email.id, attachmentId },
      });
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    } catch (err: unknown) {
      console.error('Download attachment:', err);
      setAttachmentError(
        err instanceof Error ? err.message : 'Could not download attachment.',
      );
    } finally {
      setDownloadingId(null);
    }
  }

  const bodyContent =
    bodyView === 'html' && email.htmlBody
      ? email.htmlBody
      : email.textBody ?? email.htmlBody ?? '(No message body)';

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/dashboard"
          className="text-[0.8125rem] font-medium text-white/55 underline decoration-white/20 underline-offset-[0.18em] hover:text-white/78"
          style={{ fontFamily: sfFontSans }}
        >
          ← Dashboard
        </Link>
      </div>

      <StandardFormPanel>
        <div className="space-y-6 text-left">
          <header className="space-y-2">
            <h2
              className="text-[1.25rem] font-medium tracking-tight text-white sm:text-[1.375rem]"
              style={{ fontFamily: sfFontSerif }}
            >
              {email.subject}
            </h2>
            <p
              className="text-[0.9375rem] text-white/65"
              style={{ fontFamily: sfFontSans }}
            >
              From {email.fromAddress}
            </p>
          </header>

          <dl className="space-y-4 border-t border-white/12 pt-6">
            <div className="space-y-1">
              <dt className={sfLabel}>To</dt>
              <dd
                className="text-[0.9375rem] text-white/82"
                style={{ fontFamily: sfFontSans }}
              >
                {toAddresses.join(', ')}
              </dd>
            </div>

            {ccAddresses.length > 0 ? (
              <div className="space-y-1">
                <dt className={sfLabel}>Cc</dt>
                <dd
                  className="text-[0.9375rem] text-white/82"
                  style={{ fontFamily: sfFontSans }}
                >
                  {ccAddresses.join(', ')}
                </dd>
              </div>
            ) : null}

            {bccAddresses.length > 0 ? (
              <div className="space-y-1">
                <dt className={sfLabel}>Bcc</dt>
                <dd
                  className="text-[0.9375rem] text-white/82"
                  style={{ fontFamily: sfFontSans }}
                >
                  {bccAddresses.join(', ')}
                </dd>
              </div>
            ) : null}

            <div className="space-y-1">
              <dt className={sfLabel}>Received</dt>
              <dd
                className="text-[0.875rem] text-white/72"
                style={{ fontFamily: sfFontSans }}
              >
                {formatTs(email.receivedAt)}
              </dd>
            </div>
          </dl>

          {attachments.length > 0 ? (
            <div className="space-y-3 border-t border-white/12 pt-6">
              <h3
                className="text-[0.9375rem] font-medium text-white/85"
                style={{ fontFamily: sfFontSans }}
              >
                Attachments
              </h3>
              <ul className="space-y-2">
                {attachments.map((attachment) => (
                  <li key={attachment.id}>
                    <button
                      type="button"
                      onClick={() => handleDownloadAttachment(attachment.id)}
                      disabled={downloadingId === attachment.id}
                      className="text-[0.875rem] font-medium text-sky-300/95 underline decoration-sky-400/35 underline-offset-[0.18em] hover:text-sky-200 disabled:opacity-50"
                      style={{ fontFamily: sfFontSans }}
                    >
                      {attachment.filename ?? 'Attachment'}
                      {attachment.content_type
                        ? ` (${attachment.content_type})`
                        : ''}
                      {downloadingId === attachment.id ? '…' : ''}
                    </button>
                  </li>
                ))}
              </ul>
              {attachmentError ? (
                <StandardServerError>{attachmentError}</StandardServerError>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-3 border-t border-white/12 pt-6">
            <div className="flex flex-wrap items-center gap-3">
              <h3
                className="text-[0.9375rem] font-medium text-white/85"
                style={{ fontFamily: sfFontSans }}
              >
                Message
              </h3>
              {email.htmlBody ? (
                <div
                  className="flex gap-2 text-[0.8125rem]"
                  style={{ fontFamily: sfFontSans }}
                >
                  <button
                    type="button"
                    onClick={() => setBodyView('text')}
                    className={
                      bodyView === 'text'
                        ? 'font-medium text-white/90'
                        : 'text-white/55 underline decoration-white/20 underline-offset-[0.18em] hover:text-white/75'
                    }
                  >
                    Plain text
                  </button>
                  <span className="text-white/35">·</span>
                  <button
                    type="button"
                    onClick={() => setBodyView('html')}
                    className={
                      bodyView === 'html'
                        ? 'font-medium text-white/90'
                        : 'text-white/55 underline decoration-white/20 underline-offset-[0.18em] hover:text-white/75'
                    }
                  >
                    HTML
                  </button>
                </div>
              ) : null}
            </div>

            {bodyView === 'html' && email.htmlBody ? (
              <iframe
                title="Email HTML body"
                sandbox=""
                srcDoc={email.htmlBody}
                className="h-[min(480px,60vh)] w-full rounded-md border border-white/12 bg-white"
              />
            ) : (
              <pre
                className="max-h-[min(480px,60vh)] overflow-auto rounded-md border border-white/12 bg-black/25 p-4 text-[0.875rem] leading-relaxed whitespace-pre-wrap text-white/82"
                style={{ fontFamily: sfFontSans }}
              >
                {bodyContent}
              </pre>
            )}
          </div>
        </div>
      </StandardFormPanel>
    </div>
  );
}
