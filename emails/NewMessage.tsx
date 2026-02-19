import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface NewMessageProps {
  receiverName: string;
  senderName: string;
  messagePreview: string;
  matchUrl: string;
  unreadCount: number;
}

export default function NewMessage({
  receiverName,
  senderName,
  messagePreview,
  matchUrl,
  unreadCount,
}: NewMessageProps) {
  const countLabel =
    unreadCount === 1 ? "1 unread message" : `${unreadCount} unread messages`;

  return (
    <Html>
      <Head />
      <Preview>
        {senderName}: "{messagePreview}"
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Wordmark */}
          <Section style={wordmarkSection}>
            <Text style={wordmark}>MeetOnce</Text>
          </Section>

          <Hr style={divider} />

          {/* Main content */}
          <Section style={content}>
            <Text style={greeting}>Hi {receiverName},</Text>

            <Text style={body}>
              {senderName} sent you a message. You have {countLabel} waiting.
            </Text>

            {/* Message preview */}
            <Section style={messageCard}>
              <Text style={messageLabel}>{senderName}</Text>
              <Text style={messageText}>"{messagePreview}"</Text>
            </Section>

            {/* CTA */}
            <Section style={buttonSection}>
              <Button style={button} href={matchUrl}>
                Reply to {senderName}
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              MeetOnce · One curated match, every week.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const main = {
  backgroundColor: "#f5f5f3",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "0 20px 48px",
  maxWidth: "560px",
};

const wordmarkSection = {
  padding: "36px 0 0",
  textAlign: "center" as const,
};

const wordmark = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#111",
  margin: "0",
  letterSpacing: "-0.02em",
};

const divider = {
  borderColor: "#e5e5e3",
  margin: "24px 0",
};

const content = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "40px",
};

const greeting = {
  fontSize: "16px",
  color: "#111",
  margin: "0 0 12px",
};

const body = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#6b7280",
  margin: "0 0 32px",
};

const messageCard = {
  backgroundColor: "#f9f9f7",
  borderLeft: "3px solid #d1d5db",
  borderRadius: "0 8px 8px 0",
  padding: "16px 20px",
  margin: "0 0 32px",
};

const messageLabel = {
  fontSize: "11px",
  fontWeight: "600" as const,
  color: "#9ca3af",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  margin: "0 0 8px",
};

const messageText = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#374151",
  margin: "0",
  fontStyle: "italic" as const,
};

const buttonSection = {
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#111",
  color: "#ffffff",
  padding: "14px 48px",
  borderRadius: "8px",
  fontSize: "15px",
  fontWeight: "600" as const,
  textDecoration: "none",
  display: "inline-block",
};

const footerSection = {
  padding: "28px 0 0",
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "12px",
  color: "#9ca3af",
  margin: "0",
};
