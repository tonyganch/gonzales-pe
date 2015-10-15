'use strict';

export default function(syntax, gonzalesInstance) {
  const path = `${__dirname}/${syntax}`;
  return require(path)(gonzalesInstance);
}