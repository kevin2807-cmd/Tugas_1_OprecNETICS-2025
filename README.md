# Tugas_1_OprecNETICS-2025

Proyek ini bertujuan untuk mengimplementasikan CI/CD ini pada sebuah sistem server sederhana, dengan menggunakan teknologi node js sebagai server dan google cloud platform sebagai VPS.

# Struktur Proyek
Berikut adalah struktur utama dari proyek ini:
```
Tugas_1_OprecNETICS-2025/
├── .github/
│   ├── workflows/
│       ├── CI-CD.yml
├── .gitignore
├── Dockerfile
├── Docker-compose.yml
├── package-lock.json
├── package.json
├── server.js
└── README.md
```

# Penjelasan Proyek
**1. .github/workflows/CI-CD.yml**
Berisi skrip kode untuk menjalan kan github actions yang digunakan untuk CI/CD otomatis (Continuous Integration & Continuous Deployment) dari sebuah express API menggunakan docker.
Berikut penjelasan dari CI-CD.yml


  **A.**
    Workflow akan dijalankan secara otomatis jika ada push ke branch main
    ```
    on:
      push:
        branches:
          - main
    ```

    
  **B.**
    Berisi Job yang akan dilakukan oleh github actions yang bertugas untuk membangun dan mengirim (push) Docker image dari aplikasi Express API ke Docker Hub setiap kali ada perubahan (push) pada repository.
    Proses dimulai dengan kode yang ada di repo akan di-checkout agar bisa diakses dalam runner. Setelah itu, diatur QEMU dan Docker Buildx yang berguna untuk membangun Docker image. Kemudian dilakukan caching agar instalansi dependencies Node.js lebih cepat jika pipeline dijalankan ulang.
    Setelah itu sistem akan login ke docker hub menggunakan username dan password yang sudah di implementasikan sebelumnya menggunakan kredensial yang disimpan di github secrete.Terakhir, Docker image dari aplikasi akan dibangun dari konteks direktori proyek saat ini (dengan konfigurasi dari Dockerfile), lalu dikirim ke Docker Hub dengan tag latest, menggunakan nama repository sesuai dengan nama pengguna Docker Hub.
    ```
    jobs:
    docker:
      runs-on: ubuntu-latest
      steps:
        - name: Checkout Repository
          uses: actions/checkout@v4
  
        - name: Set up QEMU
          uses: docker/setup-qemu-action@v3
  
        - name: Set up Docker Buildx
          uses: docker/setup-buildx-action@v3
  
        - name: Cache node_modules
          uses: actions/cache@v3
          with:
            path: ~/.npm
            key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
            restore-keys: |
              ${{ runner.os }}-node-
  
        - name: Login to Docker Hub
          uses: docker/login-action@v3
          with:
            username: ${{ secrets.DOCKERHUB_USERNAME }}
            password: ${{ secrets.DOCKERHUB_PASSWORD }}
  
        - name: Build and Push Docker Image
          uses: docker/build-push-action@v5
          with:
            context: .
            push: true
            tags: ${{ secrets.DOCKERHUB_USERNAME }}/express-api:latest
      ```


  **C.**
    Berisi job yang akan dijalankan hanya setelah job docker sukses, karena ada deklarasi `needs:docker`. Job ini bertujuan untuk menghubungkan SSH ke Server, lalu melakukan proses update dan restart container aplikasi dengan image terbaru dari Docker hub yang sudah berhasil di pull dari job sebelumnya.
    Langkah pertama yang dilakukan adalah melalukan checkout repository kemudian melakuan remote ke server melalui SSH dengan menggunakan informasi login ke server seperti host, username, port dan key yang telah disimpan secara aman di Github secrets. 
    Setelah berhasil melakukan remote ke server melalui SSH, runner akan ngepull docker image terbaru dari docker hub kemudian menghentikan dan menurunkan container ssat ini yang berjalan bia docker compose, setelah itu menghentikan container lama dan menghapus container lama, ini dilakukan agar saat github actions nya berjalan tidak terpengaruh oleh docker container lain atau apapun itu yang dapat mengganggu proses deployment, setelah itu menghapus image image yang tidak terpakai, dan kemudian menjalan kan ulang container dengan menggunakan docker compose.
  ```
  deploy:
  runs-on: ubuntu-latest
  needs: docker
  steps:
    - name: Checkout Repository
    uses: actions/checkout@v4

    - name: SSH to Server and Deploy
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SSH_HOST }}
        username: ${{ secrets.SSH_USERNAME }}
        port: ${{ secrets.SSH_PORT }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          sudo docker pull ${{ secrets.DOCKERHUB_USERNAME }}/express-api:latest
          sudo docker compose down
          sudo docker stop express-api
          sudo docker rm express-api
          sudo docker image prune -f
          sudo docker compose up -d
  ```

**2. Dockerfile** 

Proyek ini menerapkan multi-stage build docker untuk membangun dan menjalankan aplikasi Node.js. Multi-stage ini bertujuan agar image akhir jadi lebih kecil dan efisien, hanya berisi yang dibutuhkan untuk menjalankan aplikasi.
```
# Stage 1: Build Stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY . .

# Stage 2: Run Stage
FROM node:18-alpine AS runtime

WORKDIR /app

COPY --from=build /app /app

EXPOSE 3000

CMD ["node", "server.js"]
```

**3. Docker-compose.yml**

Proyek ini menggunakan docker compose untuk mendefinisikan bagaimana layanan API dapat dijalankan dalam docker. Bagian services akan mendeklarasikan semua container yang akan dijalankan kemudian service akan menggunakan image bernama callfyt/express-api yang dipull dari docker hub, kemudian menetukan nama container saat dijalankan yaitu `express api`. Container akan selalu direstart otomatis jika berhenti karena error, cras, atau setelah restart sistem/server. Container akan berjalan di port 3000 dan memberikan variable lingkungan ke dalam container yang diset ke production, yang biasanya digunakan oleh aplikasi Node.js untuk mengaktifkan mode performa maksimal.
```
services:
  api:
    image: callfyt/express-api:latest
    container_name: express-api
    restart: always
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
```

**4. Server.js** 

Proyek ini menggunakan expres.js sederhana yang menyediakan satu endpoint API, yaitu /health yang berisi beberapa data, yang nantinya akan dideploy dan diintegrasi menggunakan github actions
```
const express = require("express");

const app = express();

app.get("/health", (req, res) => {
  const uptimeInSeconds = process.uptime();
  res.json({
    nama: "Kevin Berutu",
    NRP: "5025231089",
    status: "UP",
    timeStamp: new Date().toISOString(),
    uptime: `${uptimeInSeconds}s`,
  });
});

const port = 3000;
app.listen(port, () =>
  console.log(`Server running on: http://localhost:${port}`)
);
```
  
