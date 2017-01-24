import $ from 'jquery';
import scrollTo from 'scroll-to';

import Scroller from './components/Scroller';
import ScrollTo from './components/ScrollTo';
import Player from './components/Player';
import Mailer from './components/Mailer';
import publisher from './components/pubSub';
import * as h from './helpers/helpers';


const components = {};
$('.bg-scroller').map((i, el) => {
	const scroller = new Scroller(el, publisher);
	if (!components.scrollers) components.scrollers = [];
	components.scrollers.push(scroller);
});


$('section.player').map((i, el) => {
	const player = new Player(el, publisher);
	if (!components.players) components.players = [];
	components.players.push(player);
});

$('.signup').map((i, el) => {
	const mailer = new Mailer(el, publisher);
	if (!components.mailers) components.mailers = [];
	components.mailers.push(mailer);
});

$('.scrollTo').map((i, el) => {
	const scrollTo = new ScrollTo(el, publisher);
	// scrollTo.autoCallback = components.player.play.bind(player);
	scrollTo.setAuto();
	if (!components.scrollTos) components.scrollTos = [];
	components.scrollTos.push(scrollTo);
});


const header = {
	init() {
		this.element = $('header');
		this.button = this.element.find('.header__button');
		this.mailer = this.element.find('.signup');
		this.ex = this.element.find('.ex')
		this.isMobile = h.isTouchDevice();
		this.lastY = $(window).scrollTop();
		this.scrollDirectionBuffer = 15;
		this.notified = false;
		this.disabled = false;
		this.stuck = true;

		this.inView = this.isInView.bind(this);
		this.calculate = this.calculate.bind(this);

		publisher.subscribe('WindowScrolled', this.isInView.bind(this));
		publisher.subscribe('HeaderScrollDisabled', this.toggleScroll.bind(this));
		// publisher.subscribe('EmailSubscribed', () => {
		// 	setTimeout(() => {
		// 		this.element.removeClass('open in-view');
		// 		this.emailSubscribed = true;
		// 		publisher.unsubscribe('WindowScrolled');
		// 	}, 1300);
		// });

		this.calculate();
		// this.button.click(() => this.element.toggleClass('in-view').removeClass('in-view'));
		this.element.mouseenter(() => {
			this.notified = true;
			this.element.addClass('in-view');
		}).mouseleave(() => {
			if (!this.stuck) {
				if (!this.mailer.hasClass('thinking')) {
					setTimeout(() => this.element.removeClass('in-view'), 300);
				}
			}
		});

		this.ex.on('click', () => {
			this.stuck = false;
			this.element.removeClass('in-view');
			setTimeout(() => this.element.removeClass('needs-ex'), 300);
		});

		$(window).on('load', () => {
			setTimeout(() => {
				this.stuck = true;
				if (!this.notified) this.element.addClass('in-view needs-ex');
			}, 8000);
		});
	},

	toggleScroll(disabled) {
		this.disabled = disabled;
		console.log(this.disabled);
	},

	calculate() {
		this.triggerY = window.innerHeight;
	},

	isInView(ypos) {
		if (!this.emailSubscribed && !this.disabled) {
			if (this.isMobile) {
				const currentY = ypos;
				this.element.toggleClass('in-view', ypos < this.lastY);
				this.lastY = currentY;
			} else {
				if (!this.triggerY) return false;
				if (ypos > this.triggerY && !this.notified) {
					this.element.toggleClass('in-view', ypos > this.triggerY);
					this.notified = true;
					setTimeout(() => this.element.removeClass('in-view'), 3000);
					publisher.unsubscribe('WindowScrolled');
				}
			}
		}
		return true;
	},
};

header.init();


$(window).on('load', () => {

	if (location.pathname === '/live') {
		const liveTop = $("#live").offset().top;
		console.log('live', liveTop);
		scrollTo(0, liveTop, { duration: 400 });
	}

	$(document).on('mousemove', (e) => publisher.emit('MouseMoved', e));
	$(window).on('scroll', () => {
		publisher.emit('WindowScrolled', $(window).scrollTop());
	});
	let skipframe = false;
	function draw() {
		requestAnimationFrame(draw);
		if (skipframe) {
			skipframe = false;
		} else {
			publisher.emit('FrameRequested');
			skipframe = false;
		}
	}
	draw();

	let resizeTimer = null;
	$(window).on('resize', (e) => {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(() => {
			publisher.emit('Recalculate');
		}, 250);
	});

	$('.full-height').css('height', window.innerHeight);
});
