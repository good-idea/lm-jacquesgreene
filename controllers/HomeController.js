// TODO::: Use site meta as fallback or when overwritten
const axios = require('axios');

const parsers = require('./parsers');
const helpers = require('./helpers');

const apiKey = 'Qye38eD6MD2BU844Ryw32fi8';

const revision = helpers.getRevision();

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
	helpers.getSite(req).then((response) => {
		const site = response;
		const homepage = site.pages.find(s => s.slug === 'tour2017');
		const content = Object.assign({}, homepage.content);
		content.meta = parsers.combineMeta(site.content.meta, homepage.content.meta);
		res.render('songkick', { content, revision });
	});
};

exports.Index = (req, res) => {
	const siteSlug = 'jacquesgreene';
	axios.all([helpers.getSite(req), helpers.getBandsInTown()]).then(axios.spread((site, BITResponse) => {
		if (!site) res.json({ error: `No site with the slug '${siteSlug}' was found` });
		if (site.pages.length < 1) res.json({ error: 'There are no pages associated with the site' });
		let homepage = (req.query.homepage) ? site.pages.find(s => s.slug === req.query.homepage) : site.pages.find(s => s.slug === site.homepage);
		if (!homepage) homepage = site.pages[0];

		const template = homepage.template || 'afterglow';
		let content = (homepage.content);
		content.live.livedates = BITResponse;
		content = parsers[template](homepage.content);
		content.meta = parsers.combineMeta(site.content.meta, homepage.content.meta);
		const stylesheet = 'main';

		if (req.query.content === 'true') {
			return res.json(content);
		}

		return res.render(template,
			{
				content,
				revision,
				stylesheet
			});
	})).catch((error) => {
		console.log(error);
		res.json(error);
	});
};

exports.Stems = (req, res) => {
	helpers.getSite(req).then((site) => {
		if (!site) res.json({ error: 'No site was found' });
		if (site.pages.length < 1) res.json({ error: 'There are no pages associated with the site' });
		const page = site.pages.find(s => s.slug === 'stems');
		const stylesheet = 'stems';
		const content = parsers.stems(page.content);
		content.meta = parsers.combineMeta(site.content.meta, page.content.meta);

		if (req.query.content === 'true') {
			return res.json(page);
		}

		return res.render('stems', {
			content,
			revision,
			stylesheet
		})
	});
};
