var platform = (chrome) ? chrome : browser;

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
			var call = node.textContent.replace(/[^0-9]/gi, '');
			var link = document.createElement('a');

			link.href = 'phone:' + call;
			link.innerHTML = node.textContent;

			link.onclick = function() {
				if (Boolean(Number(items.confirm)) && !confirm(platform.i18n.getMessage('confirmation').replace('{tel}', call))) return;
				platform.runtime.sendMessage(call);
			};

			node.replaceWith(link);
		});
	}
});