# Pixel

![Visual regression HTML reporter showing failing and passing tests](assets/reporter.png)

🚨 **Pixel is a work in progress and experimental. Only use it when you're feeling dangerous.** 🚨

Pixel is a visual regression tool for MediaWiki developers/QA engineers that
helps you replace manual testing with automated tests that catch web ui
regressions before users see them. It uses [BackstopJS](https://github.com/garris/BackstopJS) under the hood.

Please read [T302246](https://phabricator.wikimedia.org/T302246) for the
motivation behind Pixel.

## Quick Start

First, clone the repo wherever you wish and `cd` into it:

```sh
git clone https://github.com/nicholasray/pixel.git && cd pixel
```

Pixel comes with a large amount of database seed data to simulate a production
environment. The database dump is hosted externally and needs to be downloaded
into Pixel's root folder before using it:

```sh
curl https://pixeltool.netlify.app/database.tar.gz -O 
```

**Do not extract the `tar.gz` file**. Pixel expects a `database.tar.gz` file in its
root directory and will extract it in its containers.

Pixel runs in multiple Docker containers to eliminate inconsistent rendering
issues across environments and also to make local installation a breeze. Please
install [Docker](https://docs.docker.com/get-docker/) and **make sure it is
running** prior to using Pixel.

Finally, start all of the required docker services:

```sh
npm start
```

## Usage

Your workflow will usually involve the following ordered steps:

### 1) Take reference snapshots of `master` code

If you want to checkout the latest code in `master` from MediaWiki core and all
of its installed extensions and skins and then take reference snapshots that
your test snapshots will be compared against, then:

```sh
npm run reference
```

### 2) Pull code changes related to your feature

Use the `npm run bash` command to enter the MediaWiki container where you can
make any code changes you wish. For example, if you want to checkout a `Vector`
gerrit patch with [git
review](https://docs.opendev.org/opendev/git-review/latest/) and rebase it on
top of master, then: 

```sh
npm run bash
cd skins/Vector && git review -d <PATCH_ID> && git rebase origin/master
exit
```

If needed, Pixel's root directory also includes a `LocalSettings.php` which can be edited at anytime (no need to restart Docker) if there is MediaWiki configuration you'd like to add, change or remove.

### 3) Run all tests

If you want to run all of the visual regression tests and compare the snapshots taken against the reference snapshots, then:

```sh
npm test 
```

An HTML report of your test resuls with screenshots will be opened automatically
on a Mac after the test completes. If you're not on a Mac, you can manually open
the file at `backstop_data/html_report/index.html`.

Additionally, Pixel runs a server at `http://localhost:3000` (default) which can
be used to interact with/debug the same server that the tests use.

### Stopping the services

If you want to stop all of Pixel's services, run:

```
npm stop
```

### Cleanup

Sometimes after making MediaWiki code changes or database changes you just want
to throw away everything and start Pixel with a clean slate. To do that, simply
run:

```
npm run clean
npm start
```

Note that if you've made changes to LocalSettings.php and want to reset that,
you'll also need to run:

```
git checkout -- LocalSettings.php
```

## Development

### Changing or adding tests

All tests are located in [backstop.config.js](app/backstop.config.js) and follow
BackstopJS conventions. For more info on how to change or add tests, please
refer to the [BackstopJS](https://github.com/garris/BackstopJS) README.

### Configuring MediaWiki

All mediawiki config is in [LocalSettings.php](LocalSettings.php) and can be
changed. For example, maybe you are working on a new feature in the `Vector`
skin that is feature flagged and want to enable it. All changes made in this
file will be automatically reflected in the Docker services without having to
restart them.

### Database changes

Make any database changes (e.g. adding new pages) without fear of being able to
[revert them](#cleanup).

If you'd like to save the state of your database that you can import into Pixel
anytime later, then:

```sh
npm run db:save
```

The backup will be saved inside the `backups` directory (e.g.
`backups/database.<datetime>tar.gz`). You can make Pixel use the file by
replacing the `database.tar.gz` file in the root directory and then running the
[cleanup](#cleanup) commands.

### Installed extensions and skins

Pixel ships with a number of MediaWiki extensions and skins already installed.
Please reference the [Dockerfile.mediawiki](Dockerfile.mediawiki) file to see a
list of these.
