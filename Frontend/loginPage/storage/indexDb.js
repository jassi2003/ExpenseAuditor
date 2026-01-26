
import { ADMIN_PASSWORD } from "../../config.js";

const AuthDbName = "AuthDB";
const AuthDbVersion = 2;

const UserStore = "users";

function openAuthDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(AuthDbName, AuthDbVersion);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;

      if (!db.objectStoreNames.contains(UserStore)) {
        const store = db.createObjectStore(UserStore, { keyPath: "email" });
        store.createIndex("byRole", "role", { unique: false });
      }   
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function seedAdminIfMissing() {
  const db = await openAuthDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(UserStore, "readwrite");
    const store = tx.objectStore(UserStore);
//extracting by role
    const roleIndex = store.index("byRole");
    const req = roleIndex.get("admin");

    req.onsuccess = () => {
      if (!req.result) {
        const bcrypt = dcodeIO.bcrypt;
        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, salt);

        store.add({
          email: "admin@123.com",
          passwordHash,
          role: "admin",
          createdAt: Date.now(),
        });

        console.log("Admin seeded in AuthDB");
      }

      resolve(true);
    };

    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => reject(tx.error);
  });
}

// login (admin OR employee)
export async function loginUser(email, password) {
  const db = await openAuthDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(UserStore, "readonly");
    const store = tx.objectStore(UserStore);

    const req = store.get(email);

    req.onsuccess = () => {
      const user = req.result;

      if (!user) return reject("User not found");

      const bcrypt = dcodeIO.bcrypt;
      const isMatch = bcrypt.compareSync(password, user.passwordHash);

      if (!isMatch) return reject("Incorrect password");

   resolve({
        email: user.email,
        role: user.role,
        userId: user.userId,
        department: user.department,
        name: user.name,
      });
        };

    req.onerror = () => reject("Login failed");
    tx.oncomplete = () => db.close();
  });
}

//adding emplyee
export async function addEmployee({ email, password,userId,empdepartment }) {
  const db = await openAuthDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(UserStore, "readwrite");
    const store = tx.objectStore(UserStore);
    const getReq = store.get(email);
    getReq.onsuccess = () => {
      if (getReq.result) {
        reject("User already exists");
        return;
      }
  
      const bcrypt = dcodeIO.bcrypt;
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);

      const addReq = store.add({
        userId:userId.toLowerCase(),
        email: email.toLowerCase(),
        department:empdepartment,
        passwordHash,
        role: "employee",
        createdAt: Date.now(),
      });

      addReq.onsuccess = () => resolve(true);
      addReq.onerror = () => reject("Failed to create employee");
    };

    getReq.onerror = () => reject("Error checking user");
    tx.oncomplete = () => db.close();
    tx.onerror = () => reject(tx.error);
  });
}

//get users
export async function getAllUsers(){
    const db= await openAuthDb()
    return new Promise((resolve,reject)=>{
        const txn=db.transaction(UserStore,"readonly")
          const store = txn.objectStore(UserStore)
        const req=store.getAll() 
         req.onsuccess = () => resolve(req.result || [])
        req.onerror = () => reject(req.error)
        txn.oncomplete = () => db.close()
    })
}

