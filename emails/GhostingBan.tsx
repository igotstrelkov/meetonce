import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Section,
  Text,
} from "@react-email/components";

interface GhostingBanProps {
  userName: string;
}

export default function GhostingBan({ userName }: GhostingBanProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Wordmark */}
          <Section style={wordmarkSection}>
            <Text style={wordmark}>MeetOnce</Text>
          </Section>

          <Hr style={divider} />

          {/* Main content */}
          <Section style={content}>
            <Text style={greeting}>Hi {userName},</Text>

            <Text style={body}>
              Your MeetOnce account has been permanently removed.
            </Text>

            {/* Reason */}
            <Section style={reasonCard}>
              <Text style={reasonLabel}>Reason</Text>
              <Text style={reasonText}>
                You confirmed interest in your match, engaged in the chat, and
                did not show up for the date. Your match reported that you
                cancelled on them.
              </Text>
            </Section>

            <Text style={body}>
              MeetOnce has a zero-tolerance policy for ghosting. When two people
              mutually agree to meet, both are expected to follow through.
              Failing to show up without notice is a serious breach of trust.
            </Text>

            <Text style={body}>
              This removal is permanent. There are no warnings, no second
              chances, and no appeals.
            </Text>

            <Text style={signature}>— The MeetOnce Team</Text>
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
  margin: "0 0 20px",
};

const reasonCard = {
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "8px",
  padding: "20px 24px",
  margin: "0 0 24px",
};

const reasonLabel = {
  fontSize: "11px",
  fontWeight: "600" as const,
  color: "#dc2626",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  margin: "0 0 10px",
};

const reasonText = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#7f1d1d",
  margin: "0",
};

const signature = {
  fontSize: "14px",
  color: "#9ca3af",
  margin: "24px 0 0",
};
