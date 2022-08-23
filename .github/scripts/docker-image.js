import { exec as _exec } from "@actions/exec";

const { TAG_NAME } = process.env;

const dockerTag = `app:${TAG_NAME}`.replace(',', '');

const dockerBuild = async () => {
  console.log(`Начата сборка докер образа с тегом ${dockerTag}`);
  try {
    // await _exec("docker", ["build", "--file", "Dockerfile.prod", '-t', dockerTag, "."]);
    await _exec(`docker build -f Dockerfile.prod -t ${dockerTag} .`)
  } catch (err) {
    console.error("Сборка докер образа завершена с ошибкой", err.message);
    return Promise.reject(err);
  }
  console.log(`Собрали образ с тегом ${dockerTag}`);
  console.log(dockerTag);
  console.log(`Внутри контейнера nginx сервер будет запущен на порту 80`);
};

dockerBuild();
