let date = require('date-and-time');

let now = new Date();
// date.format(now, 'YYYY-MM-DD ');
// date.parse(now, 'YYYY-MM-DD ');
console.log(now.getTime());

let book=new Date('2018-04-20 8:30');
console.log(book);
console.log(book.getTime());
if(book.getTime()-now.getTime() >0)
console.log("OK");
else
console.log("no");