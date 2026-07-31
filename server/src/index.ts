import { app } from './app';
import { env } from './config/env';
import { authEnabled } from './middleware/basicAuth';

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`S3 Browser server running on http://localhost:${PORT}`);
  console.log(`AWS Region: ${env.AWS_REGION}`);
  console.log(
    authEnabled
      ? 'HTTP basic auth: ENABLED'
      : 'HTTP basic auth: DISABLED (set S3BROWSER_AUTH_USER and S3BROWSER_AUTH_PASSWORD)'
  );
});
