var telephone = new function handset() {
	var self = this;

	this.settings = function() {
		chrome.storage.sync.get(null, function(items) {
			for (const [key, value] of Object.entries(items)) {
				self[key] = value;
			}
		});
	}

	this.action = function(type, data, callback) {
		var url = {
			operation: '/cgi-bin/api-phone_operation?cmd=' + data + '&passcode=',
			call: '/cgi-bin/api-make_call?phonenumber=' + data + '&account=0&password=',
			keys: '/cgi-bin/api-send_key?keys=' + data.toUpperCase() + '&passcode=',
			line: '/cgi-bin/api-get_line_status?passcode=',
		}

		var socket = new XMLHttpRequest();

		socket.onerror = function() {
			console.log("Unknown Error Occured. Make sure that Handset IP is correct!");
		};

		socket.onload = function() {
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

	this.execute = function(name, parameter) {
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
				self.action('call', parameter);
			break;

			case 'intercept':
				self.action('call', this.pickup);
			break;
		}
	};

	this.status = function(response) {
		if (response)
		{
			var colors = {connected: '#acacac', onhold: '#acacac', calling: '#f7941d', ringing: '#39b54a', failed: '#e2001a'};
			var answer = JSON.parse(JSON.stringify(response.body[0]));

			chrome.browserAction.setBadgeBackgroundColor({color: !colors[answer.state] ? "#4285f4" : colors[answer.state]});
			chrome.browserAction.setBadgeText({text: !colors[answer.state] ? "" : "…"});

			chrome.runtime.sendMessage(answer);
		}
		else
		{
			self.action('line', 'current state', self.status);
		}
	}

	this.settings();
	this.updater = setInterval(this.status, 1250);
}