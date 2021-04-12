document.addEventListener('DOMContentLoaded', function () {
	var save = document.getElementsByName('save')[0];

	chrome.storage.sync.get({
		ip: '192.168.1.0',
		login: 'admin',
		pass: null,
		number: null,
		pickup: '*72',
		confirm: 1
	}, function(items) {
		for (const [key, value] of Object.entries(items)) switch (key) {
			case 'confirm': document.querySelector('input[name="' + key + '"][value="' + value + '"]').checked = true; break;
			default: document.getElementsByName(key)[0].value = value;
		}

		save.disabled = true;
	});

	save.addEventListener('click', function() {
		chrome.storage.sync.set({
			ip: document.getElementsByName('ip')[0].value,
			login: document.getElementsByName('login')[0].value,
			pass: document.getElementsByName('pass')[0].value,
			number: document.getElementsByName('number')[0].value,
			pickup: document.getElementsByName('pickup')[0].value,
			confirm: document.querySelector('input[name="confirm"]:checked').value
		}, function(items) {
			save.disabled = true;
		});
    });

	document.querySelectorAll('input').forEach(function (input) {
		input.addEventListener('focus', function (event) {
			save.disabled = false;
		});
	});
});