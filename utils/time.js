const toFormatWithZero = (value) => {
  if (value < 10) {
    return `0${value}`;
  }

  return value;
};

export const getDateFromTimestamp = (timestamp) => {
  const today = new Date(Number(timestamp));

  const date =
    today.getFullYear() +
    '-' +
    toFormatWithZero(today.getMonth() + 1) +
    '-' +
    toFormatWithZero(today.getDate());

  const time =
    toFormatWithZero(today.getHours()) +
    ':' +
    toFormatWithZero(today.getMinutes()) +
    ':' +
    toFormatWithZero(today.getSeconds());

  return `${date} ${time}`;
};
