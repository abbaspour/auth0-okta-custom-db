/**
 * Handler for Custom Database Action Script, this invokes
 * Resource Owner grant on Okta. Once that has been completed
 * it will invoke the /userinfo endpoint to get the full profile
 *
 * @param {string} email
 * @param {string} password
 * @param {(err:Error|null, user: User) => void} callback
 */
function loginWithUniversalDirectory(email, password, callback) {
    (async () => {
        try {
            const authorization = `Basic ${btoa(
                configuration.CLIENT_ID + ":" + configuration.CLIENT_SECRET
            )}`;
            const response = await fetch(
                new URL("oauth2/default/v1/token", configuration.OKTA_DOMAIN),
                {
                    method: "POST",
                    body: new URLSearchParams({
                        username: email,
                        grant_type: "password",
                        password: password,
                        scope: "openid profile email phone address",
                    }),
                    headers: {
                        accept: "application/json",
                        "content-type": "application/x-www-form-urlencoded",
                        authorization: authorization,
                    },
                }
            );

            const result = await response.json();
            if (result.error) {
                callback(new Error(result.error_description));
                return;
            }

            const token = result.access_token;
            const userinfoUrl = new URL("/oauth2/default/v1/userinfo", configuration.OKTA_DOMAIN);
            const userinfoResponse = await fetch(userinfoUrl, {
                method: "GET",
                headers: {
                    'authorization': `Bearer ${token}`,
                    'accept': 'application/json',
                }
            });

            const userInfo = await userinfoResponse.json();
            const {sub, ...rest} = userInfo;
            const user = {
                user_id: sub,
                ...rest
            };
            callback(null, user);
        } catch (unexpected) {
            console.error("Unexpected Error", unexpected);
            callback(unexpected);
        }
    })();
}