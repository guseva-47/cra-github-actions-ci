import fetch from "node-fetch";

const { TAG_NAME, OAUTH, ORG_ID, ISSUE_ID } = process.env;

const dockerTag = `app:${TAG_NAME}`;

const makeComment = async () => {
  const host = "https://api.tracker.yandex.net";
  const headers = {
    Authorization: `OAuth ${OAUTH}`,
    "X-Org-ID": `${ORG_ID}`,
  };

  const body = { text: `Собрали образ с тегом ${dockerTag}` };

  console.log(
    `Отправка запроса на добавление комментария для тикета с телом: \n`,
    JSON.stringify(body)
  );

//   const responce = await fetch(`${host}/v2/issues/${ISSUE_ID}/comments`, {
//     method: "POST",
//     headers,
//     body: JSON.stringify(body),
//   });

//   if (!responce.ok)
//     throw Error(`Запрос отклонен со статусом ${responce.statusText}`);

  console.log(`Комментарий к тикету успешно добавлен.`);
};

makeComment();
