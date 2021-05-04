var platform = chrome || browser;

window.onload = platform.storage.local.get({content: 0, confirm: 0}, function (items) {
	if (items.content == 1)
	{
		filter = function(inspect) {
			if (inspect.parentNode.nodeName === 'SCRIPT')
			{
				return NodeFilter.FILTER_REJECT;
			}

			if (inspect.textContent)
			{
				var regex = /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){6,})(?:[\-\.\ \\\/]?)$/igm;
				var found = inspect.textContent.match(regex);
			}

			if ('tel' in inspect.parentNode.dataset)
			{
				var found = (inspect.parentNode.dataset.tel == "true");
			}

			return found ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
		}

		var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, filter, false);
		var nodes = [];

		while(node = walker.nextNode()) nodes.push(node);

		nodes.forEach(function(node) {
			var number = node.textContent.replace(/[^0-9]/gi, '');
			var object = document.createElement('a');

			object.href = 'phone:' + number;
			object.innerHTML = node.textContent;

			object.onclick = function() {
				if (Boolean(Number(items.confirm)) && !confirm(platform.i18n.getMessage('confirmation').replace('{tel}', number))) return;
				platform.runtime.sendMessage({tel: number});
			};

			node.replaceWith(object);
		});
	}
});