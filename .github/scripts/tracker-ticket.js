import fetch from "node-fetch";
import { exec as _exec } from "@actions/exec";
import { context } from "@actions/github";

const { TAG_NAME, ACTOR, OAUTH, ORG_ID, ISSUE_ID } = process.env;

const message = async () => {
  const commits = await collectTagCommits();

  const host = "https://api.tracker.yandex.net";
  const headers = {
    Authorization: `OAuth ${OAUTH}`,
    "X-Org-ID": `${ORG_ID}`,
    "Content-Type": "application/json"
  };

  const date = new Date().toLocaleDateString();
  const summary = `Релиз №${TAG_NAME.replace("rc-", "")} от ${date}`;
  const description = [
    `**Отвественный за релиз: ${ACTOR}**`,
    "Коммиты, попавшие в релиз:",
    ...commits,
  ].join("\n");

  const body = { summary, description };

  console.log(
    `Отправка запроса на обновление тикета с телом: \n`,
    JSON.stringify(body)
  );

  const responce = await fetch(`${host}/v2/issues/${ISSUE_ID}/comments`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
  });

  if (!responce.ok) {
    const data = responce.text();
    console.error(data);
    throw Error(`Запрос отклонен со статусом ${responce.statusText}`);
  }

  console.log(`Тикет успешно обновлен.`);
};

const collectTagCommits = async () => {
  let stdout = "";
  let stderr = "";

  const options = {
    listeners: {
      stdout: (data) => {
        stdout += data.toString();
      },
      stderr: (data) => {
        stderr += data.toString();
      },
    },
  };

  const sha = context.sha;
  console.log(`Sha текущего коммита `, sha.slice(0, 8));

  // поиск предыдущего тега
  await _exec("git describe", ["--tags", "--abbrev=0", sha + "^"], {
    ...options,
    ignoreReturnCode: true,
  });

  const isFirstTag = stderr.startsWith("fatal:");

  let logRange = null;
  if (isFirstTag) {
    console.log("Текущий тег - первый: получение всех предыдущих коммитов");
    logRange = sha;
  } else {
    const prevTag = stdout?.trim();
    console.log(`Прерыдущий тег ${prevTag}, получение промежуточных коммитов`);
    logRange = `${prevTag}..${sha}`;
  }

  stdout = "";
  stderr = "";

  await _exec("git log", [logRange, '--format="<%H> <%aN> <%B>"'], options);

  const commits = [];
  const matches = stdout.matchAll(/<([\w\d]+)> <([\w]+)> <([\s\S]*?)>/g);
  for (const match of matches) {
    const message = match[3].replaceAll("\n", " ").trim();
    commits.push(`${match[1]} ${match[2]} ${message}`);
  }

  stdout = "";
  stderr = "";

  console.log("Полученные коммиты:");
  console.log(commits);

  return commits;
};

message();
