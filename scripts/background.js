var telephone = new function handset() {
	var platform = chrome || browser;
	var self = this;

	this.settings = function() {
		platform.storage.local.get(null, function(items) {
			for (const [key, value] of Object.entries(items)) {
				self[key] = value;
			}
		});

		self.status.now = {};
	}

	this.action = function(type, data, callback) {
		var url = {
			operation: '/cgi-bin/api-phone_operation?cmd=' + data + '&passcode=',
			call: '/cgi-bin/api-make_call?phonenumber=' + data + '&account=0&password=',
			keys: '/cgi-bin/api-send_key?keys=' + data.toUpperCase() + '&passcode=',
			line: '/cgi-bin/api-get_line_status?passcode='
		}

		var socket = new XMLHttpRequest();

		socket.onerror = function() {
			console.log("Unknown Error Occured. Make sure that Handset IP is correct!");
			self.status.now = {state: 'fail', color: '#ccc'};
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
				console.log("Unexpected response from the Handset\"s API!");
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

	this.notify = function(data) {
		if (this.notice == 0 || [undefined, 'fail', 'idle', 'dialing'].includes(data.state))
		{
			platform.notifications.clear('ctc');
			return;
		}

		var contents = {
			type: 'basic',
			iconUrl: '../assets/icon.png',
			title: platform.i18n.getMessage(data.state, '%').replace(/\s%|<b>|:<\/b>/gi, ''),
			message: data.number,
			buttons: [{title: platform.i18n.getMessage('endcall')}],
			silent: true,
			requireInteraction: true
		}

		var additive = {connected: 'holdcall', onhold: 'holdcall', ringing: 'acceptcall'};
		if (additive[data.state]) contents['buttons'].unshift({title: platform.i18n.getMessage(additive[data.state])});

		platform.notifications.getAll(function (items) {
			if (items.hasOwnProperty('ctc')) platform.notifications.update('ctc', contents);
			else platform.notifications.create('ctc', contents);
		});
	};

	this.status = {
		object: {},
		change: function(value) {},

		set now(value) {
			try {
				this.change(value);
			}
			catch(e) {
				// FireFox = Uncaught TypeError: can't access dead object
			}
			finally {
				this.object = value;
				self.notify(value);
			}
		},

		listener: function(output) {
			this.change = output;
			this.change(this.object);
		}
	};

	this.update = function(response) {
		if (response)
		{
			var colors = {connected: '#acacac', onhold: '#acacac', calling: '#f7941d', ringing: '#39b54a', failed: '#e2001a'};
			var answer = JSON.parse(JSON.stringify(response.body[0]));
			var number = answer.remotename ? answer.remotenumber + ' (' + answer.remotename + ')': answer.remotenumber;

			platform.browserAction.setBadgeBackgroundColor({color: colors[answer.state] || '#4285f4'});
			platform.browserAction.setBadgeText({text: colors[answer.state] ? '…' : ''});

			self.status.now = {state: answer.state, number: number, color: colors[answer.state]};
		}
		else
		{
			self.action('line', 'current-state', self.update);
		}
	}

	this.service = new function() {
		platform.runtime.onMessage.addListener(function (message) {
			if (message.tel) self.action('call', message.tel);
		});

		platform.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
			var rules = {connected: 'holdcall', onhold: 'holdcall', ringing: 'acceptcall'}
			var state = self.status.object['state'];

			self.action('operation', (rules[state] && buttonIndex == 0) ? rules[state] : 'endcall');
		});
	}

	this.settings();
	this.updater = setInterval(this.update, 2500);
}