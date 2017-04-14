const path = require('path');

const stems = function stems(input) {
	const content = Object.assign({}, input);

	const rootDir = content.stems.rootDir;
	content.stems.groups.map((group) => {
		const groupDir = group.dir;
		group.links.map((link) => {
<<<<<<< HEAD
			const filename = link.stemFileName;
			link.display = link.stemTitle || link.stemFileName;
=======
			const filename = link.stemFileName || link.stemTitle;
>>>>>>> ef7c0020de7b44bb05512328bcfc181fb3755b4e
			link.href = path.join(rootDir, groupDir, filename);
		});
	});

	return content;
};

module.exports = stems;
