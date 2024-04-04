async function login(username, password, callback) {
    const axios = require('axios');
    const jwt_decode = require('jwt-decode');

    try {
        const {data, status} = await axios({
            method: 'post',
            url: `https://${configuration.OKTA_DOMAIN}/oauth2/v1/token`,
            data: {
                grant_type: "password",
                scope: 'openid profile email',
                username: username,
                password: password
            },
            headers: {
                'accept': 'application/json',
                'content-type' : 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' +
                    Buffer.from(`${configuration.OKTA_CLIENT_ID}:${configuration.OKTA_CLIENT_SECRET}`).toString('base64')
            },
            timeout: 5000 // 5 sec
        });

        if (status !== 200 || !data.id_token)
            return callback(`incorrect status code: ${status}`);

        const profile = {};
        const jwt = jwt_decode(data.id_token);
        profile.name = jwt.name || '';
        profile.nickname = jwt.nickname || '';
        profile.email = jwt.email;
        profile.email_verified = jwt.email_verified || false;

        callback(null, profile);

    } catch (e) {
        return callback(e);
    }
}


