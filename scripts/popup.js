document.addEventListener('DOMContentLoaded', async () => {
	const platform = chrome || browser;
	const dial = document.getElementsByName('dial')[0];

	document.querySelectorAll('button').forEach((button) => {
		button.addEventListener('click', () => {
			const action = {
				mutecall: {action: 'keys', data: 'mute'},
				makecall: {action: 'call', data: dial.value},
				intercept: {action: 'call', data: this.pickup},
			};

			platform.runtime.sendMessage(action[button.name] || {action: 'operation', data: button.name});
		});
	});

	document.querySelectorAll('button[name],[data-locale]').forEach((translate) => {
		translate.innerText = platform.i18n.getMessage(translate.name || translate.dataset.locale);
	});

	dial.addEventListener('keypress', (event) => {
		return String.fromCharCode(event.keyCode).match(/[0-9]/) ? true : event.preventDefault();
	});

	dial.addEventListener('keyup', (event) => {
		if (event.key === 'Enter') document.getElementsByName('makecall')[0].click();
	});

	platform.storage.local.get(['confirm', 'pickup'], (varible) => {
		Object.entries(varible).forEach(([key, value]) => {
			this[key] = value;
		});
	});

	platform.runtime.onMessage.addListener((data) => {
		if (data.state) {
			const stripe = document.getElementsByTagName('blockquote')[0];

			stripe.style.backgroundColor = data.color || null;
			stripe.style.display = data.color ? 'block' : null;
			stripe.innerHTML = platform.i18n.getMessage(data.state, data.number);
		}

		document.querySelectorAll('button, input').forEach((control) => {
			control.disabled = ['load', 'fail'].includes(data.state);
		});
	});

	try {
		const [tab] = await platform.tabs.query({active: true, currentWindow: true});

		const [selection] = await platform.scripting.executeScript({
			target: {tabId: tab.id},
			func: () => window.getSelection().toString()
		});

		if (selection && selection.result) {
			document.getElementsByName('dial')[0].value = selection.result.replace(/[^0-9]/gi, '');
			if (!Boolean(Number(this.confirm))) document.getElementsByName('makecall')[0].click();
		}
	} catch (error) {
		// no actions
	}

	platform.runtime.connect({name: 'popup'});
});