const alpha = 'abcdefghijklmnopqrstuvwxyz';
const numbers = '0123456789';
const characters = `${alpha}${alpha.toUpperCase()}${numbers}`;

function generateRandomString(length: number): string {
  let randomString = '';
  for (let i = 0; i < length; i++) {
    let randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }

  return randomString;
}

export default generateRandomString;
