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
	let min = 0;
	let max = 0;

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
	console.log(element);
	embedContainer.on('click', player.togglePlay);

	/*
		Events
	*/

	function onStateChange(newState) {
		const date = new Date();
		console.log(`state change: ${newState} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`);
		if (newState !== 'buffering') container.removeClass('isLoading');
		container.attr('data-state', newState);
	}

	player.emitter.on('stateChange', onStateChange);

	/*
		..
	*/

	function setVolume(input) {
		// let newVolume = 2 - Math.min((input * 2) - 1, 0);
		let newVolume = 1 - ((input - 0.5) * 2);
		newVolume = Math.max(newVolume, 0);
		newVolume = Math.min(newVolume, 1);
		player.setVolume(newVolume * 100);
	}

	function calculate() {
		min = outerContainer.offset().top;
		max = min + outerContainer.outerHeight(true);
	}

	function inView(ypos) {
		let percentage = ((ypos - min) / max);
		percentage = Math.min(Math.max(0, percentage), 1);
		setVolume(percentage);
	}

	function initialize() {
		if (autoplay) player.play();
	}

	publisher.subscribe('WindowScrolled', inView);
	publisher.subscribe('Loaded', calculate);

	initialize();

	return player;
}

function mediaBuilder(element, publisher) {
	return buildMedia(element, publisher);
}

export default mediaBuilder;
