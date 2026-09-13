export function deriveViewStatus({ status, requesterAgreed, receptionistAgreed }, role) {
  if (!["確認前", "合意待ち", "合意済み"].includes(status)) return status;
  if (requesterAgreed && receptionistAgreed) return "合意済み";
  return (role === "reception" ? receptionistAgreed : requesterAgreed) ? "合意待ち" : "確認前";
}
