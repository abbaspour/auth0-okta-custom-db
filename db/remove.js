/**
 * This script will delete a user in UD using Okta Platform API
 * since Okta API does not allow an immediate delete, we first
 * deactivate the user and then remove them completely.
 *
 * @param {string} id
 * @param {(err:null|Error) => void} callback
 */
function remove(id, callback) {
    const {OKTA_SWSS, OKTA_DOMAIN} = configuration;
    (async () => {
        try {
            // https://auth0.com/docs/authenticate/database-connections/custom-db/templates/delete#definition
            const udUserId = id.replace("auth0|", ""); // remove auth0 prefix
            const deactivateUrl = new URL(
                `/api/v1/users/${udUserId}/lifecycle/deactivate?sendEmail=false`,
                OKTA_DOMAIN
            );
            const deleteUrl = new URL(`/api/v1/users/${udUserId}`, OKTA_DOMAIN); // Delete
            const headers = {
                Authorization: `SSWS ${OKTA_SWSS}`,
                Accept: "application/json",
                "Content-Type": "application/json",
            };

            const deActivateResponse = await fetch(deactivateUrl, {
                method: "POST",
                headers,
            });
            if (deActivateResponse.status !== 200) {
                callback(
                    new Error("Error deactivating " + deActivateResponse.statusText)
                );
                return;
            }

            const deleteResponse = await fetch(deleteUrl, {
                method: "DELETE",
                headers,
            });

            if (deleteResponse.status !== 204) {
                callback(new Error("Error deleting " + deActivateResponse.statusText));
                return;
            }

            callback(null);
        } catch (unexpected) {
            callback(unexpected);
        }
    })();
}
