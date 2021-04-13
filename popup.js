function handset() {
	var self = this;

	this.protocol = 'http://';
	this.debug = true;

	chrome.storage.sync.get(null, function(items) {
		for (const [key, value] of Object.entries(items)) {
			self[key] = value;
		}
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

			if (self.debug)
			{
				console.log("Handset response: \n" + JSON.stringify(response, null, 4));
			}

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
		socket.open('GET', this.protocol + this.ip + url[type] + this.pass);
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
				if (!Boolean(Number(connection.confirm)))
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
			// todo: parce info messages and show <blockquote> via css
			// console.log("Callback: \n" + JSON.stringify(response, null, 4));
		}
		else
		{
			// self.action('line', 'current state', self.status);
		}
	}

	// this.updater = setInterval(this.status, 3000);
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
		connection.execute('makecall');
	}
});