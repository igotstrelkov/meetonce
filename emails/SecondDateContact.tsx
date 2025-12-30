import {
  Html,
  Head,
  Body,
  Container,
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
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={heading}>🎉 Mutual Second Date Interest!</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Hi {userName},</Text>

            <Text style={intro}>
              Amazing news! Both you and {matchName} want to meet again!
            </Text>

            <div style={contactBox}>
              <Text style={contactLabel}>Their Contact Information:</Text>
              <Text style={contactInfo}>
                Email: <a href={`mailto:${matchEmail}`} style={emailLink}>{matchEmail}</a>
              </Text>
            </div>

            <Text style={callToAction}>
              Reach out and plan your second date! We're so excited for you both.
            </Text>

            <Text style={footer}>
              This is a great sign that our matching algorithm is working well.
              We'd love to hear how it goes!
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
const contactBox = {
  backgroundColor: "#fdf2f8",
  padding: "20px",
  borderRadius: "8px",
  marginBottom: "20px",
};
const contactLabel = {
  fontSize: "16px",
  fontWeight: "bold" as const,
  color: "#831843",
  marginBottom: "12px",
};
const contactInfo = {
  fontSize: "16px",
  color: "#333",
  marginBottom: "8px",
};
const emailLink = {
  color: "#ec4899",
  textDecoration: "none",
  fontWeight: "bold" as const,
};
const callToAction = {
  fontSize: "16px",
  lineHeight: "24px",
  marginBottom: "20px",
  textAlign: "center" as const,
  fontWeight: "bold" as const,
  color: "#831843",
};
const footer = {
  fontSize: "14px",
  color: "#666",
  marginTop: "30px",
  textAlign: "center" as const,
};
