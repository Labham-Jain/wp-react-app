#!/usr/bin/env node

const process = require('process');
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
const { exit } = require('process');
const { exec } = require('child_process');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});


/* Global variable */
const configs = {
    CURRENT_DIR: process.cwd(),
    USE_PACKAGE: 'yarn',
}


/* storing assigned details */
console.log(process.argv)

const args = process.argv.splice(1);

args.forEach((arg) => {
    const splitted = arg.split('=');
    configs[splitted[0]] = splitted[1];
});

if(args[0] == "."){
    configs.projectdir = configs.CURRENT_DIR;
}

/**
 * @name makeNewFile
 * @param filename <String required> Name of the file which we need to make
 * @param data String Data we need to write
 * @param folder String folder location
 * @param current Boolean, True if we have to make file in current shell's directory
 */

const updatePackageJSON = () => {

    let packageJSONPath;
    if(configs.CURRENT_DIR !== configs.projectdir){
        packageJSONPath = path.join(configs.CURRENT_DIR, configs.projectdir);
    } else{
        packageJSONPath = configs.CURRENT_DIR;
    }
    
    const packageJSON = fs.readFileSync(path.join(packageJSONPath, '/package.json'));

    const json = JSON.parse(packageJSON);

    const scripts = {
        "start": "webpack serve --progress --mode development --config ./webpack.config.js --port 8080",
        "net": "webpack serve --progress --mode development --config ./webpack.config.js --port 8080 --host 0.0.0.0",
        "build": "webpack --config ./webpack.config.js"
    }

    json['scripts'] = scripts;
    fs.writeFileSync(path.join(packageJSONPath, '/package.json'), JSON.stringify(json));
    console.log('done');
    exit()
}

const initializeReact = () => {
    
    console.log('installing babel and eslint *this might take minutes*');
    
    installPackages(`@babel/core @babel/preset-env @babel/preset-react @svgr/webpack babel-loader css-loader eslint eslint-config-airbnb eslint-loader eslint-plugin-import eslint-plugin-jsx-a11y  eslint-plugin-react eslint-plugin-react-hooks style-loader file-loader -D`, () => {
        
        console.log('installing react *this might take minutes*');
        
        installPackages('react react-router-dom react-dom dotenv', () => {
            
            let copyToPath;
            if(configs.CURRENT_DIR !== configs.projectdir){
                copyToPath = path.join(configs.CURRENT_DIR, configs.projectdir);
            } else{
                copyToPath = configs.CURRENT_DIR;
            }

            fsExtra.copySync(path.join(__dirname, "./app-demo"), copyToPath);
            updatePackageJSON();

        });
    });
    
}

const makeSrc = () =>{
    exec(`mkdir src`, (executionError, stdout, sterr) => {
        if(executionError){
            if(executionError && executionError.message.includes('already exists')){
                initializeReact()              
            } else{
                throw executionError;
            }
        }
        if(sterr){
            console.log(sterr);
        }
        initializeReact();
    })
}

const installPackages = (packages, callback) => {

    let command = (configs.USE_PACKAGE == 'yarn' ? `yarn add ${packages}` : `npm install ${packages}`)

    exec(command, (executionError, returnedString, sterr) => {
        if(executionError){
            throw executionError;
        } else if(sterr){
            console.log(sterr);
        }
        (typeof callback === 'function') && callback();
    })
}

const initializeFolder = () => {
    exec(`${configs.USE_PACKAGE} init -y`, (executionError, returnedString, sterr) => {
        if(executionError){
            throw executionError;
        } else if(sterr){
            console.log(`Message received while executing : ${configs.USE_PACKAGE} init -y \n\n${sterr}`);
        }
        console.log('installing webpack');
        installPackages(`webpack webpack-cli webpack-dev-server ${(configs.USE_PACKAGE == 'yarn' ? '-D' : '--save-dev')}`, () => {
            makeSrc();
        })
    })
}

const changeDir = () => {
    if(configs.CURRENT_DIR !== configs.projectdir){
        process.chdir(path.join( configs.CURRENT_DIR, configs.projectdir));
    }
    initializeFolder()
}
const configPath = () => {
    if(configs.projectdir && configs.projectdir !== configs.CURRENT_DIR){
        exec(`mkdir ${configs.projectdir}`, (executionError, returnedString, sterr) =>{
            if(executionError){
                if(executionError && executionError.message.includes('already exists')){
                    changeDir();
                    return;
                } else{
                    throw executionError;
                }
            }
            if(sterr){
                console.log(sterr);
            }
            changeDir();
        })
    }
    else if(configs.projectdir == configs.CURRENT_DIR){
        initializeFolder();
    }
    else{
        throw Error('no file or project name specified!')
    }
}

const askPackage = () => {
    readline.question('yarn/npm (npm not suggested) > ', option => {
        if(option.toLowerCase() === 'npm' || option.toLowerCase() === 'yarn'){
            if(option.toLowerCase() == 'npm') USE_PACKAGE = 'npm';
            if(option.toLowerCase() == 'yarn') USE_PACKAGE = 'yarn';

            configPath();

        } else{
            askPackage()            
        }
    })
}

askPackage();