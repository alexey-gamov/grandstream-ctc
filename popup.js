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
			key: '/cgi-bin/api-send_key?keys=' + data.toUpperCase() + '&passcode='
		}

		var socket = new XMLHttpRequest(), responseType = 'json';

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
				self.action('key', 'mute');
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
}

var connection = new handset();

document.addEventListener('DOMContentLoaded', function () {
	document.querySelectorAll('button').forEach(function (button) {
		button.addEventListener('click', function (event) {
			connection.execute(button.name);
		});
	});
});