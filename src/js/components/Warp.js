import fx from './glfx';
import $ from 'jquery';

class Warp {
	constructor(element, publisher) {
		let supported = true;
		try {
			this.canvas = fx.canvas();
		} catch (e) {
			supported = false;
			console.warn(e);
			return;
		}

		if (supported) {
			$(window).on('load', () => {
				this.element = $(element);
				this.mouse = { x: 0, y: 0, xd: 0, yd: 0 };
				this.calculate = this.calculate.bind(this);
				this.move = this.move.bind(this);
				this.draw = this.draw.bind(this);
				this.setVisibility = this.setVisibility.bind(this);
				this.source = this.element.find('.warp-source')[0];
				this.texture = this.canvas.texture(this.source);

				this.calculate = this.calculate.bind(this);
				this.setVisibility = this.setVisibility.bind(this);
				this.move = this.move.bind(this);
				this.draw = this.draw.bind(this);
				this.update = this.update.bind(this);
				this.tween = this.tween.bind(this);

				// replace the source with the this.canvas
				this.source.parentNode.insertBefore(this.canvas, this.source);
				// this.source.parentNode.removeChild(this.source);


				publisher.subscribe('FrameRequested', this.draw);
				publisher.subscribe('MouseMoved', this.move);
				publisher.subscribe('WindowScrolled', this.setVisibility);

				this.calculate();
				this.setVisibility($(window).scrollTop());
			})
		}
	}

	calculate() {
		this.min = this.element.offset().top;
		this.max = this.min + this.element.outerHeight(true);
		this.windowHeight = window.innerHeight;
	}

	setVisibility(ypos) {
		this.inView = (ypos < this.max && ypos + this.windowHeight > this.min);
		return this.inView;
	}

	move(e) {
		this.mouse.xd = e.clientX;
		this.mouse.yd = e.clientY;
	}

	delta(a, b) {
		const factor = 0.05;
		return (factor * (b - a)) + a;
	}

	tween() {
		this.mouse.x = this.delta(this.mouse.x, this.mouse.xd);
		this.mouse.y = this.delta(this.mouse.y, this.mouse.yd);
	}

	draw() {
		if (!this.inView) return false;
		if (this.x !== Math.floor(this.xd) || this.y !== Math.floor(this.yd)) this.tween();
		this.canvas.draw(this.texture)
			.bulgePinch(this.mouse.x, this.mouse.y, this.windowHeight * .6, .6)
			// .swirl(this.mouse.x, this.mouse.y, this.windowHeight * .5, 2);
		this.update();
		return true;
	}

	update() {
		this.canvas.update();
	}

}

export default Warp;
