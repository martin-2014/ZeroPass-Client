const { Translate } = require("@google-cloud/translate").v2;
const fs = require("fs");
const path = require("path");

const EXTENSION = ".json";
const GLOSSARIESFILE = "glossaries.json";
const languages = {
    zh: { locale: "zh-CN", source: "en" },
    en: { locale: "en-US", source: "zh" },

    de: { locale: "de-DE", source: "en" },
    fr: { locale: "fr-FR", source: "en" },
    it: { locale: "it-IT", source: "en" },
    es: { locale: "es-ES", source: "en" },
    pt: { locale: "pt-PT", source: "en" },
    ja: { locale: "ja-JP", source: "zh" },
    ko: { locale: "ko-KR", source: "zh" },
    th: { locale: "th-TH", source: "zh" },
    ms: { locale: "ms-MY", source: "zh" },
    vi: { locale: "vi-VN", source: "zh" },
    "zh-tw": { locale: "zh-TW", source: "zh" },
};

const projectId = "zeropass-351509";
const translate = new Translate({ projectId });

function prepareTargetFolder(folder) {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }
}

function getJson(fullName) {
    let json = {};
    if (fs.existsSync(fullName)) {
        const rawdata = fs.readFileSync(fullName);
        json = JSON.parse(rawdata);
    }
    return json;
}

async function translateText(sourceText, sourceLang, targetLang) {
    const [translation] = await translate.translate(sourceText, {
        from: sourceLang,
        to: targetLang,
    });
    console.log(`${sourceLang}=>${targetLang}:${sourceText} => ${translation}`);
    return translation;
}

async function translateFile(
    sourceLang,
    targetLang,
    sourceFullName,
    targetFullName
) {
    let sourceObject = getJson(sourceFullName);
    let targetObject = getJson(targetFullName);

    for (const [key, value] of Object.entries(sourceObject)) {
        if (path.basename(sourceFullName) === GLOSSARIESFILE) {
            targetObject[key] = value;
        } else {
            if (!(key in targetObject)) {
                const translatedValue = await translateText(
                    value,
                    sourceLang,
                    targetLang
                );
                targetObject[key] = translatedValue;
            }
        }
    }
    fs.writeFileSync(targetFullName, JSON.stringify(targetObject, null, 4));
}

function updateEntrance(
    sourceLanguage,
    sourceFullName,
    targetLanguage,
    targetFullFile
) {
    if (fs.existsSync(targetFullFile)) {
        fs.truncateSync(targetFullFile);
    }
    const content = fs.readFileSync(sourceFullName, { encoding: "utf-8" });
    const targetContent = content.replaceAll(sourceLanguage, targetLanguage);
    fs.writeFileSync(targetFullFile, targetContent);
}

async function translateRender(language) {
    const rootFolder = path.join(__dirname, "render", "src", "locales");
    const source = languages[languages[language].source];
    const target = languages[language];

    const sourceFolder = path.join(rootFolder, source.locale);
    const sourceFiles = fs.readdirSync(sourceFolder);
    const targetFolder = path.join(rootFolder, target.locale);
    for (const file of sourceFiles) {
        if (path.extname(file).toLowerCase() === EXTENSION) {
            const sourceFullName = path.join(sourceFolder, file);
            const targetFullName = path.join(targetFolder, file);
            prepareTargetFolder(targetFolder);
            await translateFile(
                target.source,
                language,
                sourceFullName,
                targetFullName
            );
        }
    }

    const sourceFullName = path.join(rootFolder, `${source.locale}.ts`);
    const targetFullName = path.join(rootFolder, `${target.locale}.ts`);
    updateEntrance(
        source.locale,
        sourceFullName,
        target.locale,
        targetFullName
    );
}

async function translateMain(language) {
    const rootFolder = path.join(__dirname, "src", "i18n", "locales");
    const source = languages[languages[language].source];
    const target = languages[language];

    const sourceFullName = path.join(rootFolder, `${source.locale}.json`);
    const targetFullName = path.join(rootFolder, `${target.locale}.json`);
    await translateFile(
        target.source,
        language,
        sourceFullName,
        targetFullName
    );
}

async function translateWithLanguages(languages) {
    for (language of languages) {
        if (language == "en") continue;
        await translateRender(language);
        await translateMain(language);
    }
}

var args = process.argv.splice(2);
if (args.length == 0) {
    console.error(
        "Please provide the language(s) to be translated, for example: node ./translate.js all"
    );
} else {
    let languageNeeded = [];
    if (args.length == 1 && args[0] == "all") {
        for (key in languages) {
            languageNeeded.push(key);
        }
    } else {
        for (language of args) {
            if (languages[language]) {
                languageNeeded.push(language);
            } else {
                console.log(`Unsupported language: ${language}`);
            }
        }
    }

    if (languageNeeded.length > 0) {
        translateWithLanguages(languageNeeded);
    }
}
