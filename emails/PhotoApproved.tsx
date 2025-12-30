import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
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
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={heading}>✅ Your Profile is Live!</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Hi {userName},</Text>

            <Text style={intro}>
              Great news! Your photo has been approved and your profile is now live.
            </Text>

            <Text style={intro}>
              You'll start receiving weekly matches every Monday morning. We carefully
              select one compatible person for you each week based on your profile,
              interests, and preferences.
            </Text>

            <Button style={button} href={dashboardUrl}>
              Go to Dashboard
            </Button>

            <Text style={footer}>
              Get ready for your first match! We can't wait to help you meet someone special.
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
const heading = { fontSize: "28px", fontWeight: "bold", color: "#10b981" };
const content = {
  backgroundColor: "#ffffff",
  padding: "40px",
  borderRadius: "8px",
};
const greeting = { fontSize: "18px", marginBottom: "20px" };
const intro = { fontSize: "16px", lineHeight: "24px", marginBottom: "20px" };
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
