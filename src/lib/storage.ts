// Reads objects from the Neon project's private object-storage bucket.
// Server-only: the AWS_* credentials (written by `neon env pull`) never reach
// the browser, and the bucket stays private — the site serves what it needs
// through its own route (app/media/[...key]/route.ts).

import "server-only";
import { AwsClient } from "aws4fetch";

export const MEDIA_BUCKET = "media";

let client: AwsClient | null | undefined;

function getClient() {
  if (client === undefined) {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();
    const region = process.env.AWS_REGION?.trim();
    client =
      accessKeyId && secretAccessKey && region && process.env.AWS_ENDPOINT_URL_S3
        ? new AwsClient({ accessKeyId, secretAccessKey, region, service: "s3" })
        : null;
    if (!client) console.warn("[storage] AWS_* object-storage variables are not set — logos fall back to company names.");
  }
  return client;
}

/** GET an object (path-style addressing, which Neon's endpoint certificate supports). */
export async function getObject(key: string) {
  const aws = getClient();
  if (!aws) return null;
  const endpoint = process.env.AWS_ENDPOINT_URL_S3!.trim().replace(/\/$/, "");
  const path = key.split("/").map(encodeURIComponent).join("/");
  return aws.fetch(`${endpoint}/${MEDIA_BUCKET}/${path}`, {
    signal: AbortSignal.timeout(8000),
    cache: "no-store", // the route sets its own long cache headers
  });
}
