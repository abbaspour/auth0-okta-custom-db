/**
 * This is a sample script that calls the Okta Platform API
 * to update a user password. Since we only get the email we are relying
 * on Email being unique.
 *
 * The script will first fetch the user by email, then use the user_id
 * to update the Password.
 *
 * @param {string} email
 * @param {string} newPassword
 * @param {function} callback
 */
function changePassword(email, newPassword, callback) {
    const {OKTA_DOMAIN, OKTA_SWSS} = configuration;
    (async () => {
        const getUserURL = new URL(
            `/api/v1/users/${encodeURIComponent(email)}`,
            OKTA_DOMAIN
        );

        const headers = {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `SSWS ${OKTA_SWSS}`,
        };

        try {
            const response = await fetch(getUserURL, {
                method: "GET",
                headers,
            });

            // Ensure we have a successful response
            if (response.status !== 200) {
                return callback(new Error("Failed to update password" + response.statusText));
            }

            const existingUser = await response.json();
            const {id} = existingUser;

            const updateUserUrl = new URL(`/api/v1/users/${id}`, OKTA_DOMAIN);
            const updateResponse = await fetch(updateUserUrl, {
                method: "POST",
                body: JSON.stringify({
                    credentials: {
                        password: {
                            value: newPassword
                        },
                    },
                }),
                headers,
            });

            if (updateResponse.status !== 200) {
                callback(new Error("Failed to update password" + updateResponse.statusText));
                return;
            }

            callback(null, true);
        } catch (unexpected) {
            console.error("Unexpected Error");
            callback(unexpected);
        }
    })();
}