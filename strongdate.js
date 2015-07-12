function SD (serverTimestamp, offset) {

  if (offset == null) {
    if (!serverTimestamp || parseInt(serverTimestamp, 10) <= 0) {
      // Wrong server time
      return Date;
    }

    offset = +new Date() - parseInt(serverTimestamp, 10);
  }

  if (Math.abs(offset) < 100000) {
    // No need for correction
    return Date;
  }

  var timezoneOffset, timezoneName;
  (function computeTimezoneOffset() {
    var local = new Date();
    var utc = new Date(+local - offset);
    var utcTime = utc.getUTCHours()*60 + utc.getUTCMinutes();
    var localTime = local.getHours()*60 + local.getMinutes();
    timezoneOffset = utcTime - localTime;

    timezoneName = 'GMT';
    if (timezoneOffset <= 0) {
      timezoneName += '+';
    } else {
      timezoneName += '-';
    }
    var timezoneOffsetAbs = Math.abs(timezoneOffset);
    if (timezoneOffsetAbs/60 < 10) {
      timezoneName += '0';
    }
    var timezoneOffsetHours = Math.floor(timezoneOffsetAbs/60);
    var timezoneOffsetMinutes = timezoneOffsetAbs - timezoneOffsetHours * 60;
    timezoneName += timezoneOffsetHours;
    if (timezoneOffsetMinutes < 10) {
      timezoneName += '0';
    }
    timezoneName += timezoneOffsetMinutes;
    timezoneName += ' (AREA 51)';
  })();

  function StrongDate() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift(null);
    this._localDate = new (Function.prototype.bind.apply(Date, args));
    this._date = new Date(this._localDate - offset);
  }

  StrongDate._offset = offset;

  [
    'getDate',
    'getDay',
    'getFullYear',
    'getHours',
    'getMilliseconds',
    'getMinutes',
    'getMonth',
    'getSeconds',
    'toDateString'
  ].forEach(function (method) {
    StrongDate.prototype[method] = function () {
      return this._localDate[method]();
    };
  });

  [
    'getUTCDate',
    'getUTCDay',
    'getUTCFullYear',
    'getUTCHours',
    'getUTCMilliseconds',
    'getUTCMinutes',
    'getUTCMonth',
    'getUTCSeconds',
    'toISOString',
    'toLocaleString',
    'toLocaleDateString',
    'toLocaleTimeString',
    'getTime',
    'valueOf',
    'toJSON'
  ].forEach(function (method) {
    StrongDate.prototype[method] = function () {
      return this._date[method]();
    };
  });

  [
    'setDate',
    'setFullYear',
    'setHours',
    'setMilliseconds',
    'setMinutes',
    'setMonth',
    'setSeconds',
    'setTime'
  ].forEach(function (method) {
    StrongDate.prototype[method] = function () {
      this._localDate[method].apply(this._localDate, arguments);
      this._date = new Date(this._localDate - offset);
      return this._date.valueOf();
    };
  });

  [
    'setUTCDate',
    'setUTCFullYear',
    'setUTCHours',
    'setUTCMilliseconds',
    'setUTCMinutes',
    'setUTCMonth',
    'setUTCSeconds'
  ].forEach(function (method) {
    StrongDate.prototype[method] = function () {
      this._date[method].apply(this._date, arguments);
      this._localDate = new Date(+this._date + offset);
      return this._date.valueOf();
    };
  });

  StrongDate.prototype.toUTCString = function() {
    return this._date.toUTCString().replace('UTC', 'GMT');
  };

  StrongDate.prototype.getTimezoneOffset = function() {
    return timezoneOffset;
  };

  StrongDate.prototype.toTimeString = function() {
    return this._localDate.toTimeString().split(' ')[0] + ' ' + timezoneName;
  };

  StrongDate.prototype.toString = function() {
    return this.toDateString() + ' ' + this.toTimeString();
  };

  return StrongDate;
}