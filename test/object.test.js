/**
 * @fileoverview Tests guido.object.
 */

var chai = require('chai'),
  expect = chai.expect,
  guido = require('../'),
  sinon = require('sinon');

clock = sinon.useFakeTimers();
chai.use(require('sinon-chai'));

describe('guido.object', function () {
  it('is accessible', function () {
    expect(guido.object).to.exist;
  });

  it('is a function', function () {
    expect(guido.object).to.be.a('function');
  });

  it('creates a new properties array', function () {
    var ob1, ob2;
    
    ob1 = guido.object();
    ob2 = guido.object();

    expect(ob1.properties__).to.not.equal(ob2.properties__);
    expect(ob1.properties__).to.be.empty;
  });

  it('returns an object inheriting from guido.object.proto', function () {
    var ob = guido.object();
    expect(guido.object.proto.isPrototypeOf(ob)).to.be.true;
  });

  it('sets the message', function () {
    var ob = guido.object('Lorem ipsum.');
    expect(ob.message__).to.equal('Lorem ipsum.');
  });
}); // guido.object

describe('guido.object.proto', function () {
  it('is accessible', function () {
    expect(guido.object.proto).to.exist;
  });

  it('is an object', function () {
    expect(guido.object.proto).to.be.an('object');
  });

  it('inherits from guido.description.proto', function () {
    function inheritsFromDescriptionProto(obj) {
      return guido.description.proto.isPrototypeOf(obj);
    }
    expect(guido.object.proto).to.satisfy(inheritsFromDescriptionProto);
  });
}); // guido.object.proto

describe('object objects', function () {
  var ob;

  beforeEach(function () {
    ob = guido.object();
  });

  it('inherits from guido.description.proto', function () {
    expect(guido.object.proto.isPrototypeOf(ob)).to.be.true;
  });

  it('inherits from guido.description.proto', function () {
    expect(guido.description.proto.isPrototypeOf(ob)).to.be.true;
  });

  describe('#addProperty()', function () {
    it('is accessible', function () {
      expect(ob.addProperty).to.exist;
    });

    it('is a function', function () {
      expect(ob.addProperty).to.be.a('function');
    });

    it('adds property\'s name to the properties list', function () {
      expect(ob.properties__).to.be.empty;
      ob.addProperty('foo');
      expect(ob.properties__).to.not.be.empty;
      expect(ob.properties__[0]).to.equal('foo');
    });

    it('creates a description object if none is given', function () {
      var ds = ob.addProperty('foo');
      expect(guido.description.proto.isPrototypeOf(ds)).to.be.true;
    });

    it('sets the message of the created description object if one is provided',
      function () {
        var ds = ob.addProperty('foo', 'Lipsum.');
        expect(ds.message__).to.equal('Lipsum.');
      });

    it('creates a property in the description object', function () {
      var ds;
      expect(ob.foo).to.not.exist;
      ds = ob.addProperty('foo');
      expect(ob.foo).to.exist;
      expect(ob.foo).to.equal(ds);
    });

    it('uses the given description object if any', function () {
      var ds = guido.description();
      ob.addProperty('foo', ds);
      expect(ob.foo).to.equal(ds);
    });

    it('returns the property description (NOT the object description)',
      function () {
        var ds = guido.description(),
          r = ob.addProperty('foo', ds);
        expect(r).to.equal(ds);
        expect(r).to.not.equal(ob);
      });

    it('protects from overriding API methods', function () {
      function overrideAPI() {
        ob.addProperty('addProperty');
      }
      expect(overrideAPI).to.throw(/overriding API/);
    });

    // XXX: should warning messages from debug mode be tested?
  }); // #addProperty()

  describe('#has()', function () {
    it('is accessible', function () {
      expect(ob.has).to.exist;
    });

    it('is a function', function () {
      expect(ob.has).to.be.a('function');
    });

    it('aliases #addProperty()', function () {
      expect(ob.has).to.equal(ob.addProperty);
    });
  }); // #has()

  describe('#validate()', function () {
    var ob, vnOb, vrOb, tOb,
      pr, vnPr, vrPr, tPr,
      isValid, isNotValid;

    tOb = sinon.spy(function (obj, callback) {
      callback(null, !!obj.valid);
    });

    tPr = sinon.spy(function (val, callback) {
      callback(null, !!val);
    });

    isValid = sinon.spy(function (err, valid, msg) {
      expect(err).to.be.null;
      expect(valid).to.be.true;
      expect(msg).to.be.undefined;
    });

    isNotValid = sinon.spy(function (err, valid, msg) {
      expect(err).to.be.null;
      expect(valid).to.be.false;
      expect(msg).to.not.be.undefined;
    });

    before(function () {
      sinon.spy(guido.description.proto, 'validate');
      sinon.spy(guido.object.proto, 'validate');
    });

    after(function () {
      // Remove spies
      guido.description.proto.validate.restore();
      guido.object.proto.validate.restore();
    });

    beforeEach(function () {
      tPr.reset();
      tOb.reset();
      isValid.reset();
      isNotValid.reset();

      vrOb = guido.validator('objectFoo', null, tOb);
      vnOb = guido.validation(vrOb);
      vrPr = guido.validator('propertyFoo', null, tPr);
      vnPr = guido.validation(vrPr);
      ob = guido.object();
      pr = guido.description();
      pr.addValidation(vnPr);
    });

    it('is accessible', function () {
      expect(ob.validate).to.exist;
    });

    it('is a function', function () {
      expect(ob.validate).to.be.a('function');
    });

    it('requires a callback', function () {
      function missingCallback() {
        ob.validate('foo');
      }
      expect(missingCallback).to.throw(/callback is required/);
    });

    it('does not run any validation if callback is missing', function () {
      ob.addValidation(vnOb);
      ob.addProperty('foo', pr);

      function missingCallback() {
        ob.validate({foo : 'bar'});
      }
      expect(missingCallback).to.throw(/callback is required/);
      expect(tOb).to.not.have.been.called;
      expect(tPr).to.not.have.been.called;
    });

    it('validates all properties', function () {
      var p1, p2, obj;

      ob.addProperty('foo', pr);
      ob.addProperty('bar', pr);

      obj = {
        foo : true,
        bar : true
      };

      ob.validate(obj, isValid);
      // Twice for validating properties and once for validating itself
      expect(guido.object.proto.validate).to.have.been.calledTrice;
      expect(tPr).to.have.been.calledTwice;
    });

    it('validates self', function () {
      ob.addValidation(vnOb);
      ob.validate({valid : true}, isValid);
      expect(tOb).to.have.been.calledOnce;
      ob.validate({valid : false}, isNotValid);
      expect(tOb).to.have.been.calledTwice;
    });

    it('validates self after validating all properties', function () {
      var obj = {
        valid : true,
        foo : true
      };

      ob.addValidation(vnOb);
      ob.addProperty('foo', pr);
      ob.validate(obj, isValid);
      expect(tOb).to.have.been.called;
      expect(tPr).to.have.been.called;
      expect(tOb).to.have.been.calledAfter(tPr);
    });

    it('does NOT run self validations if any property fails', function () {
      var obj = {
        valid : true,
        foo : false
      };

      ob.addValidation(vnOb);
      ob.addProperty('foo', pr);
      ob.validate(obj, isNotValid);
      expect(tOb).to.not.have.been.called;
      expect(tPr).to.have.been.called;
    });

    it('runs property validations in parallel', function () {
      var pr1, vn1, vr1, t1, cb1,
        pr2, vn2, vr2, t2, cb2;

      // test 1: slower
      t1 = sinon.spy(function (val, callback) {
        cb1 = sinon.spy(callback);
        setTimeout(function () {
          cb1(null, !!val);
        }, 250);
      });

      // test 2: faster
      t2 = sinon.spy(function (val, callback) {
        cb2 = sinon.spy(callback);
        setTimeout(function () {
          cb2(null, !!val);
        }, 50);
      });

      vr1 = guido.validator('slower', null, t1);
      vr2 = guido.validator('faster', null, t2);

      vn1 = guido.validation(vr1);
      vn2 = guido.validation(vr2);

      pr1 = guido.description();
      pr1.addValidation(vn1);

      pr2 = guido.description();
      pr2.addValidation(vn2);

      ob.addProperty('pr1', pr1);
      ob.addProperty('pr2', pr2);

      ob.validate({
        pr1 : true,
        pr2 : true
      }, isValid);

      clock.tick(250); // fastforward

      expect(t1).to.have.been.calledOnce;
      expect(t2).to.have.been.calledOnce;
      expect(cb1).to.have.been.calledOnce;
      expect(cb2).to.have.been.calledOnce;
      expect(cb2).to.have.been.calledBefore(cb1);
    });

    // Should run self validations only AFTER all property validations
    // have finished.
    it('runs property and self validations in series', function () {
      var pr, vn, vr, t, obj;
      
      t = sinon.spy(function (val, callback) {
        cb = sinon.spy(callback);
        setTimeout(function () {
          cb(null, !!val);
        }, 250);
      });

      vr = guido.validator('foo', null, t);
      vn = guido.validation(vr);
      pr = guido.description();
      pr.addValidation(vn);

      ob.addValidation(vnOb);
      ob.addProperty('foo', pr);

      obj = {
        valid : true,
        foo : true
      };

      ob.validate(obj, isValid);
      clock.tick(250);

      expect(t).to.have.been.calledOnce;
      expect(tOb).to.have.been.calledOnce;
      expect(cb).to.have.been.calledOnce;
      expect(cb).to.have.been.calledBefore(tOb);
    });

    it('calls the callback on failure', function () {
      expect(isNotValid).to.not.have.been.called;
      ob.addValidation(vnOb);
      ob.validate({valid : false}, isNotValid);
      expect(isNotValid).to.have.been.calledOnce;
    });

    it('calls the callback on success', function () {
      expect(isValid).to.not.have.been.called;
      ob.addValidation(vnOb);
      ob.validate({valid : true}, isValid);
      expect(isValid).to.have.been.calledOnce;
    });

    it('calls the callback on error', function () {
      var vn, vr, t, cb;

      t = function (obj, callback) {
        callback(new Error('Ops'));
      };

      vr = guido.validator('ops', null, t);
      vn = guido.validation(vr);

      ob.addValidation(vn);

      cb = sinon.spy(function (err, valid, msg) {
        expect(err).to.not.be.null;
        expect(err).to.be.instanceof(Error);
        expect(valid).to.be.false;
        expect(msg).to.not.be.undefined;
      });

      ob.validate({ops : 'Oooops!'}, cb);
      expect(cb).to.have.been.calledOnce;
    });
  }); // #validate()
}); // object objects
