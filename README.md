Docgen
==============

Static documentation generator for typescript, sass/scss & javascript packages.

[View the Docgen site for a preview](http://robin.radic.nl/docgen)

1. Installation
```sh
npm install -g doc-gen
```

2. Initialisation
Inside the project directory for the project you want to generate documentation run the `init` command.
This will create a `docgen.json` configuration file.
```sh
docgen init
```

3. Generating the static site
Once you've edited `docgen.json` you can generate the site and start a local server to preview it.
```sh
docgen generate
docgen serve --watch
```

4. Command line help
```sh
docgen -h
docgen help <command>
```


### Copyright/License
Copyright 2015 [Robin Radic](https://github.com/RobinRadic) - [MIT Licensed](http://radic.mit-license.org) 
 
 
 
 
