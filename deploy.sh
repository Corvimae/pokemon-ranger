#!/bin/bash

docker buildx build --platform linux/amd64 -t corvimae/pokemon-ranger:latest --push .
kubectl rollout restart deployment pokemon-ranger