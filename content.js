window.onload = chrome.storage.sync.get({content: 0}, function (items) {
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
			var tel = node.textContent.replace(/[^0-9]/gi, '');
			var link = document.createElement('a');

			link.href = 'phone:' + tel;
			link.innerHTML = node.textContent;
			link.onclick = function() {chrome.runtime.sendMessage(tel)};

			node.replaceWith(link);
		});
	}
});