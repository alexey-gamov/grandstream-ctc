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
});

chrome.runtime.onMessage.addListener(function (data) {
	if (typeof data === 'object' && data !== null)
	{
		var notice = {
			idle: {text: '<b>Информация:</b> отсутствует', color: null, hide: true},
			dialing: {text: '<b>Информация:</b> набор номера', color: null, hide: true},
			connected: {text: '<b>Текущий разговор:</b> {tel}', color: '#acacac'},
			onhold: {text: '<b>Удержание разговора:</b> {tel}', color: '#acacac'},
			calling: {text: '<b>Исходящий вызов:</b> {tel}', color: '#f7941d'},
			ringing: {text: '<b>Входящий вызов:</b> {tel}', color: '#39b54a'},
			failed: {text: 'Вызов на номер {tel} не удался', color: '#e2001a'}
		}

		var line = document.getElementsByTagName('blockquote')[0];

		line.style.backgroundColor = notice[data.state].color;
		line.style.display = notice[data.state].hide ? null : 'block';
		line.innerHTML = notice[data.state].text.replace('{tel}', data.remotenumber);
	}
});

chrome.tabs.executeScript({code: "window.getSelection().toString()"}, function(selection) {
	if (!chrome.runtime.lastError && selection[0].length > 0)
	{
		document.getElementsByName('dial')[0].value = selection[0].replace(/[^0-9]/gi, '');
		if (!Boolean(Number(telephone.confirm))) document.getElementsByName('makecall')[0].click();
	}
});