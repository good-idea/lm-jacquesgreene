// import Observer from './Observer';
import $ from 'jquery';

class Scroller {
	constructor(element, publisher) {
		this.element = $(element);
		this.vertical = (this.element.attr('data-direction') === 'vertical');
		this.reverse = (this.element.attr('data-reverse') === 'true');
		const mod = parseInt(this.element.attr('data-velocity-mod'), 10) || 1;
		this.velocity = 0.25 * mod;
		this.bgPos = 0;

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

	setBackgroundPosition() {
		if (!this.inView) return false;
		// if (Math.floor(this.y) !== Math.floor(this.yd)) this.setVelocity();
		this.bgPos = (this.reverse) ? this.bgPos - this.velocity : this.bgPos + this.velocity;
		const newPos = (this.vertical) ? `center ${this.bgPos}%` : `${this.bgPos}% center`;
		this.element.css({
			'background-position': newPos,
		});
		return true;
	}
}

export default Scroller;
