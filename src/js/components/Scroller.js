// import Observer from './Observer';
import $ from 'jquery';

class Scroller {
	constructor(element, publisher) {
		this.element = $(element);
		this.reverse = (this.element.attr('data-reverse') === 'true');
		const mod = parseInt(this.element.attr('data-velocity-mod'), 10) || 1;
		this.velocity = 0.25 * mod;
		this.bgLeft = 0;
		
		// this.y = 0; // 'current' y as far as setVelocity is concerned
		// this.yd = 0; // 'destination' y

		// this.calculate = this.calculate.bind(this);
		this.setVisibility = this.setVisibility.bind(this);
		// this.setVelocity = this.setVelocity.bind(this);
		this.setBackgroundPosition = this.setBackgroundPosition.bind(this);
		// this.handleMouseMove = this.handleMouseMove.bind(this);

		publisher.subscribe('FrameRequested', this.setBackgroundPosition);
		// publisher.subscribe('MouseMoved', this.handleMouseMove);
		publisher.subscribe('WindowScrolled', this.setVisibility);

		this.calculate();
		this.setVisibility($(window).scrollTop());
	}

	calculate() {
		this.min = this.element.offset().top;
		this.max = this.min + this.element.outerHeight(true);
		this.windowHeight = window.innerHeight;
	}

	setVisibility(ypos) {
		this.inView = (ypos < this.max && ypos + this.windowHeight > this.min);
		// console.log(ypos, this.inView);
		return this.inView;
	}

	// delta(a, b) {
	// 	const factor = 0.1;
	// 	return (factor * (b - a)) + a;
	// }

	// handleMouseMove(e) {
	// 	this.yd = e.clientY;
	// }

	// setVelocity(destination = this.yd) {
	// 	if (!this.inView) return false;
	// 	const y = this.delta(this.y, destination);
	// 	const base = 0.2;
	// 	const mod = 1.8;
	// 	const ypos = (this.reverse) ? (y / (this.windowHeight)) : (this.windowHeight - y) / this.windowHeight;
	// 	this.velocity = (ypos * mod) + base;
	// 	this.y = Math.floor(y);
	// 	return true;
	// }

	setBackgroundPosition() {
		if (!this.inView) return false;
		// if (Math.floor(this.y) !== Math.floor(this.yd)) this.setVelocity();
		this.bgLeft = (this.reverse) ? this.bgLeft - this.velocity : this.bgLeft + this.velocity;
		console.log(this.bgLeft);
		this.element.css({
			'background-position': `${this.bgLeft}% center`,
		});
		return true;
	}
}

export default Scroller;
