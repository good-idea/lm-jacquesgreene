const fs = require('fs');
const path = require('path');
const json5 = require('json5');
const rev = require('git-rev');
const axios = require('axios');

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


exports.getSite = function getApiData(req, siteSlug = 'jacquesgreene') {
	const host = (req.query.production === 'true') ? '205.186.136.28' : 'localhost';
	return axios.get(`http://${host}:3001/api/sites/${siteSlug}`);
};

exports.getBandsInTown = function getBandsInTown() {
	return axios.get('http://api.bandsintown.com/artists/JacquesGreene/events.json?api_version=2.0&app_id=luckyme');
};
