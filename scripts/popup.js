var platform = chrome || browser;
var telephone = platform.extension.getBackgroundPage().telephone;

document.addEventListener('DOMContentLoaded', function() {
	document.querySelectorAll('button').forEach(function(button) {
		button.addEventListener('click', function() {
			switch (button.name) {
				case 'mutecall': telephone.action('keys', 'mute'); break;
				case 'makecall': telephone.action('call', document.getElementsByName('dial')[0].value); break;
				case 'intercept': telephone.action('call', telephone.pickup); break;
				default: telephone.action('operation', button.name);
			}
		});
	});

	document.querySelectorAll('button[name],[data-locale]').forEach(function(translate) {
		translate.innerText = platform.i18n.getMessage(translate.name || translate.dataset.locale);
	});

	document.getElementsByName('dial')[0].addEventListener('keypress', function(event) {
		return String.fromCharCode(event.keyCode).match(/[0-9]/) ? true : event.preventDefault();
	});

	telephone.status.listener(function(data) {
		if (typeof(data.state) != 'undefined')
		{
			var stripe = document.getElementsByTagName('blockquote')[0];			

			stripe.style.backgroundColor = data.color || null;
			stripe.style.display = data.color ? 'block' : null;
			stripe.innerHTML = platform.i18n.getMessage(data.state, data.number);
		}

		document.querySelectorAll('button, input').forEach(function(control) {
			control.disabled = (data.state == 'fail');
		});
	});
});

platform.tabs.executeScript({code: "window.getSelection().toString()"}, function(selection) {
	if (!platform.runtime.lastError && selection[0].length > 0)
	{
		document.getElementsByName('dial')[0].value = selection[0].replace(/[^0-9]/gi, '');
		if (!Boolean(Number(telephone.confirm))) document.getElementsByName('makecall')[0].click();
	}
});