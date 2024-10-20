# MOCK PREMIER LEAGUE

## Overview

- An API that serves the latest scores of fixtures of matches 

## TOOLS/ STACK
- NodeJs (TypeScript & Express)
- MongoDB
- Redis
- Docker
- POSTMAN

## Backend

    - API Documentation :
    - Language : Nodejs (Xpress framework)

## Feature List

- [x]Admin accounts which are used to
- [x]signup/login
- [x]manage teams (add, remove, edit, view)
- [x]create fixtures (add, remove, edit, view)
- [x]Generate unique links for fixture
- [x]Users accounts who can
- [x]signup/login
- [x]view teams
- [x]view completed fixtures
- [x]view pending fixtures
- [x]robustly search fixtures/teams
- [x]Only the search API should be availble to the public.

## Database

    kind: MongoDB Atlas
    db-name : mock-premier-league-api

## Setting up for Development

- Clone project.
- Install Node ( >= 16.0.0).
- Install yarn/npm.
- Copy .env.example to .env file
- Run yarn/npm install.
- Run yarn/npm start.

## Execute
- yarn/npm start 
- yarn/npm run dev

## Test
- yarn/npm run test 

## Docker
- run docker-compose build 
- run docker-compose up

