# When2Work-node

When2Work-node is a NodeJS version of the WhenToWork utility that allows one to automatically login and retrieve screenshots of one's work schedule as well as generate ICS files with work shift dates and times. 

## Installation

Navigate to the project folder 
```
cd When2Work-node
```
Use the package manager [npm](https://www.npmjs.com/get-npm) to install the dependencies found within the package.json file. Additionally, make sure [node](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) is installed as well. 

```bash
npm install
```

## Credential Configuration
Create an .env file inside of the project folder
```bash 
touch creds.env
```
Use your favorite text editor to enter credentials within .env file
```bash 
vi creds.env
```

Inside of the file, create environment variables and set them equal to your login credentials, URL, etc. 

```bash 
# This variable houses the URL of the When2Work login page
WHEN2WORK=When2WorkURL

# Environmental Variable that houses job title. This can be found on the calendar within When2Work
JOB=YourJobTitle

# Environmental Variables for credentials
USERNAME=YourUsername
PASSWORD=YourPassword
```





## Usage

```bash
# Run this script to get When2Work schedule screenshot and ICS file
node Schedule.js
```



## License
[MIT](https://choosealicense.com/licenses/mit/)
