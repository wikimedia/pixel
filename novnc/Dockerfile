FROM alpine

RUN set -ex; \
    apk add --no-cache \
        xfce4 \
        novnc \
        supervisor \
        x11vnc \
        xvfb \
    && rm -rf /var/cache/apk/*

ENV HOME=/root \
    LANG=en_US.UTF-8 \
    LANGUAGE=en_US.UTF-8 \
    LC_ALL=C.UTF-8 \
    DISPLAY=:0.0 \
    DISPLAY_WIDTH=1280 \
    DISPLAY_HEIGHT=1024

COPY . /app
COPY background.svg /usr/share/backgrounds/xfce/xfce-shapes.svg

CMD ["/app/entrypoint.sh"]
EXPOSE ${PIXEL_NOVNC_PORT}