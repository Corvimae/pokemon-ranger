#!/bin/bash

docker build -t corvimae/pokemon-ranger:latest .
docker push corvimae/pokemon-ranger:latest
kubectl rollout restart deployment pokemon-ranger