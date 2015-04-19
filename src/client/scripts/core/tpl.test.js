/* global Text */

import { render, renderSync, renderString, renderStringSync } from './tpl';

var IS_DUST = !!window['dust'];

describe('tpl.es6: Templates helper', () => {

  beforeEach(() => {
    window["R"] = window["R"] || {};
    window["R"]["templates"] = window["R"]["templates"] || {};
    var result = "<div>\n  <p>Booking Form goes here</p>\n</div>\nWelcome here\n<ul>\n  <li>one</li>\n  <li>two</li>\n</ul>\n";
    if (IS_DUST) {
      var body_0 = (chk) => {
        return chk.w(result);
      };
      body_0.__dustBody=!0;
      window["dust"].register("vn2537948v523048v57m2384bn84357",body_0);
    }
    window["R"]["templates"]["vn2537948v523048v57m2384bn84357"] = () => {
      return result;
    };
  });

  describe('.render()', () => {
    it('should return a Promise instance', () => {
      var promise = render('vn2537948v523048v57m2384bn84357');
      expect(promise).to.be.an.instanceof(Promise);
    });
    it('should return a HTMLElement instance on Promise fulfillment', (done) => {
      render('vn2537948v523048v57m2384bn84357').then(frag => {
        expect(frag).to.be.an.instanceof(HTMLElement);
        done();
      });
    });
    it('should produce the correct node tree', (done) => {
      render('vn2537948v523048v57m2384bn84357').then(frag => {
        var node = frag;
        if (node.nodeType === 3) {
          node = node.nextSibling;
        }
        expect(node).to.be.an.instanceof(HTMLDivElement);
        expect(node.querySelector('p')).to.be.ok;
        node = node.nextSibling;
        expect(node).to.be.an.instanceof(Text);
        node = node.nextSibling;
        if (node.nodeType === 3) {
          node = node.nextSibling;
        }
        expect(node).to.be.an.instanceof(HTMLUListElement);
        expect(node.querySelectorAll('li').length).to.be.equal(2);
        done();
      });
    });
  });

  describe('.renderSync()', () => {
    it('should return a HTMLElement instance or throw an error when used with Dust', () => {
      if (IS_DUST) {
        expect(() => renderSync('vn2537948v523048v57m2384bn84357')).to.throw(Error);
        return;
      }
      var rendered = renderSync('vn2537948v523048v57m2384bn84357');
      expect(rendered).to.be.an.instanceof(HTMLElement);
    });
    it('should produce the correct node tree or throw an error when used with Dust', () => {
      if (IS_DUST) {
        expect(() => renderSync('vn2537948v523048v57m2384bn84357')).to.throw(Error);
        return;
      }
      var
        rendered = renderSync('vn2537948v523048v57m2384bn84357'),
        node = rendered;
      if (node.nodeType === 3) {
        node = node.nextSibling;
      }
      expect(node).to.be.an.instanceof(HTMLDivElement);
      expect(node.querySelector('p')).to.be.ok;
      node = node.nextSibling;
      expect(node).to.be.an.instanceof(Text);
      node = node.nextSibling;
      if (node.nodeType === 3) {
        node = node.nextSibling;
      }
      expect(node).to.be.an.instanceof(HTMLUListElement);
      expect(node.querySelectorAll('li').length).to.be.equal(2);
    });
  });

  describe('.renderString()', () => {
    it('should return a Promise', () => {
      var promise = renderString('vn2537948v523048v57m2384bn84357');
      expect(promise).to.be.an.instanceof(Promise);
    });
    it('should return a string upon Promise fulfillment', () => {
      renderString('vn2537948v523048v57m2384bn84357').then(templ => {
        expect(templ).to.be.a('string');
      });
    });
    it('should produce the correct node tree representation', () => {
      renderString('vn2537948v523048v57m2384bn84357').then(templ => {
        expect(templ).to.be.equal('<div>\n  <p>Booking Form goes here</p>\n' +
          '</div>\nWelcome here\n<ul>\n  <li>one</li>\n  <li>two</li>\n</ul>\n');
      });
    });
  });

  describe('.renderStringSync()', () => {
    it('should return a string or throw an error when used with Dust', () => {
      if (IS_DUST) {
        expect(() => renderSync('vn2537948v523048v57m2384bn84357')).to.throw(Error);
        return;
      }
      var rendered = renderStringSync('vn2537948v523048v57m2384bn84357');
      expect(rendered).to.be.a('string');
    });
    it('should produce the correct node tree representation or throw an error when used with Dust', () => {
      if (IS_DUST) {
        expect(() => renderSync('vn2537948v523048v57m2384bn84357')).to.throw(Error);
        return;
      }
      var rendered = renderStringSync('vn2537948v523048v57m2384bn84357');
      expect(rendered).to.be.equal('<div>\n  <p>Booking Form goes here</p>\n' +
        '</div>\nWelcome here\n<ul>\n  <li>one</li>\n  <li>two</li>\n</ul>\n');
    });
  });
});
