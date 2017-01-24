import $ from 'jquery';
import scrollTo from 'scroll-to';
// import SC from 'soundcloud';
import resolve from 'soundcloud-resolve-jsonp';

const clientId = '20f6b95488a0ca8f2254e250e6b0b229';
SC.initialize({ clientId });

class Player {
	constructor(element, publisher) {
		this.play = this.play.bind(this);
		this.pulseBackground = this.pulseBackground.bind(this);
		this.handleFrameRequest = this.handleFrameRequest.bind(this);
		this.play = this.play.bind(this);
		this.pause = this.pause.bind(this);
		this.snap = this.snap.bind(this);
		this.publisher = publisher;

		this.element = $(element);
		this.track = this.element.find('.track')[0];
		const trackUrl = $(this.element).attr('data-track');
		this.id = trackUrl;
		this.fallbackId = $(this.element).attr('data-fallback');
		this.playButton = this.element.find('.player__controls.play');
		this.pauseButton = this.element.find('.player__controls.pause');
		this.scrubber = this.element.find('.player__scrubber');
		// this.background = this.element.find('.player__pulse');
		this.background = this.pauseButton;


		this.debugTime = Date.now();

		this.publisher.subscribe('FrameRequested', this.handleFrameRequest);
		// this.publisher.subscribe('WindowScrolled', this.snap);
		this.publisher.subscribe('PlayerPlayed', (playedId) => {
			if (playedId !== this.id) this.pause();
		});

		this.playing = false;
		this.scrubber.right = 100;
		this.dragging = false;
		this.currentPosition = 0; // 0 - 99.8
		this.fellBack = false;

		// analyser init
		const audioCtx = new (window.AudioContext || window.webkitAudioContext);
		this.analyser = audioCtx.createAnalyser();
		this.analyser.fftSize = 256;
		this.analyser.source = audioCtx.createMediaElementSource(this.track);
		this.analyser.source.connect(this.analyser);
		this.analyser.connect(audioCtx.destination);
		this.streamData = new Uint8Array(128);
		this.volume = 0;
		this.volumeTracker = [];
		this.volumeTracker = [1176, 2512, 2739, 2873, 3505, 3626, 3686, 3689, 3689, 3756, 3791, 4843, 5450, 5585, 5711, 0, 688, 2394];
		this.track.crossOrigin = 'anonymous';

		resolve({ url: trackUrl, client_id: clientId }, (error, response) => {
			if (error) {
				this.ifSCError();
			} else {
				const QorAmp = (response.stream_url.indexOf('?') > -1) ? '&' : '?';
				let stream = `${response.stream_url}${QorAmp}client_id=${clientId}`;
				stream = stream.replace(/https?:/, '');
				this.track.setAttribute('src', stream);
				this.element.addClass('ready');
				this.bindButtons();
			}
		});
	}

	ifSCError() {
		if (this.fellBack) return false;
		this.fellBack = true;
		const fallBack = $('<iframe/>');
		fallBack.attr('src', `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${this.fallbackId}&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true`)
			.attr('scrolling', 'no')
			.attr('frameborder', 'no');
		this.element.addClass('fallback')
			.find('.player__footer').before(fallBack);
		return true;
	}

	bindButtons() {
		this.playButton.click(() => this.play());
		this.pauseButton.click(() => this.pause());
		this.scrubber.mousedown(e => this.moveScrubber(e));
		$(document).mouseup(e => this.setNewPosition(e));
	}

	play() {
		this.publisher.emit('PlayerPlayed', this.id);
		this.track.play();
		this.playing = true;
		this.setClass();
	}

	pause() {
		this.track.pause();
		this.playing = false;
		this.setClass();
	}

	togglePlayPause() {
		this.playing = !this.playing;
		this.setClass();
	}

	setClass() {
		this.element.toggleClass('playing', this.playing);
	}

	snap() {
		clearTimeout(this.snapTimer);
		this.snapTimer = setTimeout(() => {
			const duration = 1000;
			this.publisher.emit('HeaderScrollDisabled', true);
			setTimeout(() => this.publisher.emit('HeaderScrollDisabled', false), duration);
			if (Math.abs($(window).scrollTop() - this.element.offset().top) < window.innerHeight * 0.4) {
				scrollTo(0, this.element.offset().top, {
					duration,
				});
			}
		}, 500);
	}

	handleFrameRequest() {
		if (!this.playing || !this.track) return false;
		this.scrub();
		this.pulseBackground();
		return true;
	}

	sampleAudioStream() {
		this.analyser.getByteFrequencyData(this.streamData);
		let total = 0;
		for (let i = 0; i < 45; i += 1) {
			total += this.streamData[i];
		}
		this.volume = total;
	}

	pulseBackground() {
		this.sampleAudioStream();
		if (this.volumeTracker.length < 18) {
			this.volumeTracker.push(this.volume);
		} else {
			this.volumeTracker.shift();
			this.volumeTracker.push(this.volume);
		}

		const min = Math.min(...this.volumeTracker);
		const max = Math.max(...this.volumeTracker);
		const range = max - min;
		const diff = (this.volume - min) / range;
		const mod = 2;
		const opacity = -((diff * mod) - (mod / 2));
		const fill = `rgba(0, 0, 0, ${opacity})`;
		this.background.css({ fill });
		return true;
	}

	moveScrubber(e) {
		this.dragging = true;
		this.scrubber.addClass('dragging');
		const initialX = e.clientX;
		const initialPosition = this.currentPosition;
		$(document).on('mousemove.scrubber', (moveE) => {
			const newX = moveE.clientX;
			this.currentPosition = Math.min(100, (((newX - initialX) / window.innerWidth) * 100) + initialPosition);
			this.scrubber.css({ right: `${100 - this.currentPosition}%` });
		});
	}

	setNewPosition() {
		if (!this.dragging) return false;
		this.track.currentTime = this.track.duration * (this.currentPosition / 100);
		$(document).unbind('.scrubber');
		this.dragging = false;
		this.scrubber.removeClass('dragging');
		return true;
	}

	scrub() {
		if (this.dragging) return false;
		this.currentPosition = (this.track.currentTime / this.track.duration) * 100;
		this.scrubber.css({ right: `${100 - this.currentPosition}%` });

		if (this.currentPosition >= 99.99) {
			this.pause();
			this.track.currentTime = 0;
		}
		return true;
	}
}

export default Player;
