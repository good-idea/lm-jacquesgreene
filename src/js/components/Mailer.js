import $ from 'jquery';
import axios from 'axios';
import Cookie from 'js-cookie';
import download from 'downloadjs';


class Mailer {
	constructor(element, publisher) {
		this.element = $(element);
		this.publisher = publisher;
		this.form = this.element.find('form.signup__form');
		this.emailInput = this.form.find('input.signup__input')[0];
		this.message = this.element.find('.message');
		this.subscribed = (Cookie.get('realtime-subscribed') === 'true');
		const downloadUrl = this.element.attr('data-download') || '';
		this.download = (downloadUrl.length > 0) ? downloadUrl : false;
		this.cookieCheck = (this.element.attr('data-cookiecheck') === 'true');

		this.valid = undefined;
		this.publisher.subscribe('EmailSubscribed', () => this.element.addClass('thinking success'));

		this.setBindings();
		if (this.subscribed && this.cookieCheck) {
			this.element.addClass('success thinking');
		}
	}

	setBindings() {
		const email = /^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,})$/;

		this.form.submit((e) => {
			e.preventDefault();
			const address = this.emailInput.value;
			const data = this.form.serialize();
			if (!email.test(address)) {
				this.setMessage('enter a valid email address');
			} else {
				this.submitForm(data);
			}
		});
		this.form.on('keyup.mailer change.mailer', () => {
			const wasValid = this.valid;
			const address = this.emailInput.value;

			this.valid = email.test(address);
			this.element.toggleClass('valid', this.valid);
			if (!wasValid && this.valid) this.setMessage('');
		});
	}

	setMessage(string) {
		if (string === '') {
			this.message.removeClass('visible');
			setTimeout(() => this.message.text(''), 300);
		} else {
			this.message.html(string).addClass('visible');
		}
	}

	submitForm(data) {
		this.element.addClass('thinking');
		axios.post('/mcsubscribe', data)
		.then((response) => {
			console.log(response);
			if (response.status === 200) {
				this.element.addClass('success');
				this.publisher.emit('EmailSubscribed');
				Cookie.set('realtime-subscribed', 'true');
			} else {
				this.element.removeClass('thinking');
				this.setMessage('Sorry, it looks like there was an error.<br>Try again or let us know at info@luckyme.net');
			}
		}).catch((error) => {
			console.log(error);
			this.element.removeClass('thinking');
			this.setMessage('Sorry, it looks like there was an error.<br>Try again or let us know at info@luckyme.net');
		});
	}

}

export default Mailer;
