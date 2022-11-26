# Polis Admin Console

## Configuration

Install the NVM following the instructions: [NVM Installation Guide](https://github.com/creationix/nvm#install-script).

Them run the commands below to install the correct Node.JS version and the application dependencies.

```sh
nvm install 14.14.0
npm install
```

## Common Problems

If you having troubles with npm dependencies try run the commands below:

```sh
npm cache clear
npm install
```

## Running Application

```sh
nvm use 14.14.0
npm start
```

## Building for Production

To build static assets into `dist/` for a production deployment, run

```sh
npm run build:prod
```


## QA Steps

### Static, outide

- User can see home page at `/home`
- User is redirected to `/home` if not logged in
- User can sign in at `/signin`
- User can reset password at `/pwreset`
- User can `/createuser` and make a new account, login
- User can see `/privacy` policy
- User can see `/tos`

### After login

- User can get `/integrate` embed code for whole site
- User can see social linkage at `/account`
- User can see all of their conversations

## Icons from the Noun Project

* Checklist by David Courey from the Noun Project
* AI by mungang kim from the Noun Project
* Science by Akriti Bhusal from the Noun Project
* Success File by Ben Davis from the Noun Project
