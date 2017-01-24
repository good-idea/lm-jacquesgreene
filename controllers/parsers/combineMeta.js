exports.combineMeta = function combineMeta(siteMeta, pageMeta) {
	const meta = Object.assign(siteMeta);
	Object.keys(pageMeta).map((key) => {
		const value = pageMeta[key];
		if (value || value.length > 1) meta[key] = value;
	});
	return meta;
};
