let container = document.querySelector('#facts-and-figures');
const iframe = document.createElement('iframe');
iframe.src = 'https://facts-and-figures-web.netlify.app/index.html';
iframe.width = '100%';
iframe.style = 'border: 0';

let contentHeight = 2050;
iframe.height = contentHeight;

window.addEventListener('load', () => {
	container.appendChild(iframe);
});

window.addEventListener(
	'message',
	function (e) {
		// message that was passed from iframe page
		let message = e.data;

		if (
			message.height &&
			message.height !== contentHeight &&
			message.height !== 150
		) {
			console.log('resize triggered');
			iframe.height = message.height + 'px';
			contentHeight = message.height;
		}
	},
	false
);
