#!/bin/bash

docker buildx build --platform linux/amd64,linux/arm64,linux/arm/v7 -t corvimae/pokemon-ranger:latest --push .
kubectl rollout restart deployment pokemon-ranger