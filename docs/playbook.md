# Server playbook for Ubuntu 20.04.5 LTS

## General server

```sh
# user:root
apt update
useradd -m -s /bin/bash polis
passwd polis

apt install -y postgresql g++ git make python python-dev libpq-dev direnv
sudo -i -u postgres
# user:postgres
createuser polis

psql
postgres=# ALTER USER polis CREATEDB;
\q
```

```sh
# user:root
curl -L https://raw.githubusercontent.com/tj/n/master/bin/n -o n
bash n lts
npm install -g n
```

## polis/server

```sh
# user:root
su - polis
n 11.15.0

# user:polis
cd server
git clone https://github.com/sirodoht/polis.git
cd polis/server/

cp .envrc.example .envrc
make pginit
make pgstart

createdb polis
psql
\i postgres/migrations/000000_initial.sql
\i postgres/migrations/000001_update_pwreset_table.sql
\i postgres/migrations/000002_add_xid_constraint.sql
\q

npm run build
npm start
```

## polis/client-admin

```sh
# user:root
n 11.15.0
npm install -g npm@7.0

# user:polis
su - polis
cd polis/client-admin
cp .envrc.example .envrc
npm install
cp polis.config.template.js polis.config.js
npm run build
npm run deploy:prod
```

## polis/client-participation

```sh
# user:root
n 11.15.0
npm install -g npm@7.0

# user:polis
su - polis
cd polis/client-admin
npm install
node node_modules/node-sass/scripts/install.js
npm rebuild node-sass
npm install

cp polis.config.template.js polis.config.js
npm run build
npm run deploy:prod
```

## polis/client-report

```sh
# user:root
n 11.15.0
npm install -g npm@7.0

# user:polis
su - polis
cd polis/client-report
cp .envrc.example .envrc
cp polis.config.template.js polis.config.js
npm install
npm install # yes, twice
npm run build
npm run deploy:prod
```

## polis/file-server

```sh
# user:root
n 11.15.0
npm install -g npm@7.0

# user:polis
su - polis
cd polis/file-server
cp fs_config.template.json fs_config.json
npm install

# bring all js bundles here
mkdir build
cp -r ../client-admin/dist/* build/
cp -r ../client-report/dist/* build/
cp -r ../client-participation/dist/* build/
```

## polis/math

```sh
# user:root
apt install -y openjdk-17-jre rlwrap
curl -O https://download.clojure.org/install/linux-install-1.11.1.1155.sh
chmod +x linux-install-1.11.1.1155.sh
./linux-install-1.11.1.1155.sh
rm linux-install-1.11.1.1155.sh

clojure -A:dev -P
clojure -M:run full

clojure -X:dev-poller
```

## polis/caddy

```sh
# user:polis
cd polis/caddy
cp .envrc.example .envrc
make devserver
```

## After reboot

```sh
cd polis/

cd file-server/
npm start

cd ../math/
clojure -X:dev-poller

cd ../server/
make pgstart
npm run dev
# live at http://localhost:8000/

# dev only
cd ../caddy/
make devserver
# visit at http://localhost/
```