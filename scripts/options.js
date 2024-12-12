document.addEventListener('DOMContentLoaded', () => {
	const platform = chrome || browser;
	const save = document.getElementsByName('save')[0];

	platform.storage.local.get({
		ip: '192.168.1.0',
		login: 'admin',
		pass: null,
		number: null,
		pickup: '*72',
		content: 1,
		confirm: 1,
		notice: 0
	}, (items) => {
		save.disabled = true;

		Object.entries(items).forEach(([key, value]) => {
			if (!['content', 'confirm', 'notice'].includes(key)) document.getElementsByName(key)[0].value = value;
			else document.querySelector(`input[name="${key}"][value="${value}"]`).checked = true;
		});

		// Firefox = Disable notifications feature: action buttons are not supported
		if (typeof InstallTrigger !== 'undefined') {
			document.querySelector('[data-locale="mark_notice"]').parentNode.style.display = 'none';
		}

		document.querySelector('html').setAttribute('lang', platform.i18n.getMessage('locale'));
	});

	save.addEventListener('click', () => {
		const settings = {
			ip: document.getElementsByName('ip')[0].value,
			login: document.getElementsByName('login')[0].value,
			pass: document.getElementsByName('pass')[0].value,
			number: document.getElementsByName('number')[0].value,
			pickup: document.getElementsByName('pickup')[0].value,
			content: document.querySelector('input[name="content"]:checked').value,
			confirm: document.querySelector('input[name="confirm"]:checked').value,
			notice: document.querySelector('input[name="notice"]:checked').value
		};

		platform.storage.local.set(settings, () => {
			platform.runtime.sendMessage({action: 'update-settings'});
			save.disabled = true;
		});
	});

	document.querySelectorAll('button[name],[data-locale]').forEach((translate) => {
		translate.innerText = platform.i18n.getMessage(translate.name || translate.dataset.locale);
	});

	document.getElementsByName('ip')[0].addEventListener('keypress', (event) => {
		return String.fromCharCode(event.keyCode).match(/[0-9.]/) ? true : event.preventDefault();
	});

	document.querySelectorAll('input').forEach((input) => {
		input.addEventListener('focus', () => {
			save.disabled = false;
		});
	});
});