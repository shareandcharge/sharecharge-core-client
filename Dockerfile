FROM node:alpine

ENV GETH_VERSION 1.7.3
ENV PKGS git python make g++ go alpine-sdk linux-headers

WORKDIR /usr/src/app

COPY ./ ./

# add packages
RUN apk add --update $PKGS

# install geth
RUN git clone --branch v$GETH_VERSION https://github.com/ethereum/go-ethereum.git --depth 1 && \
  cd go-ethereum && make geth && mv build/bin/geth /bin

# install core packages
RUN npm install

# install lib packages
RUN npm install --cwd ./src/lib/

# cleanup build
RUN apk del $PKGS && rm -rf /tmp/* /var/cache/apk/*

# finally run the client
CMD npm run geth-dev & npm run client