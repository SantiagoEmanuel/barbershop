import app from "./config";
import { PORT } from "./constants/credentials.env";

app.listen(PORT, () => {
  console.log(`Server running`);
});
