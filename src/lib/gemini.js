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
Object.defineProperty(exports, "__esModule", { value: true });
exports.summariesCode = exports.genSummariesCommit = void 0;
exports.generateEmbeddings = generateEmbeddings;
var generative_ai_1 = require("@google/generative-ai");
var MODEL_NAME = "gemini-1.5-flash";
var API_KEY = process.env.GEMINI_API_KEY;
var genAi = new generative_ai_1.GoogleGenerativeAI(API_KEY);
var model = genAi.getGenerativeModel({
    model: MODEL_NAME,
});
var genSummariesCommit = function (diff) { return __awaiter(void 0, void 0, void 0, function () {
    var res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, model.generateContent([
                    "You are an  expert Programmer, and you are trying to summaries a git diff.\n        Reminders about the git diff format:\n        For every file, there are few metadata lines, like (for example):\n        '''\n        diff --git a/lib/index.js b/lib/index.js\n        index aaf001..bef003 1006063\n        ---a/lib/index.js\n        +++b/lib/index.js\n        '''\n        This means that 'lib/index.js' was modified in the commit. Note that this is the only an example.\n        Then there is a specifier of the lines that were modified.\n        A line starting with \\ means it was added.\n        A line that starting with - means that line was deleted.\n        A line that starts with neither + nor - is code given for context and better understanding.\n        It is not part of the diff.\n        [...]\n        EXAMPLE SUMMARY COMMENTS:\n        '''\n        *Raised the amount of returned recordings from '10'to '100' [packages/server/recordings_opi.ts], [packages/server/constants.ts]\n        *Fixed a typo in the github action name [.github/workflows/gpt-commit-summarizer.yml]\n        *Moved the l'octokit initialization to a separote file [src/actokit.ts], [src/index.ts]\n        *Added an OpenAI API for completions (packages/utils/apis/openai.ts)\n        *Lowered numeric tolerance for test files\n        '''\n        Most commits will have less comments than this examples list.\n        The last comment does not include the file names.\n        because there were more than two relevant files in the hypothetical commit.\n        Do not include parts of the example in your summary.\n        It is given only as an example of appropriate comments...\n            Please summarise the following diff file: \n\n".concat(diff, ", ")
                ])];
            case 1:
                res = _a.sent();
                // const res = await model.generateContent('HI');
                console.log("The gemini response : ", res.response);
                return [2 /*return*/, res.response];
        }
    });
}); };
exports.genSummariesCommit = genSummariesCommit;
// genSummariesCommit('no');
// summaries the code from the github 
var summariesCode = function (doc) { return __awaiter(void 0, void 0, void 0, function () {
    var code, res;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                console.log("getting the summary for : ", doc.metadata.source);
                code = doc.pageContent.slice(0, 10000);
                return [4 /*yield*/, model.generateContent([
                        "You are an intelligent after software engineer who specialises in onboarding junior software engineers onto projects,\n        You are onboarding a junior software engineer and explaining to them the purpose of the ".concat(doc.metadata.source, " file.\n        Here is the code:\n        ----\n        ").concat(code, "\n        ----\n\n        Give a summary not more than 100 words of the above code.\n        ")
                    ])];
            case 1:
                res = _c.sent();
                return [2 /*return*/, res.response.candidates ? (_b = (_a = res.response.candidates[0]) === null || _a === void 0 ? void 0 : _a.content.parts[0]) === null || _b === void 0 ? void 0 : _b.text : ""];
        }
    });
}); };
exports.summariesCode = summariesCode;
// for generating the embeddings 
function generateEmbeddings(summary) {
    return __awaiter(this, void 0, void 0, function () {
        var model, res, embedding;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    model = genAi.getGenerativeModel({
                        model: "text-embedding-004"
                    });
                    return [4 /*yield*/, model.embedContent(summary)];
                case 1:
                    res = _a.sent();
                    embedding = res.embedding;
                    // console.log("The vector is : ", embedding.values);
                    return [2 /*return*/, embedding.values];
            }
        });
    });
}
