# pixel.wmcloud.org

Pixel runs hourly tests https://pixel.wmcloud.org comparing the latest release
branch against the `master` branch.

Its disk volume is fairly limited so here are some things to watch out for:

## Checking space left

It's a good idea to periodically ssh into the server and see how much space is
left. I've seen the `sda1` volume get down to as little as 1GB space left:

Here was its status as of July 1, 2022:

```
nray@pixel:~$ df -h /dev/sda1
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        20G   12G  7.7G  59% /
```

Here was the space of each root folder as of July 1, 2022:

```
root@pixel:/# du -h -d 1 .
4.0K	./mnt
87M	./run
309M	./root
56K	./opt
4.0K	./media
0	./sys
116M	./srv
26M	./tmp
du: cannot access './proc/2029453/task/2029453/fd/3': No such file or directory
du: cannot access './proc/2029453/task/2029453/fdinfo/3': No such file or directory
du: cannot access './proc/2029453/fd/4': No such file or directory
du: cannot access './proc/2029453/fdinfo/4': No such file or directory
0	./proc
84K	./dev
16K	./lost+found
125M	./home
11G	./var
7.4M	./etc
2.4G	./usr
72M	./boot
14G	.
```

In the past, the reduction in disk space was caused either by log files or
leftover docker images/containers/volumes. Efforts have been made to fix both by
using log rotate on the output that the pixel log files, and configuring the
`/etc/systemd/journald.conf` to have have a max of 100MB of logs via
`SystemMaxUse=100M`.

Additionally, the `pixel.sh` now attempts to remove any dangling (unused) Docker
images, containers, networks, builder cache) by executing a `docker system prune
-f` command at the end of each run. Still, its a good idea to periodically check
how much space Docker resources are taking up:


Here was the status as of July 1, 2022:

```
root@pixel:/home/nray# docker system df
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          4         3         4.9GB     2.899GB (59%)
Containers      3         3         5.546MB   0B (0%)
Local Volumes   2         2         1.222GB   0B (0%)
Build Cache     42        0         0B        0B
```

If a Docker resource seems extremely large, don't be afraid to remove it. for
example to remove a docker image:

```
docker image ls
docker image rm <image id>
```
