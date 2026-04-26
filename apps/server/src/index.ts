import app from "@/app/app";
import { PORT } from "@/constants/credentials.env";

app.listen(PORT, () => {
  console.log("Server running");
});
