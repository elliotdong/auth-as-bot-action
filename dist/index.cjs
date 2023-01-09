'use strict';

const core = require('@actions/core');
const jwt = require('jsonwebtoken');
const ofetch = require('ofetch');

function _interopNamespaceDefault(e) {
  const n = Object.create(null);
  if (e) {
    for (const k in e) {
      n[k] = e[k];
    }
  }
  n.default = e;
  return n;
}

const core__namespace = /*#__PURE__*/_interopNamespaceDefault(core);

(async () => {
  const exportVariable = core__namespace.getInput("exportName") || "GITHUB_TOKEN";
  const githubAppPem = process.env.GITHUB_APP_PEM;
  if (!githubAppPem) {
    core__namespace.setFailed("Please add the GITHUB_APP_PEM to the auth-as-bot action");
    return;
  }
  const githubAppId = process.env.GITHUB_APP_ID;
  if (!githubAppId) {
    core__namespace.setFailed("Please add the GITHUB_APP_ID to the auth-as-bot action");
    return;
  }
  const now = Math.floor(Date.now() / 1e3);
  const jwtToken = jwt.sign({
    "iat": now - 60,
    "exp": now + 600,
    "iss": githubAppId
  }, githubAppPem, {
    algorithm: "RS256"
  });
  const installationsResp = await ofetch.ofetch("https://api.github.com/app/installations", {
    headers: {
      "Authorization": `Bearer ${jwtToken}`
    }
  });
  if (!installationsResp || !Array.isArray(installationsResp) || installationsResp.length === 0) {
    core__namespace.setFailed("May be you haven't install the github app in your account, github api response: " + JSON.stringify(installationsResp));
    return;
  }
  const accountId = installationsResp[0].id;
  const accessTokenResp = await ofetch.ofetch(`https://api.github.com/app/installations/${accountId}/access_tokens`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${jwtToken}`
    }
  });
  const githubToken = accessTokenResp.token;
  if (!githubToken) {
    core__namespace.setFailed("Get Access Token from Github Failed, res: " + JSON.stringify(accessTokenResp));
    return;
  }
  process.env[exportVariable] = githubToken;
})().catch((err) => {
  console.error(err);
  core__namespace.setFailed(err.message);
});
