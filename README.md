# ห้องเรียน — Firebase edition

เว็บติดตามงานนักเรียนภาษาไทย ธีมพาสเทล รองรับหน้าจอเล็ก พร้อมโฟลเดอร์ชั้นเรียน รายวิชา งานที่มอบหมาย ส่งคำตอบ/ลิงก์ ตารางคะแนน และการตรวจงานของครู

This is a standalone Firebase edition, ready to upload to your own GitHub repository. It uses Firebase Authentication and Cloud Firestore. It does not require ChatGPT sign-in. Your Firebase web configuration is already in `lib/firebase.ts`.

## 1. เปิดบริการ Firebase

Open https://console.firebase.google.com/project/studentworkmanager-23a63/overview

1. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable → Save.** Email link sign-in is not needed.
2. **Build → Firestore Database → Create database**. Choose the default database, a suitable region, and **Production mode**. Do not select open test rules.
3. In Firestore **Rules**, replace the contents with `firestore.rules` and click **Publish**. Alternatively deploy using the CLI below. These rules deny unapproved accounts and prevent students from changing grades or reading other students' work.

## 2. สร้างบัญชีครูและนักเรียน

Accounts are provisioned by the project administrator. There is no public registration or self-selection of teacher privileges.

### First teacher

1. Authentication → Users → Add user. Enter the teacher's real email and a private password.
2. Copy the new account's **User UID**.
3. Firestore → Start collection → Collection ID: `users`.
4. Create a document whose **Document ID is exactly that UID**. Add these string fields:
   - `name`: teacher's display name
   - `role`: `teacher`
5. Teacher signs in using that email and password.

### Student username sign-in

For a student whose chosen username or student ID is `65001`:

1. Authentication → Users → Add user.
2. Email: `65001@studentworkmanager-23a63.students.invalid`.
3. Choose a separate private password (at least 10 characters recommended), then copy the UID.
4. Create `users/{UID}` in Firestore with string fields `name` (student's display name) and `role` = `student`.
5. The student enters **65001** and their password in the app. The app constructs the internal email alias; the student does not need an email inbox.

Usernames use lowercase English letters, numbers, dots, underscores and hyphens. Use unique usernames; use the same spelling in the internal email. The alias domain has no mailbox. Give credentials privately. Student IDs are suitable usernames, but should not be used as passwords because they are often known by others. Users can change their password in the app; a first-login change is not forcibly enforced. If a password is forgotten, the administrator must reset it using Firebase Admin tooling, or delete/recreate the Auth account **with the same UID using Admin tooling** to retain links; do not casually recreate it in the Console with a new UID. Real-email teacher accounts can also use Firebase's Console password-reset email action.

## 3. เรียกใช้และเผยแพร่

Install Node.js 22.13 or newer in the Node 22 series on your computer, unzip this folder, and open a terminal inside it:

```sh
npm ci
npm run dev
```

Open the local URL shown by Vite. For hosting:

```sh
npm run build
npm install -g firebase-tools
firebase login
firebase use studentworkmanager-23a63
firebase deploy --only firestore:rules,hosting
```

`.firebaserc` already selects your project and `firebase.json` serves the built SPA with route fallback. The CLI prints your deployed URL. These commands require an account authorized for your Firebase project. No service account key needs to be shared in chat or committed to GitHub.

## 4. ทดลองครบหนึ่งรอบก่อนใช้จริง

1. Sign in as teacher. Create a class (e.g. ม.2/12) and its first subject. Open that folder and add more subjects with **เพิ่มวิชา**.
2. Open a subject, create an assignment, and copy its join code.
3. In another browser/private window, sign in as a student. Join using the code. Enrollment is **per subject**; students join each relevant subject. Subjects with the same section appear in one folder.
4. Submit an answer or document link. Return to teacher and refresh the subject. Open **รอตรวจ**, enter a score and feedback, and save.
5. Refresh the student's page. The score appears under **คะแนนของฉัน**. Graded submissions cannot be edited.
6. Try a second student: they must not see the first student's answer or grade. Try a second teacher: they must not read or grade the first teacher's submissions.

Data is loaded on sign-in and refresh, and after saving; it is not a live subscription. The header/subject refresh button reloads current data. A stale page may need refreshing when another user submits or grades.

## GitHub

Create an empty repository and upload this folder's source, including `.firebaserc`, `.gitignore`, `firestore.rules`, `firebase.json`, and `package-lock.json`. Do not upload `node_modules`, private credentials, or student exports. The Firebase web config is public client configuration; security comes from Auth and database rules. GitHub stores your source; Firebase Hosting serves this application.

## Scope and verification

- Starts with empty Firebase data. Existing Sites records are not migrated and the old hosted Site is unchanged.
- Student text answers, document URLs, classes, assignment metadata and scores are stored in Firestore. Uploaded files are not implemented; linked files remain wherever their owners host them. The Storage bucket in the config is not used.
- Approved users holding a subject's unguessable join code can look up that subject's name, section, owner UID and member UIDs. Student names, submissions and grades are stored separately and access-restricted.
- Provisioning, roster management, deletion, due-date editing, code rotation, bulk import, and automated backups are not in this first version.
- Production build and 26 Firestore emulator authorization checks passed during preparation. Run `npm run test:rules` with Java 17 installed to repeat the rules checks against a local demo project. Real-project login, writes and deployment require your Firebase setup; no live student records were created during preparation.

Official references: https://firebase.google.com/docs/web/setup · https://firebase.google.com/docs/auth/web/password-auth · https://firebase.google.com/docs/firestore/security/get-started · https://firebase.google.com/docs/hosting/quickstart
