import app from "./app.js";
import { ENV } from "./config/env.js";

app.listen(ENV.PORT, () => {
  console.log(`🚀 MagicSub Railway running on ${ENV.PORT}`);
});
