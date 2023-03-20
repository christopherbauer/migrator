# Notes on getting a local module and debugging working with typescript

## Setup local module

-   Install typescript in the project you are building as a library
-   Setup the package.json for the library output
    -   "main" - /path/to/dist/index.js
    -   "types" - /path/to/dist/types.d.ts
    -   "files" - [ "/path/to/dist "]
    -   Setup the build script to be "build":"tsc"
-   Setup the tsconfig.json for library output
    -   "compilerOptions"
        -   "declaration" - true
        -   "declarationMap" - true
        -   "sourceMap" - true
        -   "outDir" - /path/to/dist
    -   "exclude": ["./**/*.test.*"]
-   cd to the project that will use the library
    -   npm install ../path/to/project

## Setup debugging

-   Add launch.json
    {
    "type": "node",
    "request": "launch",
    "name": "Parse Sourcefiles",
    "program": "${workspaceFolder}/example/index.ts",
			"preLaunchTask": "tsc: build - example/tsconfig.json",
			"sourceMaps": true,
			"smartStep": true,
			"internalConsoleOptions": "openOnSessionStart",
			"outFiles": [
				"${workspaceFolder}/example/dist/\*.js",
    "!**/node_modules/**"
    ]
    }
