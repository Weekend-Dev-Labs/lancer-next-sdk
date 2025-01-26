import { type NextRequest } from "next/server";
import cyrpto from "node:crypto";
import { SessionAuthGrant } from "./types";

// Lancer Class : It includes base functions which required for handling authentication and webhooks.
export class Lancer {
  #webhookSecret: string = "";
  constructor({ webhookSecret }: { webhookSecret?: string }) {
    this.#webhookSecret = webhookSecret;
  }

  // Webhook Handler
  handleWebhook(
    handler: (
      event: lancerTypes.WebhookEvent<lancerTypes.UFile | lancerTypes.Session>
    ) => Promise<Response>,
    verification?: boolean
  ) {
    return async function (req: NextRequest) {
      let payload = {};
      if (verification) {
        const timestamp = req.headers.get("x-timestamp");
        const signature = req.headers.get("x-signature");

        if (!timestamp || !signature) {
          return Response.json(
            { message: "access restricted" },
            { status: 403 }
          );
        }

        payload = await req.json();
        const stringifyPayload = JSON.stringify(payload);

        const message = `${timestamp}.${stringifyPayload}`;
        const hmac = cyrpto.createHmac("sha256", this.#webhookSecret);
        hmac.update(message);
        const expectedSignature = hmac.digest("hex");

        const isVerified = cyrpto.timingSafeEqual(
          Buffer.from(signature),
          Buffer.from(expectedSignature)
        );

        if (isVerified) {
          return handler(
            payload as lancerTypes.WebhookEvent<
              lancerTypes.Session | lancerTypes.UFile
            >
          );
        }

        return Response.json({ message: "access restricted" }, { status: 403 });
      }

      payload = await req.json();

      return handler(
        payload as lancerTypes.WebhookEvent<
          lancerTypes.UFile | lancerTypes.Session
        >
      );
    };
  }

  // Authentication handler
  authenticate(
    handler: (
      token: string,
      payload: lancerTypes.SessionRequest
    ) => Promise<SessionAuthGrant>
  ) {
    return async function (req: NextRequest) {
      try {
        const token = req.headers.get("Authorization")[1];

        if (!token) {
          return Response.json({}, { status: 403 });
        }

        const payload = await req.json();

        const grantInfo = await handler(token, payload);

        if (grantInfo?.ownerId) {
          return Response.json({ ownerId: grantInfo.ownerId }, { status: 200 });
        }

        return Response.json({ ...grantInfo }, { status: grantInfo.status });
      } catch (error) {
        return Response.json({ message: error?.message }, { status: 500 });
      }
    };
  }
}
