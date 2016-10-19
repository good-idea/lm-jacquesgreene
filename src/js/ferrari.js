import $ from 'jquery';
import Scroller from './components/Scroller.js';
import ScrollTo from './components/ScrollTo.js';
import Player from './components/Player.js';
import Mailer from './components/Mailer.js';
// import Warp from './components/Warp.js';
import publisher from './components/pubSub.js';
import * as h from './helpers/helpers';


const live = !$('body').hasClass('placeholder')

const components = {};
$('.bg-scroller').map((i, el) => {
	const scroller = new Scroller(el, publisher);
	if (!components.scrollers) components.scrollers = [];
	components.scrollers.push(scroller);
});


// $('.warp').map((i, el) => {
// 	const warp = new Warp(el, publisher);
// 	if (!components.warps) components.warps = [];
// 	components.warps.push(warp);
// });

if (live) components.player = new Player($('section.player'), publisher);

$('.signup').map((i, el) => {
	const mailer = new Mailer(el, publisher);
	if (!components.mailers) components.mailers = [];
	components.mailers.push(mailer);
});

if (live) {
	$('.scrollTo').map((i, el) => {
		const scrollTo = new ScrollTo(el, publisher);
		scrollTo.autoCallback = components.player.play.bind(player);
		scrollTo.setAuto();
		if (!components.scrollTos) components.scrollTos = [];
		components.scrollTos.push(scrollTo);
	});
}

const header = {
	init() {
		this.element = $('header');
		this.button = this.element.find('.header__button');
		this.notified = false;
		this.mailer = this.element.find('.signup');
		this.isMobile = h.isTouchDevice();
		this.lastY = $(window).scrollTop();
		this.scrollDirectionBuffer = 15;
		this.disabled = false;

		this.inView = this.isInView.bind(this);
		this.calculate = this.calculate.bind(this);

		publisher.subscribe('WindowScrolled', this.isInView.bind(this));
		publisher.subscribe('HeaderScrollDisabled', this.toggleScroll.bind(this));
		publisher.subscribe('EmailSubscribed', () => {
			setTimeout(() => {
				this.element.removeClass('open in-view');
				this.emailSubscribed = true;
				publisher.unsubscribe('WindowScrolled');
			}, 1300);
		});

		if (live) this.calculate();
		// this.button.click(() => this.element.toggleClass('in-view').removeClass('in-view'));
		this.element.mouseenter(() => {
			this.notified = true;
			this.element.addClass('in-view');
		}).mouseleave(() => {
			if (!this.mailer.hasClass('thinking')) {
				setTimeout(() => this.element.removeClass('in-view'), 300);
			} 
		});

		$(window).on('load', () => {
			setTimeout(() => {
				if (!this.notified) this.element.addClass('in-view');
			}, 8000);
		})
	},

	toggleScroll(disabled) {
		this.disabled = disabled;
		console.log(this.disabled);
	},

	calculate() {
		this.triggerY = $('section.deny').offset().top + window.innerHeight;
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

// Manage event emitters

$(window).on('load', () => {
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

	$('.full-height').css('height', window.innerHeight);

});

window.onbeforeunload = () => window.scrollTo(0, 0);
