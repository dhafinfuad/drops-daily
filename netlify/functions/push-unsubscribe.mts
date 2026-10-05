import { getDeviceStore, type PushDeviceRecord } from "./_shared/stores.mts";
import { assertString, verifySecret } from "./_shared/auth.mts";
import { errorResponse, json, readJson } from "./_shared/http.mts";
export default async function(req:Request){try{const body=await readJson(req);assertString(body.deviceId,"deviceId",100);assertString(body.deviceSecret,"deviceSecret",256);const store=getDeviceStore(),key=`device/${body.deviceId}`;const device=await store.get(key,{type:"json",consistency:"strong"}) as PushDeviceRecord|null;if(!device)return json({ok:true});if(!verifySecret(body.deviceSecret,device.secretHash))return json({error:"Device authentication failed"},{status:403});await store.delete(key);return json({ok:true});}catch(error){return errorResponse(error);}}
