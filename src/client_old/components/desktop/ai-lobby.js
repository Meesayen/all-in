import { communicator, eventHandler } from 'lib/decorators/socket';

const STATES = {
  LANDING: 'landing',
  INFO: 'instructions',
  TOKEN: 'token'
};

@communicator
class Lobby {
  beforeRegister() {
    this.is = 'ai-lobby';
    this.properties = {
      state: {
        type: String,
        reflectToAttribute: true
      }
    };
  }

  created() {
  }

  ready() {
    this.token = '';
    this.state = STATES.LANDING;

    this._onNextClick = this._onNextHandler.bind(this);
    this.querySelector('.button.next')
        .addEventListener('click', this._onNextClick);
  }

  detached() {
    console.log('detached');
    // TODO kill communications
  }

  _onNextHandler() {
    let state = this.state;
    if (state === STATES.LANDING) {
      this._showInstructions();
    } else if (state === STATES.INFO) {
      this._showToken();
    } else {
      this.$.nextBtn.classList.add('loading');
      this.socket.emit('web:start');
    }
  }
  _showInstructions() {
    this.state = STATES.INFO;
  }
  _showToken() {
    this.state = STATES.TOKEN;
    this.$.nextBtn.textContent = 'START';
    this.$.nextBtn.classList.add('disabled');
    this.socket.emit('web:connection');
  }

  @eventHandler('game:tokenized')
  _handleGameTokenReceived(data) {
    this.token = data.token;
  }

  @eventHandler('game:ready-to-play')
  _handleReadyToPlay() {
    this.$.nextBtn.classList.remove('disabled');
  }

  @eventHandler('game:not-ready-to-play')
  _handleNotReadyToPlay() {
    this.$.nextBtn.classList.add('disabled');
  }

}

Polymer(Lobby);
