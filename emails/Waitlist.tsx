import {
  Body,
  Container,
  Head,
  Html,
  Section,
  Text,
} from "@react-email/components";

interface WaitlistProps {
  userName: string;
}

export default function Waitlist({ userName }: WaitlistProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={heading}>You're on the Waitlist!</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Hi {userName},</Text>

            <Text style={intro}>
              Great news! Your profile has been reviewed and approved by our
              team.
            </Text>

            <Text style={intro}>
              You're currently on our waitlist as we carefully manage our
              community to ensure the best matching experience for everyone.
            </Text>

            <Text style={intro}>
              We'll notify you via email as soon as your account is fully
              activated and you can start receiving matches.
            </Text>

            <Text style={footer}>
              Thank you for your patience. We're excited to have you join
              MeetOnce soon!
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
const heading = { fontSize: "28px", fontWeight: "bold", color: "#f59e0b" };
const content = {
  backgroundColor: "#ffffff",
  padding: "40px",
  borderRadius: "8px",
};
const greeting = { fontSize: "18px", marginBottom: "20px" };
const intro = { fontSize: "16px", lineHeight: "24px", marginBottom: "20px" };
const footer = {
  fontSize: "14px",
  color: "#666",
  marginTop: "30px",
  textAlign: "center" as const,
};
