document.addEventListener('DOMContentLoaded', function () {
	chrome.storage.sync.get({
		ip: '192.168.1.0',
		login: 'admin',
		pass: null,
		number: null,
		pickup: '*72'
	}, function(items) {
		document.getElementsByName('ip')[0].value = items.ip;
		document.getElementsByName('login')[0].value = items.login;
		document.getElementsByName('pass')[0].value = items.pass;
		document.getElementsByName('number')[0].value = items.number;
		document.getElementsByName('pickup')[0].value = items.pickup;
	});

	document.getElementsByName('save')[0].addEventListener('click', function() {
		chrome.storage.sync.set({
			ip: document.getElementsByName('ip')[0].value,
			login: document.getElementsByName('login')[0].value,
			pass: document.getElementsByName('pass')[0].value,
			number: document.getElementsByName('number')[0].value,
			pickup: document.getElementsByName('pickup')[0].value
		});
    });
});