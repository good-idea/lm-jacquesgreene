import $ from 'jquery';
import scrollTo from 'scroll-to';

class ScrollTo {
	constructor(element, publisher) {
		this.element = $(element);
		this.destination = this.element.attr('data-scrollTo');
		this.bindElement();
		this.publisher = publisher;
		// this.setAuto();
	}

	setAuto() {
		const delay = parseInt(this.element.attr('data-scrollTo-auto'), 10);
		if (delay) {
			this.publisher.emit('HeaderScrollDisabled', true);
			setTimeout(() => this.publisher.emit('HeaderScrollDisabled', false), delay);

			this.timer = setTimeout(() => {
				this.go();
				// this.autoCallback();
			}, delay);
		}
	}

	bindElement() {
		this.element.click(() => {
			this.go();
			clearTimeout(this.timer);
			$(window).unbind('.scrollToEvents');
		});
		$(window).on('scroll.scrollToEvents', () => {
			if ($(window).scrollTop() > 100) {
				clearTimeout(this.timer);
				$(window).unbind('.scrollToEvents');
			}
		});
	}

	go() {
		const y = $(this.destination).offset().top;
		scrollTo(0, y, {
			duration: 1000,
		});
	}
}

export default ScrollTo;
