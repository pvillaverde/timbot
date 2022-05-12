const MiniDb = require('./minidb');
const moment = require('moment');
const liveMessageDb = new MiniDb('live-messages');
const lastError = liveMessageDb.get('last-error') || null;

const now = moment();
if (lastError) {
	console.log('Last error was at', moment(lastError).toISOString());
	if (now.diff(moment(lastError), 'minutes') <= 5) {
		process.exit(1);
	} else {
		process.exit(0);
	}
} else {
	console.error('Not known last error');
	process.exit(0);
}
