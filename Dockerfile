FROM alpine:3.13

RUN apk --no-cache add npm git

WORKDIR /opt
RUN cd /opt \
 && git clone https://github.com/hchiba1/sparqlet-run \
 && cd /opt/sparqlet-run \
 && npm install && npm link

WORKDIR /work

CMD ["sparqlet-run"]
