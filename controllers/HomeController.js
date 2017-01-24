// TODO::: Use site meta as fallback or when overwritten
const axios = require('axios');

const parsers = require('./parsers');
const helpers = require('./helpers');

const siteSlug = 'jacquesgreene';
const apiKey = 'Qye38eD6MD2BU844Ryw32fi8';

exports.resolveSoundcloud = (req, res) => {
	const host = (req.query.production === 'true') ? '205.186.136.28' : 'localhost';
	const url = req.params.url || req.query.url;
	axios.get(`//${host}:3001/api/resources/resolveSoundcloud/${url}`, {
		params: {
			key: apiKey,
		},
	}).then(response => res.json(response));
};

exports.SongkickEmbed = (req, res) => res.render('songkick');

exports.Index = (req, res) => {
	const revision = helpers.getRevision();

	function getApiData() {
		const host = (req.query.production === 'true') ? '205.186.136.28' : 'localhost';
		return axios.get(`http://${host}:3001/api/sites/${siteSlug}`);
	}

	function getBandsInTown() {
		return axios.get('http://api.bandsintown.com/artists/JacquesGreene/events.json?api_version=2.0&app_id=luckyme');
	}

	axios.all([getApiData(), getBandsInTown()]).then(axios.spread((siteResponse, BITResponse) => {
		const site = siteResponse.data.doc;
		if (!site) res.json({ error: `No site with the slug '${siteSlug}' was found` });
		if (site.pages.length < 1) res.json({ error: 'There are no pages associated with the site' });

		let homepage = (req.query.homepage) ? site.pages.find(s => s.slug === req.query.homepage) : site.pages.find(s => s.slug === site.homepage);
		// let homepage = site.pages.find((s) => s.slug === 'afterglow');
		if (!homepage) homepage = site.pages[0];

		const template = homepage.template || 'afterglow';
		let content = (homepage.content);
		content.live.livedates = BITResponse.data;
		content = parsers[template](homepage.content);
		content.meta = parsers.combineMeta(site.content.meta, homepage.content.meta);

		if (req.query.content === 'true') {
			return res.json(content);
		}

		return res.render(template,
			{
				content,
				revision,
			});
	})).catch((error) => {
		console.log(error);
		res.json(error);
	});
};
