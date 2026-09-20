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

### Student accounts — teacher tab

After deploying the function below, sign in as teacher → **จัดการนักเรียน** → enter **USERNAME** and **PASSWORD**, plus an optional display name → **สร้างบัญชีนักเรียน**. This creates both Firebase Authentication and the Firestore profile automatically without signing the teacher out. Students type only their username and password. Usernames must be unique across the whole project; use 3–40 lowercase English letters/numbers/dots/underscores/hyphens. Passwords are 10–128 characters and must also meet any Firebase password policy you enable.

Each student profile receives `teacherId` from the authenticated teacher, never from the form. Other teachers cannot read that profile. Students can join only that teacher's subjects. Passwords are sent to Firebase Auth through the server function and are never stored in Firestore, returned by the function, or shown in the roster. Give students their initial credentials privately. Password reset from the teacher tab and bulk import are not yet included.

**Existing manually created students:** add a string `teacherId` containing their teacher's Firebase Auth UID to each `users/{studentUID}` document before deploying these rules. Without it, existing students cannot access subject content. Review any old cross-teacher memberships and remove stale memberships using the Console. Teacher accounts are still provisioned manually by the administrator; students cannot promote themselves.

## 3. เรียกใช้และเผยแพร่

Install Node.js 22.13 or newer in the Node 22 series on your computer, unzip this folder, and open a terminal inside it:

```sh
npm ci
npm run dev
```

Open the local URL shown by Vite. **One-time requirement:** deploying Cloud Functions requires the Firebase Blaze pay-as-you-go billing plan. Enable it in Firebase Console before deploying; usage charges can apply. Set budget alerts. This package does not enable billing or deploy anything automatically. See https://firebase.google.com/docs/functions/get-started .

For hosting and the account-creation function:

```sh
npm run build
npm ci --prefix functions
npm install -g firebase-tools
firebase login
firebase use studentworkmanager-23a63
firebase deploy --only firestore:rules,functions,hosting
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
- The owning teacher and their linked students holding a subject's unguessable join code can look up that subject's name, section, owner UID and member UIDs. Student names, submissions and grades are stored separately and access-restricted.
- Teacher-created student accounts and a teacher-specific roster are included. Deletion, teacher password reset, due-date editing, code rotation, bulk import, and automated backups are not included.
- Production build and 31 Firestore emulator authorization checks and account-creation integration checks passed during preparation. Run `npm run test:rules` and `npm run test:accounts` with Java 17 installed to repeat the rules checks against a local demo project. Real-project login, writes and deployment require your Firebase setup; no live student records were created during preparation.

Official references: https://firebase.google.com/docs/web/setup · https://firebase.google.com/docs/auth/web/password-auth · https://firebase.google.com/docs/firestore/security/get-started · https://firebase.google.com/docs/hosting/quickstart

## Classroom management update

Open a class folder → จัดการห้องเรียน. Rename the folder and its subjects, delete an individual subject or the entire folder, or remove a student from every subject in the folder. Only the owning teacher can make these changes. Removal does not delete the Firebase Auth account or historical work; the student is blocked from rejoining those subjects. Deletion is recoverable: subject documents get `deleted: true`; their records remain stored and count toward storage usage. An administrator can restore a subject by setting `deleted` to false in the Console. To allow a removed student to rejoin, remove their UID from the subject's `blockedIds` array.

The watermark reads ห้องเรียนครูจุฑารัตน์. Management controls and the watermark require no Cloud Functions. For manual-account/Spark use, deploy only rules and hosting:

```sh
npm run build
firebase deploy --only firestore:rules,hosting
```

The optional account-creation function from the preceding edition is still included in the source, but is not required for these classroom features. Continue provisioning accounts manually if you are not deploying it.
