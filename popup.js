var telephone = chrome.extension.getBackgroundPage().telephone;

document.addEventListener('DOMContentLoaded', function() {
	document.querySelectorAll('button:not([name="makecall"])').forEach(function(button) {
		button.addEventListener('click', function() {
			telephone.execute(button.name);
		});
	});

	document.getElementsByName('makecall')[0].addEventListener('click', function(event) {
		telephone.execute('makecall', document.getElementsByName('dial')[0].value)
	});

	document.querySelectorAll('[name],[data-locale]').forEach(function(translate) {
		var message = translate.name ? translate.name : translate.dataset.locale;
		translate.innerText = chrome.i18n.getMessage(message);
	});
	
	document.getElementsByName('dial')[0].addEventListener('keypress', function(event) {
		return String.fromCharCode(event.keyCode).match(/[0-9]/) ? true : event.preventDefault();
	});

	telephone.status.listener(function(data) {
		if (typeof(data.text) != 'undefined')
		{
			var stripe = document.getElementsByTagName('blockquote')[0];			
			var number = data.msg.remotename ? data.msg.remotenumber + ' (' + data.msg.remotename + ')' : data.msg.remotenumber;

			stripe.style.backgroundColor = !data.color ? null : data.color;
			stripe.style.display = !data.color ? null : 'block';
			stripe.innerHTML = data.text.replace('{tel}', number);
		}
	});
});

chrome.tabs.executeScript({code: "window.getSelection().toString()"}, function(selection) {
	if (!chrome.runtime.lastError && selection[0].length > 0)
	{
		document.getElementsByName('dial')[0].value = selection[0].replace(/[^0-9]/gi, '');
		if (!Boolean(Number(telephone.confirm))) document.getElementsByName('makecall')[0].click();
	}
});