window.onload = () => {
	const platform = chrome || browser;
	let settings = ['confirm', 'content'];

	platform.storage.local.get(settings, (items) => {
		if (items.content == 0) return
		else settings.confirm = items.confirm;

        const filter = (inspect) => {
			if (inspect.parentNode.nodeName === 'SCRIPT') {
				return NodeFilter.FILTER_REJECT;
			}

			let found = false;

			if (inspect.textContent) {
				const regex = /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){6,})(?:[\-\.\ \\\/]?)$/igm;
				found = inspect.textContent.match(regex);
			}

			if ('tel' in inspect.parentNode.dataset) {
				found = (inspect.parentNode.dataset.tel === 'true');
			}

			return found ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
		};

		const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, filter, false);
		const nodes = [];

		let node;

		while (node = walker.nextNode()) {
			nodes.push(node);
		}

		nodes.forEach((node) => {
			const number = node.textContent.replace(/[^0-9]/gi, '');
			const object = document.createElement('a');

			object.style.color = 'inherit';
			object.style.textDecoration = 'inherit';

			object.href = 'phone:' + number;
			object.innerHTML = node.textContent;

			node.replaceWith(object);
		});

		document.addEventListener('click', (event) => {
			if (event.target.tagName.toLowerCase() !== 'a') return;

			let [protocol, number] = event.target.getAttribute('href').split(':');

			if (['tel', 'callto', 'sip', 'phone'].includes(protocol)) {
				number = number.replace(/[^0-9]/gi, '');
				event.preventDefault();

				if (Boolean(Number(settings.confirm)) && !confirm(platform.i18n.getMessage('confirmation', number))) return;
				platform.runtime.sendMessage({action: 'call', data: number});
			}
		});
    });

	platform.storage.onChanged.addListener((changes, area) => {
		if (area === 'local') {
			if ('confirm' in changes) settings.confirm = changes.confirm.newValue;
			if ('content' in changes) platform.runtime.sendMessage({action: 'refresh-page'});
		}
	});
};