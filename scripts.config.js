module.exports = {
    packages: {
        development:{
            
            webpack: [
                "webpack",
                "webpack-cli",
                "webpack-dev-server",
            ],
            
            babel: [
                "@babel/core",
                "@babel/preset-env",
                "@babel/preset-react",
            ],
            
            eslint: [
                "eslint",
                "eslint-loader",
                "eslint-config-airbnb",
                "eslint-plugin-import",
                "eslint-plugin-jsx-a11y", 
                "eslint-plugin-react",
                "eslint-plugin-react-hooks"
            ],
            
            loaders:[
                "babel-webpack-loader",
                "css-loader",
                "@svgr/webpack",
                "file-loader",
            ],
        },
        production: [
            "react",
            "react-dom",
            "react-router-dom",
            "dotenv",
        ]
    },
    methods: {
        npm: {
            command: 'npm',
            install: 'install',
            development: "--save-dev",
        },
        yarn: {
            command: "yarn",
            install: "add",
            development: "-D",
        },
    },
    pack
}