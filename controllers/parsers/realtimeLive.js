function padLeft(str, padLength = 2) {
	if (str.toString().length < padLength) return `0${str}`;
	return str;
}

const realtimeLive = function realtimeLive(input) {
	const content = Object.assign({}, input);

	// -- For BIT supplied livedates
	const livedates = [];
	const now = new Date();
	const monthnames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	for (const livedate of content.live.livedates) {
		const date = new Date(Date.parse(livedate.datetime));
		if (date >= now) {
			livedate.date = `${monthnames[date.getMonth()]} ${padLeft(date.getDate())}`;
			if (livedate.venue.country === 'United States' || livedate.venue.country === 'Canada') {
				livedate.location = `${livedate.venue.city}, ${livedate.venue.region}`;
			} else {
				livedate.location = `${livedate.venue.city}, ${livedate.venue.country}`;
			}
			livedates.push(livedate);
		}
	}

	// replace the original with the updated content
	content.live.livedates = livedates;

	content.purchase.copy = content.purchase.copy.replace(/\n/g, '<br />');

	return content;
}

module.exports = realtimeLive;
