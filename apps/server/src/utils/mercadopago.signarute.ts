import { MP_WEBHOOK_SECRET } from "@/constants/credentials.env";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Docs: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks#editor_22
 */
export function verifyMpSignature(params: {
  signature: string | undefined;
  requestId: string | undefined;
  dataId: string;
}): boolean {
  const { signature, requestId, dataId } = params;

  if (!signature || !requestId) return false;

  const parts = signature.split(",").reduce(
    (acc, part) => {
      const [key, value] = part.trim().split("=");
      if (key && value) acc[key] = value;
      return acc;
    },
    {} as Record<string, string>,
  );

  const ts = parts.ts;
  const v1 = parts.v1;

  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;

  const expected = createHmac("sha256", MP_WEBHOOK_SECRET)
    .update(manifest)
    .digest("hex");

  try {
    const expectedBuf = Buffer.from(expected, "hex");
    const receivedBuf = Buffer.from(v1, "hex");

    if (expectedBuf.length !== receivedBuf.length) return false;
    return timingSafeEqual(expectedBuf, receivedBuf);
  } catch {
    return false;
  }
}
