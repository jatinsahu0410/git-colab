"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadGithubRepo = exports.checkCredits = void 0;
// basically this function is use to fetch the faults in th github url by taking guithub url as input
var github_1 = require("@langchain/community/document_loaders/web/github");
// import { db } from "@/server/db";
var octokit_1 = require("octokit");
var getFileCount = function (path_1, octokit_2, githubOwner_1, githubRepo_1) {
    var args_1 = [];
    for (var _i = 4; _i < arguments.length; _i++) {
        args_1[_i - 4] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([path_1, octokit_2, githubOwner_1, githubRepo_1], args_1, true), void 0, function (path, octokit, githubOwner, githubRepo, acc) {
        var data, fileCount, directories, _a, data_1, item, directoryCount;
        if (acc === void 0) { acc = 0; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, octokit.rest.repos.getContent({
                        owner: githubOwner,
                        repo: githubRepo,
                        path: path
                    })];
                case 1:
                    data = (_b.sent()).data;
                    if (!Array.isArray(data) && data.type === 'file') {
                        return [2 /*return*/, acc + 1];
                    }
                    if (!Array.isArray(data)) return [3 /*break*/, 4];
                    fileCount = 0;
                    directories = [];
                    for (_a = 0, data_1 = data; _a < data_1.length; _a++) {
                        item = data_1[_a];
                        if (item.type === 'dir') {
                            directories.push(item.path);
                        }
                        else {
                            fileCount++;
                        }
                    }
                    if (!(directories.length > 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, Promise.all(directories.map(function (dirPath) {
                            return getFileCount(dirPath, octokit, githubOwner, githubRepo, 0);
                        }))];
                case 2:
                    directoryCount = _b.sent();
                    // Fix: Ensure reduce processes an array of numbers
                    fileCount += directoryCount.reduce(function (acc, count) { return acc + count; }, 0);
                    _b.label = 3;
                case 3: return [2 /*return*/, acc + fileCount];
                case 4: return [2 /*return*/, acc];
            }
        });
    });
};
var checkCredits = function (githubUrl, githubToken) { return __awaiter(void 0, void 0, void 0, function () {
    var octokit, githubOwner, githubRepo, fileCount;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                octokit = new octokit_1.Octokit({ auth: githubToken });
                githubOwner = githubUrl.split('/')[3];
                githubRepo = githubUrl.split('/')[4];
                if (!githubOwner || !githubRepo)
                    return [2 /*return*/, 0];
                return [4 /*yield*/, getFileCount('', octokit, githubOwner, githubRepo, 0)];
            case 1:
                fileCount = _a.sent();
                return [2 /*return*/, fileCount];
        }
    });
}); };
exports.checkCredits = checkCredits;
var loadGithubRepo = function (githubUrl, githubToken) { return __awaiter(void 0, void 0, void 0, function () {
    var loader, docs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                loader = new github_1.GithubRepoLoader(githubUrl, {
                    accessToken: githubToken || '',
                    branch: 'main',
                    ignoreFiles: ['packages-lock.json', 'yarn-lock', 'pnpm-lock.yaml', 'bun-lockb'],
                    recursive: true,
                    unknown: 'warn',
                    maxConcurrency: 5
                });
                return [4 /*yield*/, loader.load()];
            case 1:
                docs = _a.sent();
                return [2 /*return*/, docs];
        }
    });
}); };
exports.loadGithubRepo = loadGithubRepo;
console.log(await (0, exports.loadGithubRepo)('https://github.com/jatinsahu0410/skilify_intern_assignment'));
// // generate the embeddings 
// export const genEmbeddings = async (docs: Document[]) => {
//     return await Promise.all(docs.map(async doc => {
//         const summary = await summariesCode(doc);
//         const embedding = await generateEmbeddings(summary!)
//         return {
//             summary,
//             embedding,
//             sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
//             fileName: doc.metadata.source
//         }
//     }))
// }
// export const indexGithubRepo = async (projectId: string, githubUrl: string, githubToken?: string) => {
//     const docs = await loadGithubRepo(githubUrl, githubToken);
//     const allEmbeddings = await genEmbeddings(docs);
//     console.log("Print all the embeddings : ", allEmbeddings);
//     await Promise.allSettled(allEmbeddings.map(
//         async (embedding, index) => {
//             console.log(`Processing index ${index} of ${allEmbeddings.length}`)
//             if (!embedding) return;
//             // insert into the db 
//             const sourceEmbeddings = await db.sourcecodeEmbedd.create({
//                 data: {
//                     summary: embedding.summary!,
//                     sourceCode: embedding.sourceCode,
//                     fileName: embedding.fileName,
//                     projectId,
//                 }
//             });
//             // well as the prisma don't allow push the vector directly so we have to use raw SQL quert to insert the embeddings 
//             await db.$executeRaw`
//             UPDATE "sourcecodeEmbedd"
//             SET "summaryEmbedded" = ${embedding.embedding}::vector
//             WHERE "id" = ${sourceEmbeddings.id}
//             `
//         }
//     ))
// }
