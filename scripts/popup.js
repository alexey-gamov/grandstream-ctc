const platform = chrome || browser;

document.addEventListener('DOMContentLoaded', () => {
	platform.runtime.connect({name: 'popup'});

	document.querySelectorAll('button').forEach(button => {
		button.addEventListener('click', () => {
			const action = {
				mutecall: { type: 'keys', data: 'mute' },
				makecall: { type: 'call', data: document.getElementsByName('dial')[0].value },
				intercept: { type: 'call', data: 'pickup' },
			};

			platform.runtime.sendMessage(action[button.name] || {type: 'operation', data: button.name});
		});
	});

	document.querySelectorAll('button[name],[data-locale]').forEach(translate => {
		translate.innerText = platform.i18n.getMessage(translate.name || translate.dataset.locale);
	});

	document.getElementsByName('dial')[0].addEventListener('keypress', event => {
		return String.fromCharCode(event.keyCode).match(/[0-9]/) ? true : event.preventDefault();
	});

	platform.runtime.onMessage.addListener((data) => {
		if (data.state) {
			const stripe = document.getElementsByTagName('blockquote')[0];

			stripe.style.backgroundColor = data.color || null;
			stripe.style.display = data.color ? 'block' : null;
			stripe.innerHTML = platform.i18n.getMessage(data.state, data.number);
		}

		document.querySelectorAll('button, input').forEach(control => {
			control.disabled = (data.state === 'fail');
		});
	});
});