/**
 * @fileoverview Tests guido.validation.
 */

var chai = require('chai'),
  expect = chai.expect,
  guido = require('../'),
  sinon = require('sinon'),
  test,
  isValid,
  isNotValid;

chai.use(require('sinon-chai'));

test = sinon.spy(function (val, callback) {
  callback(null, !!val);
});

isValid = sinon.spy(function (err, valid, msg) {
  expect(err).to.be.null;
  expect(valid).to.be.true;
});

isNotValid = sinon.spy(function (err, valid, msg) {
  expect(err).to.be.null;
  expect(valid).to.be.false;
});

describe('guido.validation', function () {
  var vr, test;

  test = sinon.spy(function (val, callback) {
    callback(null, !!val);
  });

  beforeEach(function () {
    vr = guido.validator('foo', null, test);
  });

  it('is accessible', function () {
    expect(guido.validation).to.exist;
  });

  it('is a function', function () {
    expect(guido.validation).to.be.a('function');
  });

  it('returns a validation object', function () {
    var vn = guido.validation(vr);
    expect(guido.validation.proto.isPrototypeOf(vn)).to.be.true;
  });

  it('requires a validator', function () {
    function missingValidator() {
      var vn = guido.validation();
    }
    expect(missingValidator).to.throw(/invalid validator$/);
  });

  it('may receive params', function () {
    function missingParams() {
      var vn = guido.validation(vr);
    }
    expect(missingParams).to.not.throw(Error);
  });

  it('may receive a message', function () {
    function missingMessage() {
      var vn = guido.validation(vr, null);
    }
    expect(missingMessage).to.not.throw(Error);
  });
}); // guido.validation


describe('guido.validation.proto', function () {
  it('is accessible', function () {
    expect(guido.validation.proto).to.exist;
  });

  it('is an object', function () {
    expect(guido.validation.proto).to.be.an('object');
  });
}); // guido.validation.proto


describe('validation object', function () {
  var vr, vn;

  beforeEach(function () {
    test.reset();
    isValid.reset();
    isNotValid.reset();

    vr = guido.validator('foo', null, test);
    vn = guido.validation(vr, null, 'Lorem ipsum.');
  });

  it('inherits from guido.validation.proto', function () {
    expect(guido.validation.proto.isPrototypeOf(vn)).to.be.true;
  });

  it('has a validator', function () {
    expect(vn.validator).to.exist;
    expect(guido.validator.proto.isPrototypeOf(vn.validator)).to.be.true;
  });

  describe('.message', function () {
    it('is accessible', function () {
      expect(vn.message).to.exist;
    });

    it('is a string', function () {
      expect(vn.message).to.be.a('string');
      expect(vn.message).to.equal('Lorem ipsum.');

      var msg = sinon.spy(function () {
        return 'Foobar.';
      });

      // Assert that message functions are called right away.
      vn.setMessage(msg);
      expect(msg).to.have.been.calledOnce;
      expect(vn.message).to.be.a('string');
      expect(vn.message).to.equal('Foobar.');
    });

    it('defaults to validator\'s message', function () {
      expect(vn.message).to.not.equal(vr.message);
      vn.setMessage(null);
      expect(vn.message).to.equal(vr.message);
    });
  }); // .message


  describe('.negate', function () {
    it('is accessible', function () {
      expect(vn.negate).to.exist;
    });

    it('is a boolean', function () {
      expect(vn.negate).to.be.a('boolean');
    });
    
    it('inverts the result of a validation test if true', function () {
      vn.validate(true, isValid);
      vn.setNegate(true);
      vn.validate(true, isNotValid);

      expect(isValid).to.have.been.calledOnce;
      expect(isNotValid).to.have.been.calledOnce;
      expect(test).to.have.been.calledTwice;
    });

    it('defaults to false', function () {
      expect(vn.negate).to.be.false;
    });
  }); // .negate


  describe('#setMessage()', function () {
    it('is accessible', function () {
      expect(vn.setMessage).to.exist;
    });


    it('is a function', function () {
      expect(vn.setMessage).to.be.a('function');
    });

    it('updates the "message" property', function () {
      expect(vn.message).to.equal('Lorem ipsum.');
      vn.setMessage('Foobar.');
      expect(vn.message).to.equal('Foobar.');
    });

    it('executes it if the given message is a function', function () {
      var msg = sinon.spy(function () {
        return 'Foo!';
      });

      vn.setMessage(msg);
      expect(vn.message).to.equal('Foo!');
      expect(msg).to.have.been.calledOnce;
    });

    it('passes the additional params to it if the given message is a function',
      function () {
        var vn, vr, msg;

        vr = guido.validator('foo', null, function (val, foo, bar) {
          return !!val;
        });
        
        msg = sinon.spy(function (foo, bar) {
          return 'Bar!';
        });

        vn = guido.validation(vr, ['foo', 'bar'], msg);

        expect(vn.message).to.equal('Bar!');
        expect(msg).to.have.been.calledOnce;
        expect(msg).to.have.been.calledWithExactly('foo', 'bar');
      });

    it('gets message from validator if no message is given', function () {
      expect(vn.message).to.not.equal(vr.message);
      vn.setMessage(null);
      expect(vn.message).to.equal(vr.message);
    });
  }); // #setMessage()


  describe('#validate()', function () {
    it('is accessible', function () {
      expect(vn.validate).to.exist;
    });

    it('is a function', function () {
      expect(vn.validate).to.be.a('function');
    });

    it('calls the callback', function () {
      vn.validate(true, isValid);
      vn.validate(false, isNotValid);

      expect(isValid).to.have.been.calledOnce;
      expect(isValid).to.have.been.calledWith(null, true);
      expect(isNotValid).to.have.been.calledOnce;
      expect(isNotValid).to.have.been.calledWith(null, false);
    });

    it('requires a callback', function () {
      function missingCallback() {
        vn.validate(true);
      }
      expect(missingCallback).to.throw(/callback is required$/);
    });
  }); // #validate()
}); // validation object


