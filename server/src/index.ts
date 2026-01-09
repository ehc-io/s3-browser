import { app } from './app';
import { env } from './config/env';

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`S3 Browser server running on http://localhost:${PORT}`);
  console.log(`AWS Region: ${env.AWS_REGION}`);
});
