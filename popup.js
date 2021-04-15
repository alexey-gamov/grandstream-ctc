var telephone = chrome.extension.getBackgroundPage().telephone;

document.addEventListener('DOMContentLoaded', function () {
	document.querySelectorAll('button:not([name="makecall"])').forEach(function (button) {
		button.addEventListener('click', function (event) {
			telephone.execute(button.name);
		});
	});

	document.getElementsByName('makecall')[0].addEventListener('click', function (event) {
		telephone.execute('makecall', document.getElementsByName('dial')[0].value)
	});

	document.querySelectorAll('[name],[data-locale]').forEach(function(translate) {
		var message = translate.name ? translate.name : translate.dataset.locale;
		translate.innerText = chrome.i18n.getMessage(message);
	});
});

chrome.runtime.onMessage.addListener(function (data) {
	if (typeof data === 'object' && data !== null)
	{	
		var colors = {connected: '#acacac', onhold: '#acacac', calling: '#f7941d', ringing: '#39b54a', failed: '#e2001a'};
		var stripe = document.getElementsByTagName('blockquote')[0];

		stripe.style.backgroundColor = !colors[data.state] ? null : colors[data.state];
		stripe.style.display = !colors[data.state] ? null : 'block';
		stripe.innerHTML = chrome.i18n.getMessage(data.state).replace('{tel}', data.remotenumber);
	}
});

chrome.tabs.executeScript({code: "window.getSelection().toString()"}, function(selection) {
	if (!chrome.runtime.lastError && selection[0].length > 0)
	{
		document.getElementsByName('dial')[0].value = selection[0].replace(/[^0-9]/gi, '');
		if (!Boolean(Number(telephone.confirm))) document.getElementsByName('makecall')[0].click();
	}
});