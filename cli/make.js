const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const myFunc = require('../libs/myFunc');

const makeFunc = {
    'make:controller': (fileName) => {
        let directory = path.join(basePath, 'controllers');
        let filePath = path.join(directory, fileName + '.js');
        if(fs.existsSync(filePath)) {
            console.log('controller exists ' + filePath);
            return false;
        }
        else{
            //make directory
            if(!fs.existsSync(directory)) {
                mkdirp(directory);
            }

            //make controller file
            try {
                let content = fs.readFileSync(path.join(basePath, 'cli', 'clone', 'controller.js'), { encoding: 'utf8' });
                content = content.replace('exampleCtrl', fileName);
                fs.writeFileSync(filePath, content);
                console.log('make controller ' + filePath + ' success');
            } catch (error) {
                console.log('make controller fail, try again');
            }
            
            return false;
        }
    },
    'make:model': (fileName) => {
        let directory = path.join(basePath, 'models');
        let filePath = path.join(directory, fileName + '.js');
        if(fs.existsSync(filePath)) {
            console.log('model exists ' + filePath);
            return false;
        }
        else{
            //make directory
            if(!fs.existsSync(directory)) {
                mkdirp(directory);
            }

            //make controller file
            try {
                let content = fs.readFileSync(path.join(basePath, 'cli', 'clone', 'model.js'), { encoding: 'utf8' });
                content = myFunc.replace(content, 'table', fileName);
                fs.writeFileSync(filePath, content);
                console.log('make model ' + filePath + ' success');
            } catch (error) {
                console.log(error);
                console.log('make model fail, try again');
            }
            
            return false;
        } 
    },
    'make:validate': (fileName) => {
        let directory = path.join(basePath, 'libs', 'extraValidate');
        let filePath = path.join(directory, fileName + '.js');
        if(fs.existsSync(filePath)) {
            console.log('extraValidate exists ' + filePath);
            return false;
        }
        else{
            //make directory
            let tmpContent = '';
            if(!fs.existsSync(directory)){
                mkdirp(directory);
            }

            //neu chua co file index.js => tao file
            if(!fs.existsSync(path.join(directory, 'index.js'))){
                try {
                    tmpContent = fs.readFileSync(path.join(basePath, 'cli', 'clone', 'extraValidate', 'index.js'), { encoding: 'utf8' });
                    fs.writeFileSync(path.join(directory, 'index.js'), tmpContent);
                } catch (error) {
                    console.log(error);
                    return false;
                }
                
            }

            //tao file extraVidate
            try {
                let content = fs.readFileSync(path.join(basePath, 'cli', 'clone', 'extraValidate', 'extraValidate.js'), { encoding: 'utf8' });
                fs.writeFileSync(filePath, content);
                console.log('make validate ' + filePath + ' success');
            } catch (error) {
                console.log('make validate fail, try again');
            }

            return false;
        }
    }
}


module.exports = makeFunc;