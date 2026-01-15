export const makeMatchKey = (doc: {
  accountStatus: "pending" | "approved" | "rejected" | "waitlisted";
  vacationMode: boolean;
  gender: string;
}) => `${doc.accountStatus}|${doc.vacationMode ? "1" : "0"}|${doc.gender}`;
