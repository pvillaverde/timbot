const axios = require('axios');
const fs = require('fs');
const config = require('./config.json');
const MiniDb = require('./minidb');
const liveMessageDb = new MiniDb('live-messages');
let lastError = liveMessageDb.get('last-error') || null;
const moment = require('moment');
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

		lastError = moment();
		liveMessageDb.put('last-error', lastError);
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
			const maxPerRequest = 100;
			const requestsChannels = channelNames.reduce((resultArray, item, index) => {
				const chunkIndex = Math.floor(index / maxPerRequest);
				if (!resultArray[chunkIndex]) {
					resultArray[chunkIndex] = []; // start a new chunk
				}
				resultArray[chunkIndex].push(item);
				return resultArray;
			}, []);
			const requests = requestsChannels.map((cNames) => axios.get(`/streams?user_login=${cNames.join('&user_login=')}`, this.requestOptions));
			axios.all(requests)
				.then(
					axios.spread((...responses) => {
						const streams = responses.reduce((array, item, index) => array.concat(item.data.data || []), []);
						resolve(streams);
					})
				)
				.catch((errors) => {
					const err = errors[0] ? errors[0] : errors;
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
			const maxPerRequest = 100;
			const requestsChannels = channelNames.reduce((resultArray, item, index) => {
				const chunkIndex = Math.floor(index / maxPerRequest);
				if (!resultArray[chunkIndex]) {
					resultArray[chunkIndex] = []; // start a new chunk
				}
				resultArray[chunkIndex].push(item);
				return resultArray;
			}, []);
			const requests = requestsChannels.map((cNames) => axios.get(`/users?login=${cNames.join('&login=')}`, this.requestOptions));
			axios.all(requests)
				.then(
					axios.spread((...responses) => {
						const channels = responses.reduce((array, item, index) => array.concat(item.data.data || []), []);
						resolve(channels);
					})
				)
				.catch((errors) => {
					const err = errors[0] ? errors[0] : errors;
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
						console.log(gameIds);
						this.handleApiError(err);
						return resolve([]);
					}
				});
		});
	}
}

module.exports = TwitchApi;
