const Discord = require('discord.js');
const moment = require('moment');
const humanizeDuration = require('humanize-duration');
const config = require('./config.json');

class LiveEmbed {
	static createForStream(streamData) {
		const isLive = streamData.type === 'live';
		const allowBoxArt = config.twitch_use_boxart;

		let msgEmbed = new Discord.MessageEmbed();
		let authorMessage, embedColor, liveMessage;
		if (isLive) {
			embedColor = '#9146ff';
			authorMessage = `${streamData.user_name} está agora en directo!`;
			liveMessage = `:red_circle: Emitindo con ${streamData.viewer_count} espectadores`;
			msgEmbed.setDescription(
				`Axiña, [preme para velo en twitch](https://twitch.tv/${(streamData.login || streamData.user_name).toLowerCase()})`
			);
		} else {
			embedColor = 'GREY';
			authorMessage = `${streamData.user_name} estivo en directo!**`;
			liveMessage = `:white_circle: A emisión xa rematou.`;
		}
		msgEmbed.setColor(embedColor);
		msgEmbed.setAuthor(authorMessage, streamData.profile_image_url);
		msgEmbed.setURL(`https://twitch.tv/${(streamData.login || streamData.user_name).toLowerCase()}`);
		msgEmbed.setTitle(streamData.title);

		// Thumbnail
		let thumbUrl = streamData.profile_image_url;

		if (allowBoxArt && streamData.game && streamData.game.box_art_url) {
			thumbUrl = streamData.game.box_art_url;
			thumbUrl = thumbUrl.replace('{width}', '288');
			thumbUrl = thumbUrl.replace('{height}', '384');
		}

		msgEmbed.setThumbnail(thumbUrl);

		// Add game
		if (streamData.game) {
			let gameMessage;
			switch (streamData.game.name) {
				case 'Just Chatting':
					gameMessage = `De Parola™`;
					break;
				case 'Talk Shows & Podcasts':
					gameMessage = `Podcasts e De Parola™`;
					break;
				default:
					gameMessage = streamData.game.name;
					break;
			}
			msgEmbed.addField('A qué andamos?', gameMessage, false);
		}
		// Add status
		msgEmbed.addField('Estado', liveMessage, true);

		if (isLive) {
			// Set main image (stream preview)
			let imageUrl = streamData.thumbnail_url;
			imageUrl = imageUrl.replace('{width}', '1280');
			imageUrl = imageUrl.replace('{height}', '720');
			let thumbnailBuster = (Date.now() / 1000).toFixed(0);
			imageUrl += `?t=${thumbnailBuster}`;
			msgEmbed.setImage(imageUrl);
		}
		// Add uptime
		let now = moment();
		let startedAt = moment(streamData.started_at);
		let streamDuration = humanizeDuration(now - startedAt, {
			delimiter: ', ',
			largest: 2,
			round: true,
			units: ['y', 'mo', 'w', 'd', 'h', 'm'],
			language: 'gl',
			fallbacks: ['gl', 'es'],
		});

		msgEmbed.addField('Tempo en emisión', streamDuration, true);

		return msgEmbed;
	}
}

module.exports = LiveEmbed;
