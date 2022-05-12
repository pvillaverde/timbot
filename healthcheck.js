const MiniDb = require('./minidb');
const moment = require('moment');
this._userDb = new MiniDb('twitch-users-v2');
this._lastUserRefresh = this._userDb.get('last-update') || null;

const now = moment();
if (this._lastUserRefresh) {
	console.log('Last user update was at', moment(this._lastUserRefresh).toISOString());
	if (now.diff(moment(this._lastUserRefresh), 'minutes') <= 15) {
		process.exit(0);
	} else {
		process.exit(1);
	}
} else {
	console.error('Not known last update');
	process.exit(1);
}
