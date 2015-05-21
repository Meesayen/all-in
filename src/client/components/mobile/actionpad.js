class ActionPad {
  constructor() {
  }

  onHandleClick(e) {
    e.target.classList.toggle('triggered');
  }
  _onCheck() {
    this.fire('action', { type: 'check' });
    this.$.handle.classList.remove('triggered');
  }
  _onCall() {
    this.fire('action', { type: 'call' });
    this.$.handle.classList.remove('triggered');
  }
  _onRaise() {
    // TODO: implement raise dialog and use its output
    // let amount = this.raiseSlider.value;
    let amount = 100;
    this.$.handle.classList.remove('triggered');
    this.fire('action', { type: 'raise', amount: amount });
  }
  _onFold() {
    this.fire('action', { type: 'fold' });
    this.$.handle.classList.remove('triggered');
  }
}


// Maybe with babel Stage 0 and Class properties this will
// be less ugly
ActionPad.prototype.is = 'ai-action-pad';
ActionPad.prototype.properties = {
  state: {
    type: String,
    reflectToAttribute: true
  }
};

document.registerElement('ai-action-pad', Polymer.Class(ActionPad.prototype));
