import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
} from "@react-email/components";

interface WeeklyMatchProps {
  userName: string;
  matchName: string;
  matchAge: number;
  matchUrl: string;
}

export default function WeeklyMatch({
  userName,
  matchName,
  matchAge,
  matchUrl,
}: WeeklyMatchProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={heading}>✨ Your Weekly Match</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Hi {userName},</Text>

            <Text style={intro}>
              We've found someone special for you this week!
            </Text>

            <Text style={matchInfo}>
              Meet {matchName}, {matchAge}
            </Text>

            <Button style={button} href={matchUrl}>
              View Your Match
            </Button>

            <Text style={footer}>
              Respond by Friday to let them know you're interested!
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
const heading = { fontSize: "28px", fontWeight: "bold", color: "#333" };
const content = {
  backgroundColor: "#ffffff",
  padding: "40px",
  borderRadius: "8px",
};
const greeting = { fontSize: "18px", marginBottom: "20px" };
const intro = { fontSize: "16px", lineHeight: "24px", marginBottom: "30px" };
const matchInfo = {
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
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
