import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface SecondDateContactProps {
  userName: string;
  matchName: string;
  matchEmail: string;
}

export default function SecondDateContact({
  userName,
  matchName,
  matchEmail,
}: SecondDateContactProps) {
  return (
    <Html>
      <Head />
      <Preview>
        You and {matchName} both want to meet again — here's how to reach them.
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
            <Text style={greeting}>Hi {userName},</Text>

            <Text style={body}>
              You and {matchName} both said you'd meet again. Here's their
              contact — reach out and make it happen.
            </Text>

            {/* Contact card */}
            <Section style={contactCard}>
              <Text style={contactLabel}>{matchName}</Text>
              <Text style={contactEmail}>
                <a href={`mailto:${matchEmail}`} style={emailLink}>
                  {matchEmail}
                </a>
              </Text>
            </Section>

            <Text style={note}>
              Drop them a message and sort out the details. Good luck.
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
  margin: "0 0 32px",
};

const contactCard = {
  backgroundColor: "#f9f9f7",
  borderRadius: "8px",
  padding: "24px",
  textAlign: "center" as const,
  margin: "0 0 28px",
};

const contactLabel = {
  fontSize: "11px",
  fontWeight: "600" as const,
  color: "#9ca3af",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  margin: "0 0 10px",
};

const contactEmail = {
  fontSize: "20px",
  fontWeight: "600" as const,
  color: "#111",
  margin: "0",
  letterSpacing: "-0.01em",
};

const emailLink = {
  color: "#111",
  textDecoration: "underline",
};

const note = {
  fontSize: "14px",
  lineHeight: "22px",
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
