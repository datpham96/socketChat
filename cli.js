const myFunc = require('./libs/myFunc');
const cliFunc = require('./cli/index');
global.basePath = __dirname;


let func = '';
let params = [];

process.argv.forEach((val, index) => {
    if (index == 2) {
        func = val;
    }
    else if (index > 2) {
        params.push(val);
    }
});


if(!func){
    var listFunc = Object.keys(cliFunc);
    console.log(listFunc.join("\n"));
    return false;
}

if (!myFunc.isEmpty(cliFunc[func])) {
    cliFunc[func](...params);
    return false;
} 