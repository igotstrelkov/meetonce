import {
  Body,
  Container,
  Head,
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
          <Section style={header}>
            <Text style={heading}>Account Removed</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Hi {userName},</Text>

            <Text style={body}>
              Your MeetOnce account has been permanently removed.
            </Text>

            <div style={reasonBox}>
              <Text style={reasonLabel}>Reason: Ghosting</Text>
              <Text style={reasonText}>
                You confirmed interest in your match, engaged in the chat, and
                then did not show up for the date. Your match reported that you
                cancelled on them.
              </Text>
            </div>

            <Text style={body}>
              MeetOnce has a zero-tolerance policy for ghosting. When two people
              mutually agree to meet, both are expected to follow through. Failing
              to show up without notice is a serious breach of trust and
              disrespectful to your match.
            </Text>

            <Text style={body}>
              This removal is permanent. There are no warnings, no second
              chances, and no appeals.
            </Text>

            <Text style={footer}>— The MeetOnce Team</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: "#f6f9fc", fontFamily: "sans-serif" };
const container = { margin: "0 auto", padding: "20px", maxWidth: "600px" };
const header = { textAlign: "center" as const, padding: "20px 0" };
const heading = { fontSize: "28px", fontWeight: "bold", color: "#dc2626" };
const content = {
  backgroundColor: "#ffffff",
  padding: "40px",
  borderRadius: "8px",
};
const greeting = { fontSize: "18px", marginBottom: "20px" };
const body = { fontSize: "16px", lineHeight: "24px", marginBottom: "20px" };
const reasonBox = {
  backgroundColor: "#fef2f2",
  padding: "20px",
  borderRadius: "8px",
  marginBottom: "20px",
  borderLeft: "4px solid #dc2626",
};
const reasonLabel = {
  fontSize: "14px",
  fontWeight: "bold" as const,
  color: "#991b1b",
  marginBottom: "8px",
};
const reasonText = {
  fontSize: "14px",
  color: "#7f1d1d",
  marginBottom: "0",
};
const footer = {
  fontSize: "14px",
  color: "#666",
  marginTop: "30px",
};
