import {
  Body,
  Button,
  Container,
  Head,
  Html,
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
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={heading}>Photo Review Update</Text>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Hi {userName},</Text>

            <Text style={intro}>
              Thank you for submitting your photo. Unfortunately, we need you to
              upload a new one.
            </Text>

            <div style={reasonBox}>
              <Text style={reasonLabel}>Reason:</Text>
              <Text style={reasonText}>{reason}</Text>
              {guidance && (
                <>
                  <Text style={reasonLabel}>Guidance:</Text>
                  <Text style={reasonText}>{guidance}</Text>
                </>
              )}
            </div>

            <Text style={intro}>
              We want to make sure all profiles have high-quality photos that
              accurately represent you. Please upload a new photo that:
            </Text>

            <ul style={list}>
              <li style={listItem}>Shows your face clearly</li>
              <li style={listItem}>Is recent and accurate</li>
              <li style={listItem}>Is well-lit and in focus</li>
              <li style={listItem}>Features just you (no group photos)</li>
            </ul>

            <Button style={button} href={uploadUrl}>
              Upload New Photo
            </Button>

            <Text style={footer}>
              We'll review your new photo within 24 hours. Thanks for your
              patience!
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
const intro = { fontSize: "16px", lineHeight: "24px", marginBottom: "20px" };
const reasonBox = {
  backgroundColor: "#fef3c7",
  padding: "20px",
  borderRadius: "8px",
  marginBottom: "20px",
};
const reasonLabel = {
  fontSize: "14px",
  fontWeight: "bold" as const,
  color: "#92400e",
  marginBottom: "8px",
};
const reasonText = {
  fontSize: "14px",
  color: "#78350f",
  marginBottom: "12px",
};
const list = { paddingLeft: "20px", marginBottom: "20px" };
const listItem = { fontSize: "14px", marginBottom: "8px", color: "#666" };
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
