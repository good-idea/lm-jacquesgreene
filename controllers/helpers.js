const fs = require('fs');
const path = require('path');
const json5 = require('json5');
const rev = require('git-rev');
const axios = require('axios');
const redis = require('redis');
const Q = require('q');

const client = redis.createClient();
client.on('error', (err) => {
	console.log(`Error: ${err}`);
});

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
	console.log(req.query);
	const host = (req.query.production === 'true') ? '205.186.136.28' : 'localhost';
	console.log(host);
	return axios.get(`http://${host}:3001/api/sites/${siteSlug}`);
};

exports.getBandsInTownWithCache = function getBandsInTownWithCache() {
	const deferred = Q.defer();

	client.get('bandsintown', (err, cached) => {
		if (cached) {
			console.log('Cached Result:');
			console.log(cached.substr(0, 25));
			deferred.resolve(JSON.parse(cached));
		} else {
			axios.get('http://api.bandsintown.com/artists/JacquesGreene/events.json?api_version=2.0&app_id=luckyme').then((response) => {
				console.log('Fresh Response:');
				const dates = response.data;
				console.log(JSON.stringify(dates).substr(0, 25));
				client.setex('bandsintown', 10, JSON.stringify(dates));
				deferred.resolve(dates);
			});
		}
	});
	return deferred.promise;
};

exports.getBandsInTown = function getBandsInTown() {
	return axios.get('http://api.bandsintown.com/artists/JacquesGreene/events.json?api_version=2.0&app_id=luckyme');
};
