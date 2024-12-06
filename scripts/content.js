const platform = chrome || browser;

window.onload = () => {
    platform.storage.local.get({content: 0, confirm: 0}, (items) => {
        if (items.content === 0) return;

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

            object.href = 'phone:' + number;
            object.innerHTML = node.textContent;

            object.onclick = () => {
                if (Boolean(Number(items.confirm)) && !confirm(platform.i18n.getMessage('confirmation', number))) return;
                platform.runtime.sendMessage({tel: number});
            };

            node.replaceWith(object);
        });
    });
};