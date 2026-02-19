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

interface PhotoApprovedProps {
  userName: string;
  dashboardUrl: string;
}

export default function PhotoApproved({
  userName,
  dashboardUrl,
}: PhotoApprovedProps) {
  return (
    <Html>
      <Head />
      <Preview>Your photo's approved — your profile is now live.</Preview>
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
              Your photo passed review and your profile is now live. You're in
              the pool.
            </Text>

            {/* Status card */}
            <Section style={statusCard}>
              <Text style={statusLabel}>Profile status</Text>
              <Text style={statusValue}>Active</Text>
              <Text style={statusSub}>
                Your first match arrives Monday morning.
              </Text>
            </Section>

            {/* CTA */}
            <Section style={buttonSection}>
              <Button style={button} href={dashboardUrl}>
                Go to dashboard
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

const statusCard = {
  backgroundColor: "#f0fdf4",
  border: "1px solid #bbf7d0",
  borderRadius: "8px",
  padding: "28px 24px",
  textAlign: "center" as const,
  margin: "0 0 32px",
};

const statusLabel = {
  fontSize: "11px",
  fontWeight: "600" as const,
  color: "#16a34a",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  margin: "0 0 10px",
};

const statusValue = {
  fontSize: "28px",
  fontWeight: "700" as const,
  color: "#111",
  letterSpacing: "-0.02em",
  margin: "0 0 8px",
};

const statusSub = {
  fontSize: "14px",
  color: "#16a34a",
  margin: "0",
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
