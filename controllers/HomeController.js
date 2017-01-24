// TODO::: Use site meta as fallback or when overwritten
const axios = require('axios');

const parsers = require('./parsers');
const helpers = require('./helpers');

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

exports.SongkickEmbed = (req, res) => {
	const revision = helpers.getRevision();
	helpers.getSite(req).then((response) => {
		const site = response.data.doc;
		const homepage = site.pages.find(s => s.slug === 'tour2017');
		const content = Object.assign({}, homepage.content);
		content.meta = parsers.combineMeta(site.content.meta, homepage.content.meta);
		res.render('songkick', { content, revision });
	});
};

exports.redisTest = (req, res) => {
	console.log(req.query);
	const revision = helpers.getRevision();
	const siteSlug = 'jacquesgreene';
	axios.all([helpers.getSite(req), helpers.getBandsInTownWithCache()]).then(axios.spread((siteResponse, BITResponse) => {
		const content = {};
		content.siteContent = siteResponse.data.doc;
		content.bitContent = BITResponse;
		return res.json(content);
	})).catch((error) => {
		console.log(error);
	});
};

exports.Index = (req, res) => {
	console.log("here?");
	const revision = helpers.getRevision();
	const siteSlug = 'jacquesgreene';
	axios.all([helpers.getSite(req), helpers.getBandsInTown()]).then(axios.spread((siteResponse, BITResponse) => {
		const site = siteResponse.data.doc;
		if (!site) res.json({ error: `No site with the slug '${siteSlug}' was found` });
		if (site.pages.length < 1) res.json({ error: 'There are no pages associated with the site' });

		let homepage = (req.query.homepage) ? site.pages.find(s => s.slug === req.query.homepage) : site.pages.find(s => s.slug === site.homepage);
		// let homepage = site.pages.find((s) => s.slug === 'afterglow');
		if (!homepage) homepage = site.pages[0];

		const template = homepage.template || 'afterglow';
		let content = (homepage.content);
		content.live.livedates = BITResponse.data;
		// return res.json(BITResponse);
		// return res.json(BITResponse);
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
