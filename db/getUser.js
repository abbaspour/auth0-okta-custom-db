/**
 * This method fetches the user from UD using Okta Platform API
 * this is relying on email being the primary identifier
 *
 * @param {string} email
 * @param {*} callback
 */
function getByEmailFromUniversalDirectory(email, callback) {
    const {OKTA_DOMAIN, OKTA_SWSS} = configuration;
    (async () => {
        // Replace {yourOktaDomain} with your own Okta domain
        const url = new URL(
            `/api/v1/users/${encodeURIComponent(email)}`,
            OKTA_DOMAIN
        );

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `SSWS ${OKTA_SWSS}`,
                },
            });

            // Allow Successful state
            if (response.status === 404) {
                callback();
                return;
            }

            if (response.status !== 200) {
                callback(new Error("Could not validate user status" + response.statusText));
                return;
            }


            const user = await response.json();

            return callback(null, {
                user_id: user.id,
                // username: user.profile.login,
                email: user.profile.login,
                // @todo: We want to estabilish if using auth0 or okta for this.
                // email_verified: false,
                given_name: user.profile.firstName,
                family_name: user.profile.lastName,
                name: user.profile.firstName + " " + user.profile.lastName,
            });
        } catch (unexpected) {
            callback(unexpected);
        }
    })();
}
  