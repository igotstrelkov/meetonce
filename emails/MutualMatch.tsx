import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
} from "@react-email/components";

interface MutualMatchProps {
  userName: string;
  matchName: string;
  conversationStarters: string[];
  matchUrl: string;
}

export default function MutualMatch({
  userName,
  matchName,
  conversationStarters,
  matchUrl,
}: MutualMatchProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={heading}>🎉 It's a Match!</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Hi {userName},</Text>

            <Text style={intro}>
              Exciting news! {matchName} is interested too! You both want to meet,
              so it's time to plan your date.
            </Text>

            <div style={sectionBox}>
              <Text style={sectionTitle}>💬 Conversation Starters</Text>
              {conversationStarters.map((starter, i) => (
                <Text key={i} style={listItem}>
                  {i + 1}. {starter}
                </Text>
              ))}
            </div>

            <div style={sectionBox}>
              <Text style={sectionTitle}>💬 Start Chatting Now!</Text>
              <Text style={venueNote}>
                You can now chat directly in the app! Head to your dashboard to
                start the conversation and plan your date together. Chat is
                active until Friday at 11:59 PM.
              </Text>
            </div>

            <Button style={button} href={matchUrl}>
              Start Chatting Now
            </Button>

            <Text style={footer}>
              Use the in-app chat to coordinate your schedules and plan your
              perfect date. Have a wonderful time getting to know each other!
            </Text>
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
const sectionBox = {
  backgroundColor: "#fdf2f8",
  padding: "20px",
  borderRadius: "8px",
  marginBottom: "20px",
};
const sectionTitle = {
  fontSize: "18px",
  fontWeight: "bold" as const,
  color: "#831843",
  marginBottom: "12px",
};
const listItem = {
  fontSize: "14px",
  color: "#9f1239",
  marginBottom: "8px",
  lineHeight: "20px",
};
const venueNameStyle = {
  fontSize: "16px",
  fontWeight: "bold" as const,
  color: "#831843",
  marginBottom: "4px",
};
const venueAddressStyle = {
  fontSize: "14px",
  color: "#9f1239",
  marginBottom: "12px",
};
const venueNote = {
  fontSize: "13px",
  color: "#be185d",
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
