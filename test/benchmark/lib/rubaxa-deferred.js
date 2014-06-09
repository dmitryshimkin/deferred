/**
 * @author RubaXa <trash@rubaxa.org>
 * @license MIT
 */
(function (){
  "use strict";


  function _then(promise, method, callback){
    return function (){
      var args = arguments;

      if( typeof callback === 'function' ){
        var retVal = callback.apply(promise, args);
        if( retVal && typeof retVal.then === 'function' ){
          retVal.done(promise.resolve).fail(promise.reject);
          return;
        }
      }

      promise[method].apply(promise, args);
    };
  }



  /**
   * Fastest Deferred.
   * @returns {Deferred}
   */
  var Deferred = function (){
    var
      _args,
      _doneFn = [],
      _failFn = [],

      dfd = {
        done: function (fn){
          _doneFn.push(fn);
          return dfd;
        },

        fail: function (fn){
          _failFn.push(fn);
          return dfd;
        },

        then: function (doneFn, failFn){
          var promise = Deferred();

          dfd
            .done(_then(promise, 'resolve', doneFn))
            .fail(_then(promise, 'reject', failFn))
          ;

          return promise;
        },

        always: function (fn){
          return dfd.done(fn).fail(fn);
        },

        resolve: _setState(true),
        reject: _setState(false)
      }
      ;


    function _setState(state){
      return function (){
        _args = arguments;

        dfd.done =
          dfd.fail =
            dfd.resolve =
              dfd.reject = function (){
                return dfd;
              };

        dfd[state ? 'done' : 'fail'] = function (fn){
          if( typeof fn === 'function' ){
            fn.apply(dfd, _args);
          }
          return dfd;
        };

        var
          fn
          , fns = state ? _doneFn : _failFn
          , i = 0, n = fns.length
          ;

        for( ; i < n; i++ ){
          fn = fns[i];
          if( typeof fn === 'function' ){
            fn.apply(dfd, _args);
          }
        }

        fns = _doneFn = _failFn = null;

        return dfd;
      }
    }

    return dfd;
  };


  /**
   * @param {Array} args
   * @returns {defer|*}
   */
  Deferred.when = function (args){
    var
      dfd = Deferred()
      , d
      , i = args.length
      , remain = i || 1
      , _doneFn = function (){
        if( --remain === 0 ){
          dfd.resolve();
        }
      }
      ;

    if( i === 0 ){
      _doneFn();
    }
    else {
      while( i-- ){
        d = args[i];
        if( d && d.then ){
          d.then(_doneFn, dfd.reject);
        }
      }
    }

    return dfd;
  };


  // exports
  if( typeof define === "function" && define.amd ){
    define(function (){
      return Deferred;
    });
  } else if( typeof module != "undefined" && module.exports ){
    module.exports = Deferred;
  }
  else {
    window.RubaxaDeferred = Deferred;
  }
})();
