import { renderSync, renderContentSync } from '../core/tpl';

export default class Lobby {
	constructor(socket) {
		this._template = 'lobby';
		this._model = [];
		this._root = renderSync('lobby', []);

		this._token = this._root.querySelector('.token-box');
		this._next = this._root.querySelector('.button.next');
		this._page = this._root.querySelector('.page');

		this._states = {
			current: 'landing',
			LANDING: 'landing',
			INFO: 'instructions',
			TOKEN: 'token'
		};

		this._onNextClick = this._onNextHandler.bind(this);
		this._root.querySelector('.button.next')
				.addEventListener('click', this._onNextClick);
		this._socket = socket;
		this._bindSocketEvents();
	}
	get root() {
		return this._root;
	}
	get model() {
		return this._model;
	}
	set model(model) {
		this._root.querySelector('.button.next')
				.removeEventListener('click', this._onNextClick);
		this._model = model;
		this._refresh();
		this._root.querySelector('.button.next')
				.addEventListener('click', this._onNextClick);
	}

	_refresh() {
		let firstchild;
		let children = renderContentSync(this._template, this._model);
		while ((firstchild = this._root.firstChild)) {
			this._root.removeChild(firstchild);
		}
		for (let i = 0, el; (el = children[i]); i++) {
			this._root.appendChild(el);
		}
	}

	hide() {
		this._root.style.display = 'none';
	}
	destroy() {
		// TODO deinitComms, remove listeners, remove from DOM
	}
	_bindSocketEvents() {
		this._socket.on('game:tokenized', this._handleGameTokenReceived.bind(this));
		this._socket.on('game:ready-to-play', this._handleReadyToPlay.bind(this));
		this._socket.on('game:not-ready-to-play', this._handleNotReadyToPlay.bind(this));
	}
	_onNextHandler() {
		let state = this._states.current;
		if (state === this._states.LANDING) {
			this._showInstructions();
		} else if (state === this._states.INFO) {
			this._showToken();
		} else {
			this._next.classList.add('loading');
			this._socket.emit('web:start');
		}
	}
	_showInstructions() {
		this._states.current = this._states.INFO;
		this._page.dataset.phase = this._states.INFO;
	}
	_showToken() {
		this._states.current = this._states.TOKEN;
		this._page.dataset.phase = this._states.TOKEN;
		this._next.textContent = 'START';
		this._next.classList.add('disabled');
		this._socket.emit('web:connection');
	}
	_handleGameTokenReceived(data) {
		this._token.textContent = data.token;
	}
	_handleReadyToPlay() {
		this._next.classList.remove('disabled');
	}
	_handleNotReadyToPlay() {
		this._next.classList.add('disabled');
	}

}
