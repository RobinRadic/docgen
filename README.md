#### Getting started

1. Ensure you have the required software
`nodejs & npm`


2. Clone the repository and change directory
```sh
git clone https://github.com/packadic/framework packadic-framework
cd packadic-framework
```

3. Install all dependencies
```sh
npm install -g bower            # Installs Bower globally
npm install -g grunt-cli        # Installs Grunt globally
npm install -g tsd              # Installs tsd globally
npm install                     # Installs Node dependencies localy
bower install                   # Installs Bower components localy
bash run tsd install            # Installs shared Typescript definitions localy
bash run tsd ts install         # Installs browser Typescript definitions localy
bash run tsd lib install        # Installs node Typescript definitions localy
```

4. Use grunt to build what you need
```sh
grunt               # lists a selection of usefull tasks
grunt demo          # Build the demo
grunt dist          # Build the distribution version. Minified and optimized.
grunt serve         # Builds the demo, starts a local server and watches files for changes. 
```
