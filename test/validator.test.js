/**
 * @fileoverview Tests guido.validator.
 */

var chai = require('chai'),
  expect = chai.expect,
  guido = require('../'),
  sinon = require('sinon');

chai.use(require('sinon-chai'));

function noop() {}

describe('guido.validator', function () {
  it('is accessible', function () {
    expect(guido.validator).to.exist;
  });

  it('is a function', function () {
    expect(guido.validator).to.be.a('function');
  });

  it('returns a validator', function () {
    var vr = guido.validator('foo', noop);
    expect(guido.validator.proto.isPrototypeOf(vr)).to.be.true;
  });

  it('requires a name', function () {
    function missingName() {
      return guido.validator();
    }

    expect(missingName).to.throw(/name is required$/);
  });

  it('requires a test function', function () {
    function missingFn() {
      return guido.validator('foo', 'Message.');
    }

    expect(missingFn).to.throw(/fn is required$/);
  });

  it('may receive a message', function () {
    function withMessage() {
      return guido.validator('foo', 'Lorem ipsum.', noop );
    }

    expect(withMessage).not.to.throw();

    function withoutMessage() {
      return guido.validator('foo', noop);
    }

    expect(withoutMessage).not.to.throw();
  });
}); // guido.validator


describe('guido.validator.proto', function () {
  it('is accessible', function () {
    expect(guido.validator.proto).to.exist;
  });

  it('is an object', function () {
    expect(guido.validator.proto).to.be.an('object');
  });
}); // guido.validator.proto


describe('validator object', function () {
  var vr, test;

  test = sinon.spy(function (val, done) {
    done(null, !!val);
  });

  function isValid(err, valid) {
    expect(err).to.be.null;
    expect(valid).to.be.true;
  }

  function isNotValid(err, valid) {
    expect(err).to.be.null;
    expect(valid).to.be.false;
  }

  beforeEach(function () {
    test.reset();
    vr = guido.validator('foo', 'Lorem ipsum.', test);
  });

  it('has a name', function () {
    expect(vr.name).to.equal('foo');
  });

  it('has a test fn', function () {
    expect(vr.fn).to.exist;
    expect(vr.fn).to.equal(test);
  });

  it('may have a message', function () {
    var vr2 = guido.validator('bar', noop);
    expect(vr.message).to.equal('Lorem ipsum.');
    expect(vr2.message).to.be.undefined;
  });

  describe('.allowsEmpty', function () {
    it('is accessible', function () {
      expect(vr.allowsEmpty).to.exist;
    });

    it('is a boolean', function () {
      expect(vr.allowsEmpty).to.be.a('boolean');
    });

    it('makes empty values pass the test', function () {
      vr.validate('', isValid);
      vr.validate(false, isNotValid);
    });

    it('avoids executing the test function for empty values', function () {
      vr.validate('', isValid);
      expect(test).to.not.have.been.called;
      vr.validate(false, isNotValid);
      expect(test).to.have.been.calledOnce;
    });
  }); // .allowsEmpty

  describe('.message', function () {
    it('is accessible', function () {
      expect(vr.message).to.exist;
      expect(vr.message).to.equal('Lorem ipsum.');
    });

    it('defaults to undefined', function () {
      var vr = guido.validator('foo', test);
      expect(vr.message).to.be.undefined;
    });
  }); // .message
  
  describe('.name', function () {
    it('is accessible', function () {
      expect(vr.name).to.exist;
      expect(vr.name).to.equal('foo');
    });
  }); // .name

  describe('.fn', function () {
    it('is accessible', function () {
      expect(vr.fn).to.exist;
      expect(vr.fn).to.be.a('function');
    });
  }); // .fn

  describe('#setAllowsEmpty()', function () {
    it('is a method', function () {
      expect(vr).to.respondTo('setAllowsEmpty');
    });

    it('sets the allowsEmpty flag', function () {
      expect(vr.allowsEmpty).to.be.true;
      vr.setAllowsEmpty(false);
      expect(vr.allowsEmpty).to.be.false;
    });

    it('allows chaining', function () {
      function chain() {
        vr.setAllowsEmpty(false).setAllowsEmpty(true);
      }

      expect(vr.setAllowsEmpty(false)).to.equal(vr);
      expect(chain).to.not.throw(TypeError);
    });
  }); // #setAllowsEmpty()

  describe('#setMessage()', function () {
    it('is accessible', function () {
      expect(vr.setMessage).to.exist;
    });

    it('is a function', function () {
      expect(vr.setMessage).to.be.a('function');
    });

    it('sets the validator\'s message', function () {
      expect(vr.message).to.equal('Lorem ipsum.');
      vr.setMessage('Sit dolor amen.');
      expect(vr.message).to.equal('Sit dolor amen.');
    });

    it('allows chaining', function () {
      function chain() {
        vr.setMessage('Foo.').setMessage('Bar.');
        expect(vr.message).to.equal('Bar.');
      }

      expect(vr.setMessage('Foo.')).to.equal(vr);
      expect(chain).to.not.throw(TypeError);
    });
  }); // #setMessage()

  describe('#validate()', function () {
    it('is accessible', function () {
      expect(vr.validate).to.exist;
    });

    it('is a function', function () {
      expect(vr.validate).to.be.a('function');
    });

    it('requires a callback', function () {
      function missingCallback() {
        vr.validate(1);
      }
      expect(missingCallback).to.throw(/callback is required/);
    });

    it('passes received params to the test function', function () {
      var vr2, test2;
      vr.validate(1, isValid);
      expect(test).to.have.been.calledWithExactly(1, isValid);

      test2 = sinon.spy(function (val, foo, bar, callback) {
        callback(null, !!val);
      });

      vr2 = guido.validator('bar', null, test2);
      vr2.validate(1, 'foo', 'bar', isValid);
      expect(test2).to.have.been.calledWithExactly(1, 'foo', 'bar', isValid);

      expect(test).to.have.been.calledOnce;
      expect(test2).to.have.been.calledOnce;
    });

    it('ensures the test function receives the right number of arguments',
      function () {
        var vr, test;

        test = sinon.spy(function (val, foo, bar, callback) {
          callback(null, !!val);
        });

        vr = guido.validator('foo', null, test);

        vr.validate(1, isValid);
        expect(test).to.have.been.calledWithExactly(1, undefined, undefined, isValid);
        expect(test).to.have.been.calledOnce;
      });

    it('tests a given value using the test function', function () {
      vr.validate(1, isValid);
      expect(test).to.have.been.calledWith(1);

      vr.validate(0, isNotValid);
      expect(test).to.have.been.calledWith(0);

      expect(test).to.have.been.calledTwice;
    });
  }); // #validate()
}); // validator

