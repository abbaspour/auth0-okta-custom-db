/**
 * This is a sample script that creates a user in Okta UD
 * when a user is created in Auth0.
 *
 * @param {{email: string, password: string, user_metadata?: {}}} user
 * @param {function} callback
 */
function create(user, callback) {
    const {OKTA_DOMAIN, OKTA_SWSS} = configuration;
    (async () => {
        user.user_metadata = user.user_metadata || {};
        const uDUser = {
            profile: {
                // These can be populated Management API v2
                // or via signup from auth0 hosted pages
                firstName: user.user_metadata.given_name || 'firstName',
                lastName: user.user_metadata.family_name || 'lastName',
                email: user.email,
                login: user.email,
                phoneNumber: user.user_metadata.phone_number,
            },
            credentials: {
                password: {
                    value: user.password,
                },
            },
        };
        const url = new URL(`/api/v1/users?activate=true`, OKTA_DOMAIN);

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `SSWS ${OKTA_SWSS}`,
                },
                body: JSON.stringify(uDUser),
            });
            if (response.status !== 200) {
                callback(
                    new ValidationError("user_exists", await response.text())
                );
                return;
            }
            callback(null);
        } catch (unexpected) {
            console.error("Unexpected Error", unexpected);
            callback(unexpected);
        }
    })();
}
  