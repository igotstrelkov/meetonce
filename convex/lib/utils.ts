export const makeMatchKey = (doc: {
  photoStatus: "pending" | "approved" | "rejected";
  vacationMode: boolean;
  gender: string;
}) =>
  `${doc.photoStatus}|${doc.vacationMode ? "1" : "0"}|${doc.gender}`;