import { TURSO_TOKEN, TURSO_URL } from "@/constants/credentials.env";
import { createClient } from "@libsql/client";

const client = createClient({
  authToken: TURSO_TOKEN!,
  url: TURSO_URL!,
});

export default client;
