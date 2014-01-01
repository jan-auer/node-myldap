# MyLDAP

## Installation

Currently this project is not available in the node registry. Just check out this repository with `git clone https://github.com/cyber-tron/node-myldap.git`. Then, run `npm install` to fetch all project dependencies. Congratulations, you are ready to go! 

## Usage

### Configuration

Before you run MyLDAP for the first time, copy `config.json.example` and edit the MySQL connection. The configuration has the following format:

 * `ldap`: LDAP server configuration
 	* `port`: The port, at wich the server will listen. Defaults to **1389**.
 	* `dn`: The distinguished name of this server (e.g. *dc=example,dc=org*).
 * `backend`: MySQL backend configuration
 	* `host`: The MySQL server host name or IP address.
 	* `user`: The user used to connect to the database.
 	* `pwd`: A password supplied when connecting. 
 	* `db`: The name of the database which contains user data.
 	* `table`: The users table name in the database.
 * `attributes`: A list of attributes which will be served by the LDAP server.
 	
All fields in the configuration are mandatory, but some can also be left empty (e.g. `backend.pwd`). Attributes can be chosen freely, but the distinguished name (*dn*) is mandatory.

### Production - myldapd

Among source codes, the repository also contains the standalone executable `myldap` and the daemon `myldapd`. To start the server, you have to provide the path to a configuration file. In daemon mode, the server is started with

    myldapd start config.json
    
The daemon also accepts `stop` and `restart` without further parameters.

**Note:** You can also add the bin path to your PATH environment variable or link the binaries. This makes it easier to control the MyLDAP server at any time. 

### Development - NPM

When using **NPM** to start the MyLDAP server, please make sure a valid `config.json` exists in the project root. Then, simply run:

    npm start

The NPM script also accepts all other commands of myldapd. 