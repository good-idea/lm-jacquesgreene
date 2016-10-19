// TODO::: Use site meta as fallback or when overwritten

// const h = require('./helpers');
const axios = require('axios');

const siteSlug = 'jacquesgreene';

exports.Index = (req, res) => {
	axios.get(`http://localhost:3001/api/sites/${siteSlug}`).then((response) => {
		const site = response.data.doc;
		if (!site) res.json({ error: `No site with the slug '${siteSlug}' was found` });
		if (site.pages.length < 1) res.json({ error: 'There are no pages associated with the site' });
		let homepage = (req.query.homepage) ? site.pages.find((s) => s.slug === req.query.homepage) : site.pages.find((s) => s.slug === site.homepage);
		if (!homepage) homepage = site.pages[0];

		const template = homepage.template || 'ferrari';
		// const content = (homepage.content);
		const content = parseContent(homepage.content);

		if (req.query.content === 'true') {
			return res.json(content);
		}

		res.render(template,
			{
				meta: site.content.meta,
				content,
			});
	}).catch((error) => {
		console.log(error);
		res.json(error);
	});
};

function parseContent(input) {
	const content = input;

	const livedates = [];
	const now = new Date();

	const monthnames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	function padLeft(str) {
		if (str.toString().length < 2) return `0${str}`;
		return str;
	}

	for (const livedate of content.live.livedates) {
		const date = new Date(Date.parse(livedate.date));
		if (date < now) continue;       
		livedate.date = `${monthnames[date.getMonth()]} ${padLeft(date.getDate())}`;
		livedates.push(livedate);
	}

	// replace the original with the updated content
	content.live.livedates = livedates;

	content.purchase.copy = content.purchase.copy.replace(/\n/g, '<br />');
	console.log(content.purchase.copy);

	return content;
}
