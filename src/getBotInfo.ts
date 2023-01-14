import jwt from "jsonwebtoken";
import { ofetch } from "ofetch";

/**
 *
 * @param githubAppId
 * @param githubAppPem
 * @param accountId if accountId doesn't provide, will return the first user
 */
export const getBotInfo = async (
  githubAppId: string,
  githubAppPem: string,
  accountId?: string
) => {
  const now = Math.floor(Date.now() / 1000);

  const jwtToken = jwt.sign(
    {
      iat: now - 60,
      exp: now + 600,
      iss: githubAppId,
    },
    githubAppPem,
    {
      algorithm: "RS256",
    }
  );
  const installationsResp = await ofetch(
    "https://api.github.com/app/installations",
    {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }
  );

  if (
    !installationsResp ||
    !Array.isArray(installationsResp) ||
    installationsResp.length === 0
  ) {
    throw (
      "May be you haven't install the github app in your account, github api response: " +
      JSON.stringify(installationsResp)
    );
  }

  let installAppId = '0';

  if (!accountId) {
    installAppId = installationsResp[0].id as string;
  } else {
    const foundInstaller = installationsResp.find((installer) => installer.target_id == accountId);
    if(!foundInstaller) {
      throw 'Noting installer can be found in accountId, github api response:' + JSON.stringify(installationsResp);
    }
    installAppId = foundInstaller.id;
  }

  const githubToken = (
    await ofetch(
      `https://api.github.com/app/installations/${installAppId}/access_tokens`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    )
  ).token;

  const botName = (await ofetch(
    `https://api.github.com/app`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }
  )).slug;
  return {
    token: githubToken,
    bot: {
        name: `${botName}[bot]`,
        email: `${botName}[bot]@users.noreply.github.com`,
    }
  }
};
