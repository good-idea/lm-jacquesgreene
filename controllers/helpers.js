const fs = require('fs');
const path = require('path');
const json5 = require('json5');
const rev = require('git-rev');

exports.json = json5;

exports.getDirContents = function getDirContents(directory) {
	const returnFiles = new Promise((resolve, reject) => {
		const fullpath = path.join(__dirname, directory);
		console.log(fullpath);
		fs.readdir(fullpath, (err, files) => {
			if (err) { reject(err); }
			resolve(files);
		});
	});
	return returnFiles;
};

exports.getRevision = function getRevision() {
	const revision = {};
	rev.short((str) => { revision.short = str; });
	rev.long((str) => { revision.long = str; });
	rev.branch((str) => { revision.branch = str; });
	return revision;
};
