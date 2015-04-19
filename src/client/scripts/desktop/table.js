import { renderSync } from '../core/tpl';

export default class Table {
  constructor(socket) {
    this._socket = socket;
    this._root = renderSync('table', []);
    this._initComms();
  }

  get root() {
    return this._root;
  }
  get model() {
    return this._model;
  }
  set model(model) {
    this._model = model;
    this._root = renderSync('table', model);
  }

  show() {
    this._root.classList.remove('hidden');
  }
  _initComms() {
  }
}
