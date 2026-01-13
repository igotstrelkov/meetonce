import {
  Body,
  Button,
  Container,
  Head,
  Html,
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
  const messageCount =
    unreadCount === 1 ? "1 new message" : `${unreadCount} new messages`;

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={heading}>💬 New Message!</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Hi {receiverName},</Text>

            <Text style={intro}>
              {senderName} sent you a message! You have {messageCount} waiting
              for you.
            </Text>

            <div style={messageBox}>
              <Text style={messageLabel}>Latest Message:</Text>
              <Text style={messageText}>"{messagePreview}"</Text>
            </div>

            <Button style={button} href={matchUrl}>
              View Messages
            </Button>

            <Text style={footer}>Chat is active until Friday at 11:59 PM</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: "#f6f9fc", fontFamily: "sans-serif" };
const container = { margin: "0 auto", padding: "20px", maxWidth: "600px" };
const header = { textAlign: "center" as const, padding: "20px 0" };
const heading = { fontSize: "28px", fontWeight: "bold", color: "#ec4899" };
const content = {
  backgroundColor: "#ffffff",
  padding: "40px",
  borderRadius: "8px",
};
const greeting = { fontSize: "18px", marginBottom: "20px" };
const intro = { fontSize: "16px", lineHeight: "24px", marginBottom: "30px" };
const messageBox = {
  backgroundColor: "#f3f4f6",
  padding: "20px",
  borderRadius: "8px",
  marginBottom: "20px",
  borderLeft: "4px solid #ec4899",
};
const messageLabel = {
  fontSize: "12px",
  fontWeight: "bold" as const,
  color: "#6b7280",
  marginBottom: "8px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};
const messageText = {
  fontSize: "15px",
  color: "#374151",
  lineHeight: "22px",
  fontStyle: "italic" as const,
};
const button = {
  backgroundColor: "#ec4899",
  color: "#ffffff",
  padding: "12px 40px",
  borderRadius: "4px",
  fontSize: "16px",
  fontWeight: "bold" as const,
  textDecoration: "none",
  display: "inline-block",
  margin: "30px auto",
};
const footer = {
  fontSize: "14px",
  color: "#666",
  marginTop: "30px",
  textAlign: "center" as const,
};
