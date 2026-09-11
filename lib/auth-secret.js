if (process.env.NODE_ENV === "production" && !process.env.NEXTAUTH_SECRET) {
  throw new Error("本番環境ではNEXTAUTH_SECRETを設定してください。");
}
export const authSecret = process.env.NEXTAUTH_SECRET || "dev-insecure-secret";
