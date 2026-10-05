import { getDeviceStore, type PushDeviceRecord } from "./_shared/stores.mts";
import { assertString, hashSecret } from "./_shared/auth.mts";
import { errorResponse, json, readJson } from "./_shared/http.mts";
export default async function(req: Request) {
  try {
    const body = await readJson(req);
    assertString(body.deviceId,"deviceId",100); assertString(body.deviceSecret,"deviceSecret",256);
    assertString(body.subscription?.endpoint,"subscription.endpoint",8192);
    assertString(body.subscription?.keys?.p256dh,"subscription.keys.p256dh",1024);
    assertString(body.subscription?.keys?.auth,"subscription.keys.auth",1024);
    const store = getDeviceStore(); const key = `device/${body.deviceId}`;
    const existing = await store.get(key,{type:"json",consistency:"strong"}) as PushDeviceRecord|null;
    const incomingHash = hashSecret(body.deviceSecret);
    if (existing && existing.secretHash !== incomingHash) return json({error:"Device authentication failed"},{status:403});
    const record:PushDeviceRecord = { deviceId:body.deviceId, secretHash:incomingHash, subscription:body.subscription, revision:existing?.revision??0, active:true, updatedAt:Date.now() };
    await store.setJSON(key,record); return json({ok:true});
  } catch (error) { return errorResponse(error); }
}
