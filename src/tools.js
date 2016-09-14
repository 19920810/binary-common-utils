export const parseQueryString = () => {
  if (typeof window === 'undefined') {
    return {};
  }
  const str = window.location.search;
  const objURL = {};
  str.replace(
    new RegExp('([^?=&]+)(=([^&]*))?', 'g'),
    (a0, a1, a2, a3) => {
      objURL[a1] = a3;
    }
  );
  return objURL;
};

export const getObjectValue = (obj) => obj[Object.keys(obj)[0]];

export const getUTCTime = (date) => {
  const dateObject = new Date(date);
  return ('0' + dateObject.getUTCHours())
      .slice(-2) + ':' + ('0' + dateObject.getUTCMinutes())
      .slice(-2) + ':' + ('0' + dateObject.getUTCSeconds())
      .slice(-2);
};

export const strToXml = (str) => {
  let xmlDoc;
  let parser;
  if (window.DOMParser) {
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(str, 'text/xml');
  } else if (window.ActiveXObject) {
    xmlDoc = new window.ActiveXObject('Microsoft.XMLDOM');
    xmlDoc.async = false;
    xmlDoc.loadXML(str);
  }
  return xmlDoc;
};

export const expandDuration = (duration) => duration.replace(/t/g, ' tick')
    .replace(/s/g, ' second')
    .replace(/m/g, ' minute')
    .replace(/h/g, ' hour')
    .replace(/d/g, ' day') + '(s)';

export const durationToSecond = (duration) => {
  const durationInt = parseInt(duration, 10);
  const durationType = duration.replace(durationInt.toString(), '');
  if (durationType === 's') {
    return durationInt;
  }
  if (durationType === 't') {
    return durationInt * 2;
  }
  if (durationType === 'm') {
    return durationInt * 60;
  }
  if (durationType === 'h') {
    return durationInt * 60 * 60;
  }
  if (durationType === 'd') {
    return durationInt * 60 * 60 * 24;
  }
  throw Error('Duration type not accepted');
};

export const durationAccepted = (duration, min) => durationToSecond(duration) >= durationToSecond(min);
