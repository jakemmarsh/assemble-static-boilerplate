'use strict';

module.exports.if_equals = function(a, b, opts) {
  if ( a === b ) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
};