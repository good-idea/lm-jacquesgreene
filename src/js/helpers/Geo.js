import axios from 'axios';
import { queryOne } from '@artcommacode/q';

axios.get('http://ipinfo.io/').then((response) => {
	const country = (response.data.country === "US") ? 'geo-us' : 'geo-eu';
	queryOne('body').classList.add(country);
})
