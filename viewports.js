const VIEWPORT_DESKTOP_WIDEST = {
	label: 'desktop-widest',
	width: 1920,
	height: 900
};

const VIEWPORT_DESKTOP_WIDE = {
	label: 'desktop-wide',
	width: 1680,
	height: 900
};

const VIEWPORT_PHONE = {
	label: 'phone',
	width: 320,
	height: 480
};

const VIEWPORT_TABLET = {
	label: 'tablet',
	// The breakpoint in Codex is 640px.
	// Before switching from 720px to 640px we should address
	// https://phabricator.wikimedia.org/T366859 as the mobile site
	// has a temporary workaround in place that makes this an inappropriate
	// breakpoint to test at that doesn't reflect what our users see.
	width: 720,
	height: 768
};

const VIEWPORT_DESKTOP = {
	label: 'desktop',
	width: 1120,
	height: 900
};

module.exports = {
	VIEWPORT_PHONE,
	VIEWPORT_TABLET,
	VIEWPORT_DESKTOP,
	VIEWPORT_DESKTOP_WIDE,
	VIEWPORT_DESKTOP_WIDEST
};
