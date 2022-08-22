const VIEWPORT_DESKTOP_WIDE = {
	label: 'desktop-wide',
	// The actual threshold is 1200px, but the main purpose of this breakpoint is
	// to indicate "large displays". We pick a larger threshold for testing (T315690)
	width: 1920,
	height: 900
};

const VIEWPORT_PHONE = {
	label: 'phone',
	width: 320,
	height: 480
};

const VIEWPORT_TABLET = {
	label: 'tablet',
	width: 720,
	height: 768
};

const VIEWPORT_DESKTOP = {
	label: 'desktop',
	width: 1000,
	height: 900
};

module.exports = {
	VIEWPORT_PHONE,
	VIEWPORT_TABLET,
	VIEWPORT_DESKTOP,
	VIEWPORT_DESKTOP_WIDE
};
