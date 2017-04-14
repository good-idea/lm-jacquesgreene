const path = require('path');

const stems = function stems(input) {
	const content = Object.assign({}, input);

	const rootDir = content.stems.rootDir;
	content.stems.groups.map((group) => {
		const groupDir = group.dir;
		group.links.map((link) => {
			const filename = link.stemFileName || link.stemTitle;
			link.href = path.join(rootDir, groupDir, filename);
		});
	});

	return content;
};

module.exports = stems;
