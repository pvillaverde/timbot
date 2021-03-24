const axios = require('axios');
const fs = require('fs');
const config = require('./config.json');

/**
 * Twitch Helix API helper ("New Twitch API").
 */
class TwitchApi {
	static get tokenPath() {
		return 'twitch-token.json';
	}
	static get requestOptions() {
		// Automatically remove "oauth:" prefix if it's present
		const oauthPrefix = 'oauth:';
		let oauthBearer;
		try {
			oauthBearer = JSON.parse(fs.readFileSync(this.tokenPath)).access_token;
		} catch (error) {
			oauthBearer = 'noAuth';
		}
		if (oauthBearer.startsWith(oauthPrefix)) {
			oauthBearer = oauthBearer.substr(oauthPrefix.length);
		}
		// Construct default request options
		return {
			baseURL: 'https://api.twitch.tv/helix/',
			headers: {
				'Client-ID': config.twitch_client_id,
				Authorization: `Bearer ${oauthBearer}`,
			},
		};
	}

	static handleApiError(err) {
		const res = err.response || {};

		if (res.data && res.data.message) {
			console.error('[TwitchApi]', 'API request failed with Helix error:', res.data.message, `(${res.data.error}/${res.data.status})`);
		} else {
			console.error('[TwitchApi]', 'API request failed with error:', err.message || err);
		}
	}

	static getAccessToken() {
		// https://dev.twitch.tv/docs/authentication/getting-tokens-oauth
		return axios
			.post(
				`https://id.twitch.tv/oauth2/token?client_id=${config.twitch_client_id}&client_secret=${config.twitch_client_secret}&grant_type=client_credentials`
			)
			.then((res) => {
				fs.writeFileSync(this.tokenPath, JSON.stringify(res.data));
				return res.data;
			})
			.catch((err) => this.handleApiError(err));
	}

	static fetchStreams(channelNames) {
		return new Promise((resolve, reject) => {
			axios.get(`/streams?user_login=${channelNames.join('&user_login=')}`, this.requestOptions)
				.then((res) => {
					resolve(res.data.data || []);
				})
				.catch((err) => {
					if (err.response.status === 401) {
						return this.getAccessToken().then((token) => this.fetchStreams(channelNames));
					} else {
						this.handleApiError(err);
					}
				});
		});
	}

	static fetchUsers(channelNames) {
		return new Promise((resolve, reject) => {
			axios.get(`/users?login=${channelNames.join('&login=')}`, this.requestOptions)
				.then((res) => {
					resolve(res.data.data || []);
				})
				.catch((err) => {
					if (err.response.status === 401) {
						return this.getAccessToken().then((token) => this.fetchUsers(channelNames));
					} else {
						this.handleApiError(err);
					}
				});
		});
	}

	static fetchGames(gameIds) {
		return new Promise((resolve, reject) => {
			axios.get(`/games?id=${gameIds.join('&id=')}`, this.requestOptions)
				.then((res) => {
					resolve(res.data.data || []);
				})
				.catch((err) => {
					if (err.response.status === 401) {
						return this.getAccessToken().then((token) => this.fetchGames(gameIds));
					} else {
						this.handleApiError(err);
					}
				});
		});
	}
}

module.exports = TwitchApi;
