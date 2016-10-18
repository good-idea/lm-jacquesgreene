
export function isTouchDevice() {
	return 'ontouchstart' in window || 'onmsgesturechange' in window;
}