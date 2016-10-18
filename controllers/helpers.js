const fs = require('fs');
const path = require('path');
const json5 = require('json5');

exports.json = json5;

exports.getDirContents = function getDirContents(directory) {
	const returnFiles = new Promise((resolve, reject) => {
		const fullpath = path.join(__dirname, directory);
		console.log(fullpath);
		fs.readdir(fullpath, (err, files) => {
			if (err) { reject(err); }
			resolve(files)
		});
	});
	return returnFiles;
};
