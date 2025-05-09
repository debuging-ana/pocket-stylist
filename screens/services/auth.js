//Firebase authentication logic (login/signup/reset)

import { getAuth } from 'firebase/auth';
import { app } from '../../firebaseConfig';

export const auth = getAuth(app);

