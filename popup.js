function handset() {
	var self = this;

	chrome.storage.sync.get(null, function(items) {
		for (const [key, value] of Object.entries(items)) {
			self[key] = value;
		}

		self.status();
	});

	this.action = function (type, data, callback) {
		var url = {
			operation: '/cgi-bin/api-phone_operation?cmd=' + data + '&passcode=',
			call: '/cgi-bin/api-make_call?phonenumber=' + data + '&account=0&password=',
			keys: '/cgi-bin/api-send_key?keys=' + data.toUpperCase() + '&passcode=',
			line: '/cgi-bin/api-get_line_status?passcode=',
		}

		var socket = new XMLHttpRequest();

		socket.onload = function () {
			var response = socket.response;

			if (!response || !response.response)
			{
				console.log("No response from Handset! Make sure the IP is correct!");
				return;
			}

			if (typeof(response.response) !== "string")
			{
				console.log("Unexpected response from the Handset\"s API!")
				return;
			}

			if (callback)
			{
				callback(response);
			}
		};

		socket.responseType = 'json';
		socket.open('GET', 'http://' + this.ip + url[type] + this.pass);
		socket.send();
	};

	this.execute = function(name) {
		switch (name) {
			case 'acceptcall':
				self.action('operation', 'acceptcall');
			break;

			case 'endcall':
				self.action('operation', 'endcall');
			break;

			case 'mutecall':
				self.action('keys', 'mute');
			break;

			case 'holdcall':
				self.action('operation', 'holdcall');
			break;

			case 'makecall':
				self.action('call', document.getElementsByName('dial')[0].value);
			break;

			case 'intercept':
				self.action('call', this.pickup);
			break;
		}
	};

	this.status = function(response) {
		if (response)
		{
			var notice = {
				idle: {text: '<b>Информация:</b> отсутствует', color: null, hide: true},
				dialing: {text: '<b>Информация:</b> набор номера', color: null, hide: true},
				connected: {text: '<b>Текущий разговор:</b> {tel}', color: '#acacac'},
				onhold: {text: '<b>Удержание разговора:</b> {tel}', color: '#acacac'},
				calling: {text: '<b>Исходящий вызов:</b> {tel}', color: '#f7941d'},
				ringing: {text: '<b>Входящий вызов:</b> {tel}', color: '#39b54a'},
				failed: {text: 'Вызов на номер {tel} не удался', color: '#e2001a'}
			}

			var data = JSON.parse(JSON.stringify(response.body[0]));
			var line = document.getElementsByTagName('blockquote')[0];

			line.style.backgroundColor = notice[data.state].color;
			line.style.display = notice[data.state].hide ? null : 'block';
			line.innerHTML = notice[data.state].text.replace('{tel}', data.remotenumber);
		}
		else
		{
			self.action('line', 'current state', self.status);
		}
	}

	this.updater = setInterval(this.status, 1250);
}

var connection = new handset();

document.addEventListener('DOMContentLoaded', function () {
	document.querySelectorAll('button').forEach(function (button) {
		button.addEventListener('click', function (event) {
			connection.execute(button.name);
		});
	});
});

chrome.tabs.executeScript({
	code: "window.getSelection().toString()"
}, function(selection) {
	if (!chrome.runtime.lastError && selection[0].length > 0)
	{
		document.getElementsByName('dial')[0].value = selection[0].replace(/[^0-9,]/gi, '');
		if (!Boolean(Number(connection.confirm))) connection.execute('makecall');
	}
});