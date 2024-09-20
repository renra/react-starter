# React Starter

## Development flow

```
$ podman-compose build
$ podman-compose up
```

The project will be recompiled after each change (except for config - you have to restart docker-compose for those) and you can see them on `http://localhost:3000` (or whatever your port override is).


## About the bundling

* I did not want to use Webpack because it brings tons of additional complexity
* `tsc` cannot bundle the whole application on its own
* `swc` is promising and could even replace tsc in the future, but right now cannot bundle on its own either. There's a coming bundling feature called `spack` but it's not mature enough at this time.
* So, taking inspiration at the great Phoenix framework, I've used `esbuild` in the end in tandem with `tsc`.
* No watch feature is used besides the included watcher.js, build times take around 1.5s on my machine => so far so good, can be optimized later.

## Updating packages

The most painful part of the process is updating packages. Here's what I do to make that happen:

* `$ podman-compose up` - start the project
* `$ podman ps` - find the container id. There will be the `app` container and the `watcher` container. I usually use `app` but anything would work
* `$ podman exec -it CONTAINER_ID /bin/bash` - get on the container
* `$ npm i shiny_new_package` - install whatever you need
* `$ podman cp CONTAINER_ID:/usr/src/app/package.json .` - get the package.json onto the host so that it can be put to source control
* `$ podman cp CONTAINER_ID:/usr/src/app/package-lock.json .` - do the same thing with package-lock.json
* `$ podman-compose down` - seems like this is necessary with podman, might not be the case with docker
* `$ podman-compose build` - rebuild the containers. You need to rebuild both `app` and `watcher` otherwise you'll get into trouble
* `$ podman-compose up` - start the project again

I know, it's a lot of steps, but the ease of setup of the whole project and the transparency of the build pipeline (if I can even call it that way) makes up for it in my eyes. Additionally, this setup can be used for any kind of technology. React, Elm, Vue, whatever so by using it, I am not dependent on the toolchain of any given framework.
