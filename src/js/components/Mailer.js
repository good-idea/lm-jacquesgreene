import $ from 'jquery';
import axios from 'axios';

class Mailer {
	constructor(element, publisher) {
		this.element = $(element);
		this.publisher = publisher;
		this.form = this.element.find('form.signup__form');
		this.emailInput = this.form.find('input.signup__input')[0];
		this.message = this.element.find('.message');

		this.valid = undefined;

		this.publisher.subscribe('EmailSubscribed', () => this.element.addClass('thinking success'));

		this.setBindings();
	}

	setBindings() {
		const email = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,})$/;

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
			} else {
				this.element.removeClass('thinking');
				this.setMessage('Sorry, it looks like there was an error.<br>Try again or let us know at info@luckyme.net');
			}
		});
	}
}

export default Mailer;
