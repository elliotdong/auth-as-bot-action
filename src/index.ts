import * as core from "@actions/core";
import jwt from 'jsonwebtoken';
import { ofetch } from 'ofetch'

(async () => {

  const exportVariable = core.getInput('exportName') || 'GITHUB_TOKEN'
  const githubAppPem = process.env.GITHUB_APP_PEM;

  if (!githubAppPem) {
    core.setFailed("Please add the GITHUB_APP_PEM to the auth-as-bot action");
    return;
  }

  const githubAppId = process.env.GITHUB_APP_ID;

  if(!githubAppId) {
    core.setFailed("Please add the GITHUB_APP_ID to the auth-as-bot action");
    return;
  }

  const now = Math.floor(Date.now() / 1000);

  const jwtToken = jwt.sign({
    'iat': now - 60,
    'exp': now + 600, 
    'iss': githubAppId
  }, githubAppPem, {
    algorithm: 'RS256'
  });

  const installationsResp = (await ofetch("https://api.github.com/app/installations", {
    headers: {
      'Authorization': `Bearer ${jwtToken}`
    }
  }));

  if(!installationsResp || !Array.isArray(installationsResp) || installationsResp.length === 0) {
    core.setFailed("May be you haven't install the github app in your account, github api response: " + JSON.stringify(installationsResp));
    return;
  }

  // FIXME: 根据触发信息筛选出来确切的用户id
  const accountId = installationsResp[0].id as string;

  const accessTokenResp = (await ofetch(`https://api.github.com/app/installations/${accountId}/access_tokens`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwtToken}`
    }
  }));

  const githubToken = accessTokenResp.token;

  if (!githubToken) {
    core.setFailed("Get Access Token from Github Failed, res: " + JSON.stringify(accessTokenResp));
    return;
  }

  // core.exportVariable('AAB_TOKEN', githubToken)
  process.env[exportVariable] = githubToken;
})().catch((err) => {
  console.error(err);
  core.setFailed(err.message);
});
