module.exports = {
    apps: [
        {
            name: 'STARTAI_DEFAULT',
            script: './node_modules/npm/bin/npm-cli.js',
            args: 'start',
            watch: false,
            env: {
                NODE_ENV: 'STARTAI_DEFAULT',
                PORT: 3000
            }
        }
    ]
}