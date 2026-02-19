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

interface PhotoRejectedProps {
  userName: string;
  reason: string;
  guidance?: string;
  uploadUrl: string;
}

export default function PhotoRejected({
  userName,
  reason,
  guidance,
  uploadUrl,
}: PhotoRejectedProps) {
  return (
    <Html>
      <Head />
      <Preview>We need a new photo before your profile can go live.</Preview>
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
              Your photo didn't pass review. Upload a new one and we'll take
              another look.
            </Text>

            {/* Reason card */}
            <Section style={reasonCard}>
              <Text style={reasonLabel}>Reason</Text>
              <Text style={reasonText}>{reason}</Text>
              {guidance && (
                <>
                  <Text style={guidanceLabel}>Guidance</Text>
                  <Text style={guidanceText}>{guidance}</Text>
                </>
              )}
            </Section>

            {/* Tips */}
            <Text style={tipsHeading}>What makes a good photo</Text>
            <Text style={tip}>→ Your face is clearly visible</Text>
            <Text style={tip}>→ Well-lit and in focus</Text>
            <Text style={tip}>→ Just you — no group shots</Text>
            <Text style={tipLast}>→ Recent and accurate</Text>

            {/* CTA */}
            <Section style={buttonSection}>
              <Button style={button} href={uploadUrl}>
                Upload new photo
              </Button>
            </Section>

            <Text style={note}>
              We'll review your new photo within 24 hours.
            </Text>
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
  margin: "0 0 28px",
};

const reasonCard = {
  backgroundColor: "#fffbeb",
  border: "1px solid #fde68a",
  borderRadius: "8px",
  padding: "20px 24px",
  margin: "0 0 28px",
};

const reasonLabel = {
  fontSize: "11px",
  fontWeight: "600" as const,
  color: "#92400e",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  margin: "0 0 8px",
};

const reasonText = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#78350f",
  margin: "0 0 16px",
};

const guidanceLabel = {
  fontSize: "11px",
  fontWeight: "600" as const,
  color: "#92400e",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  margin: "0 0 8px",
};

const guidanceText = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#78350f",
  margin: "0",
};

const tipsHeading = {
  fontSize: "13px",
  fontWeight: "600" as const,
  color: "#111",
  margin: "0 0 12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.04em",
};

const tip = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#6b7280",
  margin: "0 0 6px",
};

const tipLast = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#6b7280",
  margin: "0 0 28px",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "0 0 20px",
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

const note = {
  fontSize: "13px",
  color: "#9ca3af",
  margin: "0",
  textAlign: "center" as const,
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
