const platform = chrome || browser;

const telephone = new class client {
	constructor() {
		this.settings();

		platform.runtime.onConnect.addListener((page) => {
			this[page.name] = true;
			this.notify = this.status;

			page.onDisconnect.addListener(() => {
				this[page.name] = false;
			});
		});

		platform.runtime.onMessage.addListener((message) => {
			switch (message.action) {
				case 'refresh-page':
					platform.tabs.query({active: true, currentWindow: true}, tabs => {
						platform.tabs.reload(tabs[0].id);
					});
				break;

				case 'update-settings':
					this.settings();
				break;

				default: this.action(message.action, message.data);
			}
		});

		platform.notifications.onButtonClicked.addListener((notificationId, button) => {
			const rules = {connected: 'holdcall', onhold: 'holdcall', ringing: 'acceptcall'};
			this.action('operation', (rules[this.state] && button == 0) ? rules[this.state] : 'endcall');
		});

		platform.omnibox.onInputEntered.addListener((tel) => {
			this.action('call', tel.replace(/[^0-9]/gi, ''));
		});

		setInterval(this.update.bind(this), 2500);
	}

	settings() {
		platform.storage.local.get(null, (items) => {
			Object.entries(items).forEach(([key, value]) => {
				this[key] = value;
			});
		});

		this.status = {state: 'load', color: '#387da9'};
	}

	async action(type, data, callback) {
		const url = {
			operation: '/cgi-bin/api-phone_operation?cmd=' + data + '&passcode=',
			call: '/cgi-bin/api-make_call?phonenumber=' + data + '&account=0&password=',
			keys: '/cgi-bin/api-send_key?keys=' + data.toUpperCase() + '&passcode=',
			line: '/cgi-bin/api-get_line_status?passcode='
		};

		try {
			const response = await fetch('http://' + this.ip + url[type] + this.pass);

			if (!response.ok) {
				console.log('HTTP Error: ' + response.status);
				this.notify = {state: 'fail', color: '#ccc'};
				return;
			}

			const data = await response.json();

			if (!data || !data.response) {
				console.log('No response from Handset! Make sure the IP is correct!');
				return;
			}

			if (typeof(data.response) !== 'string') {
				console.log('Unexpected response from the Handset API!');
				return;
			}

			if (callback) callback(data);
		}
		catch (error) {
			console.log('Fetch error: ' + error.message);
			this.notify = {state: 'fail', color: '#ccc'};
		}
	}

	async update(response) {
		if (response) {
			const colors = {connected: '#acacac', onhold: '#acacac', calling: '#f7941d', ringing: '#39b54a', failed: '#e2001a'};
			const answer = response.body[0];
			const number = answer.remotename ? `${answer.remotenumber} (${answer.remotename})` : answer.remotenumber;

			platform.action.setBadgeBackgroundColor({color: colors[answer.state] || '#4285f4'});
			platform.action.setBadgeTextColor({color: '#fff'});
			platform.action.setBadgeText({text: colors[answer.state] ? '...' : ''});

			this.notify = {state: answer.state, number: number, color: colors[answer.state] || ''};
		}
		else this.action('line', 'current-state', this.update.bind(this));
	}

	set notify(data) {
		this.status = data;

		if (this.popup) platform.runtime.sendMessage(data);

		if (this.notice == 0 || [undefined, 'load', 'fail', 'idle', 'dialing'].includes(data.state)) {
			platform.notifications.clear('ctc');
			return;
		}

		const contents = {
			type: 'basic',
			iconUrl: '../assets/icon.png',
			title: platform.i18n.getMessage(data.state, '%').replace(/\s%|<b>|:<\/b>/gi, ''),
			message: data.number,
			buttons: [{title: platform.i18n.getMessage('endcall')}],
			silent: true,
			requireInteraction: true
		};

		const additive = {connected: 'holdcall', onhold: 'holdcall', ringing: 'acceptcall'};
		if (additive[data.state]) contents.buttons.unshift({title: platform.i18n.getMessage(additive[data.state])});

		platform.notifications.getAll((items) => {
			if (items.hasOwnProperty('ctc')) platform.notifications.update('ctc', contents);
			else platform.notifications.create('ctc', contents);
		});
	}
}();