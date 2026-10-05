import { json } from "./_shared/http.mts";
export default async function() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) return json({ error:"VAPID public key not configured" }, { status:500 });
  return json({ publicKey });
}
