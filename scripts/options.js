document.addEventListener('DOMContentLoaded', function() {
	var platform = chrome || browser;
	var save = document.getElementsByName('save')[0];

	platform.storage.local.get({
		ip: '192.168.1.0',
		login: 'admin',
		pass: null,
		number: null,
		pickup: '*72',
		content: 1,
		confirm: 1
	}, function(items) {
		save.disabled = true;

		for (const [key, value] of Object.entries(items)) switch(key) {
			case 'content': case 'confirm': document.querySelector('input[name="' + key + '"][value="' + value + '"]').checked = true; break;
			default: document.getElementsByName(key)[0].value = value;
		}
	});

	save.addEventListener('click', function() {
		platform.storage.local.set({
			ip: document.getElementsByName('ip')[0].value,
			login: document.getElementsByName('login')[0].value,
			pass: document.getElementsByName('pass')[0].value,
			number: document.getElementsByName('number')[0].value,
			pickup: document.getElementsByName('pickup')[0].value,
			content: document.querySelector('input[name="content"]:checked').value,
			confirm: document.querySelector('input[name="confirm"]:checked').value
		}, function(items) {
			platform.extension.getBackgroundPage().telephone.settings();
			save.disabled = true;
		});
    });

	document.getElementsByName('ip')[0].addEventListener('keypress', function(event) {
		return String.fromCharCode(event.keyCode).match(/[0-9.]/) ? true : event.preventDefault();
	});

	document.querySelectorAll('input').forEach(function(input) {
		input.addEventListener('focus', function() {
			save.disabled = false;
		});
	});

	document.querySelectorAll('button[name],[data-locale]').forEach(function(translate) {
		translate.innerText = platform.i18n.getMessage(translate.name || translate.dataset.locale);
	});
});