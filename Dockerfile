# Obraz aplikacji Namssor (do wdrożenia, np. Cloud Run). Testy i dokumentacja nie trafiają do obrazu.
# Aplikacja nie ma zależności npm w czasie działania: wystarcza sam Node.
#   docker build -t namssor .
# Budowa wieloetapowa: etap „zwykly” (domyślny, ostatni) ma tylko kod z repo.
# Etap „wydanie” dokłada moduł wydania spoza repo, podany jako osobny kontekst budowania:
#   docker build --target wydanie --build-context modul=<folder z plikiem> --build-arg PLIK_MODULU=<nazwa pliku> -t namssor-wydanie .
FROM node:24-slim AS baza
WORKDIR /app
COPY package.json ./
COPY app ./app
RUN mkdir -p /app/data && chown node:node /app/data
ENV NODE_ENV=production \
    PORT=8080 \
    TZ=Europe/Warsaw \
    NAMSSOR_DB=/app/data/app.db
USER node
EXPOSE 8080
CMD ["node", "--disable-warning=ExperimentalWarning", "app/server.mjs"]

FROM baza AS wydanie
ARG PLIK_MODULU=modul.mjs
COPY --from=modul ${PLIK_MODULU} /app/wydanie/modul.mjs
ENV NAMSSOR_RC_MODULE=/app/wydanie/modul.mjs

FROM baza AS zwykly
