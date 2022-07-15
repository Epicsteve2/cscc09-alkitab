# We need this extra dockerfile for postgres to setup the database when we make the container for postgres
# The copy line below copies user.sql to the init folder of the container where it is then executed on
# initialization so that when you start the postgres container the relations will already be setup for you
FROM postgres:14.4-alpine3.16

COPY ./user.sql /docker-entrypoint-initdb.d/
