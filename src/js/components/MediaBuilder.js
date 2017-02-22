import $ from 'jquery';
import YouTubePlayer from 'youtube-player';
import Emitter from 'tiny-emitter';

const types = {
	/**
	 * @param  {string} resource  - URL of media resource
	 * @param  {DOM Node} element - DOM Element to identify or create the player
	 * @return {player}            a player object wrapping controls into a common syntax
	 */

	youtube: function buildYoutube(resource, inputElement) {
		const element = (inputElement instanceof $) ? inputElement : $(inputElement);
		const ytRegex = /https?:\/\/(?:www.)?(?:youtube.com|youtu.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]{11})(?:\S+)?/;
		const id = ytRegex.exec(resource)[1];
		element.addClass('video--embed video--youtube');
		const playerSource = YouTubePlayer(element[0], {
			videoId: id,
			suggestedQuality: 'large',
		});

		const player = {};
		player.play = playerSource.playVideo;
		player.pause = playerSource.pauseVideo;
		player.setVolume = playerSource.setVolume;
		player.togglePlay = function togglePlay() {
			playerSource.getPlayerState().then((state) => {
				if (state === 1) {
					playerSource.pauseVideo();
				} else {
					playerSource.playVideo();
				}
			});
		};

		let iframe;
		playerSource.getIframe().then((response) => {
			iframe = response;
		});
		player.playFullScreen = function playFullScreen() {
			const requestFullScreen = iframe.requestFullScreen || iframe.mozRequestFullScreen || iframe.webkitRequestFullScreen;
			if (requestFullScreen) {
				requestFullScreen.bind(iframe)();
			}
		};

		player.emitter = new Emitter();

		playerSource.addEventListener('onStateChange', (e) => {
			switch (e.data) {
			case 0:
				// ended
				player.emitter.emit('stateChange', 'ended');
				break;
			case 1:
				// playing
				player.emitter.emit('stateChange', 'playing');
				break;
			case 2:
				// paused
				player.emitter.emit('stateChange', 'paused');
				break;
			case 3:
				// buffering
				player.emitter.emit('stateChange', 'buffering');
				break;
			case 5:
				// buffering
				player.emitter.emit('stateChange', 'cued');
				break;
			default:
				player.emitter.emit('stateChange', e.data);
			}
		});
		return player;
	},
};

function getContentType(input) {
	const regExes = [
		{ type: 'image', 			regEx: /(^https?:\/\/)(?:[a-z0-9-]+\.)+[a-z]{2,6}(?:\/[^/#?]+)+\.(?:jpg|jpeg|gif|png)$/ },
		{ type: 'youtube', 		regEx: /^https?:\/\/(www.)?(youtube.com|youtu.be)\/(watch\?v=)?[a-zA-Z0-9_-]{11}(?:\S+)?$/ },
		{ type: 'soundcloud',	regEx: /^https?:\/\/(?:www\.)?soundcloud.com\/[\s\S]*\/[\s\S]*$/ },
		{ type: 'vimeo', 			regEx: /^https?:\/\/(?:www\.)?vimeo.com\/[0-9]*$/ },
		{ type: 'spotify', 		regEx: /^https?:\/\/(?:www|open\.)?spotify.com\/[\s\S]*$/ },
		{ type: 'mixcloud', 		regEx: /^https?:\/\/(?:www\.)?mixcloud.com\/[\s\S]*$/ },
		{ type: 'iframe', 		regEx: /^https?:\/\/(?:w\.)?soundcloud.com\/player\/\?[\s\S]*$/ },
	];
	for (const reg of regExes) {
		if (reg.regEx.test(input)) return reg.type;
	}
	return undefined;
}

function buildMedia(inputElement, publisher) {
	const element = $(inputElement);
	const container = element.closest('.player');
	const outerContainer = element.closest('section');
	const embedContainer = element.closest('.embed-container');
	const resource = element.attr('data-resource');
	const autoplay = element.attr('data-autoplay') || true;
	const type = getContentType(resource, element);
	if (type === undefined) {
		console.warn(`${resource} is not a valid resource.`);
		return false;
	}
	const player = types[type](resource, element);


	/*
		Controls
	*/

	const controls = {};
	controls.container = container.find('.controls');
	controls.play = controls.container.find('.control--play');
	controls.pause = controls.container.find('.control--pause');
	controls.fullscreen = controls.container.find('.control--fullscreen');

	controls.play.on('click', player.play);
	controls.pause.on('click', player.pause);
	controls.fullscreen.on('click', player.playFullScreen);
	embedContainer.on('click', player.togglePlay);

	/*
		Events
	*/

	function onStateChange(newState) {
		const date = new Date();
		if (newState !== 'buffering') container.removeClass('isLoading');
		container.attr('data-state', newState);
	}

	player.emitter.on('stateChange', onStateChange);

	/*
		Functions
	*/

	function setVolume(input) {
		player.setVolume(input * 100);
	}

	let top = 0;
	let height = 0;
	let wheight = 0;
	let oversize = 1;
	function calculate() {
		top = outerContainer.offset().top;
		height = outerContainer.outerHeight(true);
		// wheight = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
		wheight = $(window).height();
		oversize = Math.max(1, (height / wheight));
	}

	function inView(ypos) {
		let percentage = 1;
		const hiddenBefore = ypos - top;
		const hiddenAfter = (top + height) - (ypos + wheight);

		if (hiddenBefore > 0) percentage -= (hiddenBefore) / height;
		if (hiddenAfter > 0) percentage -= (hiddenAfter) / height;

		percentage *= oversize; // If the div is bigger than the screen, it needs to be multiplied
		percentage = Math.min(1, percentage); // not greater than 1
		percentage = Math.max(0, percentage); // nor less than 0

		setVolume(percentage);
	}

	function initialize() {
		setVolume(0);
		if (autoplay) player.play();
	}

	publisher.subscribe('WindowScrolled', inView);
	publisher.subscribe('Loaded', calculate);
	publisher.subscribe('Recalculate', calculate);

	initialize();

	return player;
}

function mediaBuilder(element, publisher) {
	return buildMedia(element, publisher);
}

export default mediaBuilder;
