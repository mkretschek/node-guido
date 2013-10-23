/**
 * @fileoverview Tests guido.description.
 */

var chai = require('chai'),
  expect = chai.expect,
  guido = require('../'),
  sinon = require('sinon');

clock = sinon.useFakeTimers();
chai.use(require('sinon-chai'));

describe('guido.description', function () {
  it('is accessible', function () {
    expect(guido.description).to.exist;
  });

  it('is a function', function () {
    expect(guido.description).to.be.a('function');
  });

  it('returns a description object', function () {
    var ds = guido.description();
    expect(guido.description.proto.isPrototypeOf(ds)).to.be.true;
  });

  it('creates a negation object', function () {
    var ds = guido.description();
    expect(ds.not).to.exist;
    expect(ds.not).to.be.an('object');
  });

  it('creates a validations array', function () {
    var ds1 = guido.description(),
      ds2 = guido.description();

    expect(ds1.validations__).to.exist;
    expect(ds1.validations__).to.be.an('array');
    expect(ds1.validations__).to.not.equal(ds2.validations__);
  });
}); // guido.description


describe('guido.description.init', function () {
  it('is accessible', function () {
    expect(guido.description.init).to.exist;
  });

  it('is a function', function () {
    expect(guido.description.init).to.be.a('function');
  });

  it('raises an error if a message is set and is not a string', function () {
    function invalidMessage() {
      guido.description.call({}, 123);
    }
    expect(invalidMessage).to.throw(/invalid message/);
  });
}); // guido.description.init

describe('guido.description.proto', function () {
  it('is accessible', function () {
    expect(guido.description.proto).to.exist;
  });

  it('is an object', function () {
    expect(guido.description.proto).to.be.an('object');
  });
}); // guido.description.proto


describe('description object', function () {
  var ds, vr, vn, test, isValid, isNotValid;

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

  var foo;
  test = foo = sinon.spy(function (val, done) {
    done(null, !!val);
  });

  beforeEach(function () {
    isValid.reset();
    isNotValid.reset();
    test.reset();
    vr = guido.validator('foo', null, test);
    vn = guido.validation(vr);
    ds = guido.description();
  });

  it('inherits from guido.description.proto', function () {
    expect(guido.description.proto.isPrototypeOf(ds)).to.be.true;
  });

  it('has a validations array', function () {
    expect(ds.validations__).to.exist;
    expect(ds.validations__).to.be.an('array');
    expect(ds.validations__).to.be.empty;
  });

  describe('#addValidation()', function () {
    it('is accessible', function () {
      expect(ds.addValidation).to.exist;
    });

    it('is a function', function () {
      expect(ds.addValidation).to.be.a('function');
    });

    it('adds a validation to the description', function () {
      expect(ds.validations__).to.be.empty;
      ds.addValidation(vn);
      expect(ds.validations__).to.not.be.empty;
      expect(ds.validations__[0]).to.equal(vn);
    });
  }); // #addValidation()

  describe('#getMessage()', function () {
    var dsMsg = 'From description object.',
      vnMsg = 'From validation object.',
      clMsg = 'From #getMessage() call.';

    beforeEach(function () {
      ds.setMessage(dsMsg);
      vn.setMessage(vnMsg);
    });

    it('is accessible', function () {
      expect(ds.getMessage).to.exist;
    });

    it('is a function', function () {
      expect(ds.getMessage).to.be.a('function');
    });

    it('replaces the first placeholder with the value being validated',
      function () {
        ds.setMessage('"%s" is not valid.');
        expect(ds.getMessage('foo')).to.equal('"foo" is not valid.');
      });

    it('accepts positional placeholders', function () {
      ds.setMessage('"%1$s" is not valid.');
      expect(ds.getMessage('bar')).to.equal('"bar" is not valid.');
    });

    it('returns a string', function () {
      expect(ds.getMessage('foo')).to.be.a('string');
    });
    
    describe('with message arg', function () {
      it('uses the given message', function () {
        expect(ds.getMessage('foo', clMsg)).to.equal(clMsg);
      });

      it('replaces placeholders in the message', function () {
        var msg = '%s is not valid';
        expect(ds.getMessage('foo', msg)).to.equal('foo is not valid');
      });
    }); // with message arg

    describe('with message from description', function () {
      it('is not used if message argument is passed', function () {
        expect(ds.getMessage('foo', 'Foobar.')).to.not.equal(dsMsg);
      });

      it('is used if message argument is not passed', function () {
        expect(ds.getMessage('foo')).to.equal(dsMsg);
      });

      it('does not use the message set for the given validation', function () {
        expect(ds.getMessage('foo', null, vn)).to.not.equal(vnMsg);
      });

      it('replaces placeholders in the message', function () {
        var msg;
        ds.setMessage('%s is not valid');
        msg = ds.getMessage('foo');
        expect(msg).to.equal('foo is not valid');
      });
    }); // with message from description

    describe('with message from validation', function () {
      it('is not used if message argument is passed', function () {
        var msg;
        msg = ds.getMessage('foo', clMsg);
        expect(msg).to.not.equal(vnMsg);
      });

      it('is not used if description has a message', function () {
        var msg;
        msg = ds.getMessage('foo');
        expect(msg).to.not.equal(vnMsg);
      });

      it('is not used if no validation is given', function () {
        var msg;
        ds.setMessage(null);
        msg = ds.getMessage('foo');
        expect(msg).to.not.equal(vnMsg);
      });

      it('is used if message argument is not passed and description ' +
         'does not have a message set', function () {
        var msg;
        ds.setMessage(null);
        msg = ds.getMessage('foo', null, vn);
        expect(msg).to.equal(vnMsg);
      });

      it('replaces placeholders in the message', function () {
        var msg;
        ds.setMessage(null);
        vn.setMessage('%s is not valid');
        msg = ds.getMessage('foo', null, vn);
        expect(msg).to.equal('foo is not valid');
      });
    }); // with message from validation

    describe('with no messages set', function () {
      beforeEach(function () {
        ds.setMessage(null);
        vn.setMessage(null);
      });

      it('falls back to guido.config.DEFAULT_MESSAGE', function () {
        var msg = ds.getMessage('foo');
        expect(msg).to.equal(guido.config.DEFAULT_MESSAGE);
      });

      it('replaces placeholders', function () {
        var msg, defaultMsg;
        defaultMsg = guido.config.DEFAULT_MESSAGE;
        guido.config.DEFAULT_MESSAGE = '%s is invalid';
        msg = ds.getMessage('foo');
        expect(msg).to.equal('foo is invalid');
        guido.config.DEFAULT_MESSAGE = defaultMsg;
      });
    }); // with no messages set
  }); // #getMessage()

  describe('#setMessage()', function () {
    it('is accessible', function () {
      expect(ds.setMessage).to.exist;
    });

    it('is a function', function () {
      expect(ds.setMessage).to.be.a('function');
    });

    it('updates the description\'s message', function () {
      var ds = guido.description();
      expect(ds.message__).to.be.undefined;
      ds.setMessage('Lipsum.');
      expect(ds.message__).to.equal('Lipsum.');
    });
  }); // #setMessage()

  describe('#validate()', function () {
    it('is accessible', function () {
      expect(ds.validate).to.exist;
    });

    it('is a function', function () {
      expect(ds.validate).to.be.a('function');
    });

    it('runs all validations', function () {
      var ds = guido.description();
      ds.addValidation(vn);
      ds.addValidation(vn);
      ds.addValidation(vn);
      ds.validate(true, isValid);
      expect(test).to.have.been.calledThrice;
    });

    it('does not wait pending validations on failure', function (done) {
      var ds, vr1, vn1, t1, vr2, vn2, t2;

      t1 = sinon.spy(function (val, callback) {
        callback(null, false); // should fail
      });

      t2 = sinon.spy(function (val, callback) {
        callback(null, true);
      });

      vr1 = guido.validator('t1', null, t1);
      vn1 = guido.validation(vr1);

      vr2 = guido.validator('t2', null, t2);
      vn2 = guido.validation(vr2);

      ds = guido.description();
      ds.addValidation(vn1);
      ds.addValidation(vn2);
      ds.validate(false, function (err, valid, msg) {
        isNotValid(err, valid, msg);
        expect(t1).to.have.been.calledOnce;
        expect(t2).to.not.have.been.called;
        done();
      });
    });

    it('runs validations in the order they were added', function (done) {
      var ds, vr1, vn1, t1, vr2, vn2, t2;

      function test(val, callback) {
        callback(null, !!val);
      }

      t1 = sinon.spy(test);
      t2 = sinon.spy(test);

      vr1 = guido.validator('t1', null, t1);
      vn1 = guido.validation(vr1);

      vr2 = guido.validator('t2', null, t2);
      vn2 = guido.validation(vr2);

      ds = guido.description();
      ds.addValidation(vn1);
      ds.addValidation(vn2);
      expect(t1).to.not.have.been.called;
      expect(t2).to.not.have.been.called;
      ds.validate(true, function (err, valid, msg) {
        isValid(err, valid, msg);
        expect(t1).to.have.been.calledOnce;
        expect(t2).to.have.been.calledOnce;
        expect(t1).to.have.been.calledBefore(t2);
        done();
      });
    });

    it('runs async validations in parallel', function (done) {
      var ds, vr1, vn1, t1, cb1, vr2, vn2, t2, cb2;

      t1 = sinon.spy(function (val, callback) {
        cb1 = sinon.spy(callback);
        setTimeout(function () {
          cb1(null, !!val);
        }, 100);
      });

      t2 = sinon.spy(function (val, callback) {
        cb2 = sinon.spy(callback);
        cb2(null, !!val);
      });

      vr1 = guido.validator('t1', null, t1);
      vn1 = guido.validation(vr1);

      vr2 = guido.validator('t2', null, t2);
      vn2 = guido.validation(vr2);

      ds = guido.description();
      ds.addValidation(vn1);
      ds.addValidation(vn2);
      expect(t1).to.not.have.been.called;
      expect(t2).to.not.have.been.called;
      ds.validate(true, function (err, valid, msg) {
        isValid(err, valid, msg);
        expect(t1).to.have.been.calledOnce;
        expect(t2).to.have.been.calledOnce;
        expect(t1).to.have.been.calledBefore(t2);
        expect(cb1).to.have.been.calledAfter(cb2);
        done();
      });

      // Fastforward time
      clock.tick(100);
    });

    it('runs the callback on success', function (done) {
      ds.validate(true, function (err, valid) {
        isValid(err, valid);
        done();
      });
    });

    it('runs the callback on failure', function (done) {
      ds.addValidation(vn);
      ds.validate(false, function (err, valid, msg) {
        isNotValid(err, valid, msg);
        done();
      });
    });

    it('runs the callback on error', function (done) {
      var ds, vn, vr, t;

      function test(val, callback) {
        callback(new Error('unexpected error'));
      }

      vr = guido.validator('foo', null, test);
      vn = guido.validation(vr);
      ds = guido.description();

      ds.addValidation(vn);
      ds.validate('any value', function (err, valid) {
        expect(err).not.to.be.null;
        expect(err).to.be.instanceof(Error);
        expect(valid).to.be.false;
        done();
      });
    });

    it('considers values valid if no validations are set', function () {
      var ds;
      ds = guido.description();
      ds.validate(true, isValid);
      ds.validate(false, isValid);
      ds.validate('', isValid);
      ds.validate(undefined, isValid);
      ds.validate([], isValid);
      ds.validate({}, isValid);
    });

    it('passes a message to the callback on failures',
      function (done) {
        ds.addValidation(vn);
        ds.validate(false, function (err, valid, msg) {
          expect(msg).to.not.be.undefined;
          done();
        });
      });
  }); // #validate()

  describe('negation object', function () {
    it('is accessible', function () {
      expect(ds.not).to.exist;
    });

    it('is an object', function () {
      expect(ds.not).to.be.an('object');
    });

    it('inherits from the description object', function () {
      expect(ds.isPrototypeOf(ds.not)).to.be.true;
    });

    it('replaces #addValidation()', function () {
      expect(ds.not.addValidation).to.not.equal(ds.addValidation);
    });

    it('adds validations to the description object', function () {
      var vn = guido.validation(vr);
      expect(ds.validations__).to.be.empty;
      ds.not.addValidation(vn);
      expect(ds.validations__).to.not.be.empty;
      expect(ds.validations__[0]).to.equal(vn);
    });

    it('sets validation\'s "negate" flag to true', function () {
      var vn = guido.validation(vr);
      expect(vn.negate).to.be.false;
      ds.not.addValidation(vn);
      expect(vn.negate).to.be.true;
    });
  }); // negation object
}); // description object
