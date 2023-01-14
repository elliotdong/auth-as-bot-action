import * as core from "@actions/core";
import { getBotInfo } from "./getBotInfo";

(async () => {

  const exportVariable = process.env.EXPORT_NAME || 'GITHUB_TOKEN'
  const githubAppPem = process.env.GITHUB_APP_PEM;

  if (!githubAppPem) {
    core.setFailed("Please add the GITHUB_APP_PEM to the env");
    return;
  }

  const githubAppId = process.env.GITHUB_APP_ID;

  if(!githubAppId) {
    core.setFailed("Please add the GITHUB_APP_ID to the env");
    return;
  }

  const accountId = process.env.ACCOUNT_ID;
  const botInfo = await getBotInfo(githubAppId, githubAppPem, accountId);

  core.setSecret(botInfo.token)
  core.exportVariable(exportVariable, botInfo.token)
  
  // process.env[exportVariable] = githubToken;
})().catch((err) => {
  console.error(err);
  core.setFailed(err.message);
});
