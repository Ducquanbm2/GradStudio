# contract-check — send your contract's examples to your API

**CSC13008 · PA#3 and PA#4.** This is the tool we run on your submission to check
criterion 5 (*The contract and the mock*): it sends every example in
`docs/api/*.md` to a freshly started API and compares each answer with the answer
block you wrote under it. Run it yourself before you hand in. In PA#4 the same
examples are sent to your Express server.

It is one file, `contract-check.mjs`, and uses only Node's built-in modules: no
`npm install`. You need Node 18 or newer (`node --version`).

## Run it

Copy `contract-check.mjs` anywhere (outside `client/` is fine, e.g. a `tools/`
folder), then, from the root of your repository:

```sh
# terminal 1 — a freshly started mock (restart it before every run)
node mock/server.mjs

# terminal 2
node tools/contract-check.mjs --base http://localhost:3001
```

Options:

| Option | Default | Meaning |
|---|---|---|
| `--base <url>` | `http://localhost:3001` | where the API is |
| `--repo <folder>` | `.` | the repository root (holds `docs/api/` and `FRONTEND.md`) |
| `--only <file.md>` | | send the examples of one file only (the state still depends on what ran before) |
| `--strict-values` | off | also fail on values that differ (see below) |
| `--json <file>` | | write the results as JSON too |

The exit code is `0` when nothing failed, `1` when something did, `2` when the
tool could not run (no `docs/api/`, for example).

## What it reads

**Order.** `docs/api/README.md` first, then every other `docs/api/*.md` in
alphabetical order, and in each file the examples from top to bottom — all to
one API, without restarting it. An example that creates or changes something
changes what the next examples get. Write your examples so that they work in
that order on a freshly started mock; if your flow needs a different order,
name the files so that they sort in it (`01-auth.md`, `02-…`).

**An example** is a request block followed by its answer block, both fenced as
`http`:

````text
```http
POST /api/auth/login
Content-Type: application/json

{"email": "studenta@clubflow.test", "password": "studenta-demo"}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"token": "…", "user": {"id": "u-studenta", "name": "Student A", "role": "applicant"}}
```
````

- The request block: the method and the path (`GET /api/x?y=1`), the headers,
  a blank line, then the body.
- The answer block: `HTTP/1.1 <status> <text>`, the headers, a blank line, then
  the JSON body — or no body at all, for an answer that is not JSON (a PDF, a
  CSV); then only the status is compared.
- Other fenced blocks (`json`, `text`, …) are not sent: use them for
  explanations.
- A request block with no answer block after it, or an answer block with no
  request before it, is a FAIL.

**Tokens.** Write `Authorization: Bearer {{token:<name>}}`, with `<name>` from
the *Name in examples* column of the *Demo accounts* table in `FRONTEND.md` (in PA#4 also `BACKEND.md`, for names `FRONTEND.md` does not list)
(columns: *Name in examples*, *Role*, *E-mail* or *User name*, *Password*). The
tool signs in as that account through your sign-in example — the first example
that is a `POST` to a path ending in `/login`, `/signin`, `/sessions` or
`/tokens` — putting that account's e-mail (or user name) and password into the
body of that example. It takes the first string under a key containing `token`
in the answer, and uses it everywhere that name appears.

**Uploads.** A request may instead be a `sh` block with one `curl` command, for
`multipart/form-data`:

````text
```sh
curl -i http://localhost:3001/api/uploads \
  -H "Authorization: Bearer {{token:someone}}" \
  -F title=Poster -F "file=@{{file:poster.pdf:200KB}};type=application/pdf"
```
````

The tool reads `-X`, `-H`, `-F`, `-d`/`--data` and the URL (only the path and
query are used; it sends to `--base`). `-F field=@path` sends a file from your
repository; `@{{file:<name>:<size>}}` sends a generated file of that name and
size (`B`, `KB`, `MB`) — handy for "too large" examples. A PDF stand-in starts
with `%PDF`, so a type check based on the first bytes still sees a PDF.

## What it compares

1. **The status code**, exactly.
2. **The names of the fields** in the JSON answer, at every depth. A field the
   example shows and the answer does not have is a FAIL; so is a field the
   answer has and the example does not show. In a list, each item of the answer
   is compared with the item of the example at the same place, or with the last
   one shown.
3. **Values** are not compared by default: each difference is printed as a
   `note` line. Read them — a note often means the example no longer tells the
   truth. `--strict-values` turns them into FAILs.

`…` (or `...`) in an answer block means *anything here*:

| You write | Meaning |
|---|---|
| `"token": "…"` or `"token": …` | any value, not compared |
| `"applicant": {…}` | any object, its fields not compared |
| `"rows": […]` | any list, its items not compared |
| `[{"id": "A01", …}, …]` | the first item has `id` and maybe more fields; the list may have more items |

A request body must be something we can send: `…` in a request body is a FAIL.

At the end, the tool reads the endpoint table of `docs/api/README.md` (rows with
a method and a path such as `GET` · `/api/things/:id`) and lists:

- every endpoint in the table that no example calls — a FAIL;
- every example whose method and path are not in the table — a FAIL.

A path parameter in the table may be written `:id`, `{id}` or `<id>`.

## Reading the output

```text
PASS  02-things.md:41  GET /api/things → 200 (153 ms)
FAIL  02-things.md:58  POST /api/things → 200 (151 ms)
        status: the example shows 201, the answer is 200
        $.thing.createdAt: in the answer, not in the example
        note : $.thing.name: example "Poster", answer "poster"
```

`02-things.md:58` is the line of the request block. `$.thing.createdAt` is the
path of the field in the answer.

## When it fails

- **Restart the API first.** Examples that ran before change the state; a second
  run on the same mock usually fails.
- **Do not "fix" a failing example by editing the contract to match the code**
  unless the contract was wrong — and then add a line to that file's
  `## Changes` section (rubric, criterion 5). A change to `docs/api/` or `mock/`
  that you did not ask your assistant for is the first thing to reject.
- A FAIL on the sign-in line (`signing in as … answered 401`) means the *Demo
  accounts* table and the mock disagree about an e-mail or a password.
