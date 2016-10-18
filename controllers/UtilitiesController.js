const axios = require('axios');
// const siteSlug = 'jacquesgreene';
const apiKey = 'Qye38eD6MD2BU844Ryw32fi8';

exports.GetVimeo = (req, res) => {
	const id = req.params.id || req.query.id;
	axios.get('http://localhost:3001/api/resources/getVimeo', {
		params: {
			id,
			key: apiKey,
		},
	}).then((response) => {
		return res.status(200).json(response.data);
	}).catch((error) => {
		return res.json(error)
	});
};

exports.GetTweets = (req, res) => {
	axios.get('http://localhost:3001/api/resources/getTweets', {
		params: {
			key: apiKey,
			handle: 'hudmo',
			count: 12,
		},
	}).then((response) => {
		return res.status(200).json(response.data);
	}).catch((error) => {
		return res.json(error)
	});
};

exports.MCSubscribe = (req, res) => {
	const email = req.body.email_address;
	const listSlug = 'jacquesGreene';
	axios.post('http://localhost:3001/api/resources/subscribe', { key: apiKey, email, listSlug }).then((response) => {
		return res.status(200).json(response.data);
	}).catch((error) => {
		return res.status(error.response.status).json(error.response.data);
	});
};